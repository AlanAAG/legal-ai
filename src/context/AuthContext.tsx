import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { DbAgent } from '../lib/types/database.types';
import { mapDbAgentToAgent } from '../lib/mappers';
import type { Agent } from '../types';

interface AuthContextType {
  user: User | null;
  agent: Agent | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; user: User | null }>;
  signOut: () => Promise<void>;
  refreshAgent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the agent profile for a given user ID.
   * Returns null if not found or on error — never throws.
   */
  const fetchAgent = async (userId: string): Promise<Agent | null> => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        return mapDbAgentToAgent(data as DbAgent);
      }
      if (error) {
        console.warn('[AuthContext] fetchAgent error:', error.message);
      }
    } catch (err) {
      console.warn('[AuthContext] fetchAgent exception:', err);
    }
    return null;
  };

  /**
   * Ensure an agent profile exists. If not found, create it from the client.
   * If creation also fails (e.g. RLS), return null gracefully — never hang.
   */
  const ensureAgentProfile = async (authUser: User): Promise<Agent | null> => {
    // Attempt 1: fetch
    let agentData = await fetchAgent(authUser.id);
    if (agentData) return agentData;

    // Small delay for DB trigger
    await new Promise(r => setTimeout(r, 800));
    agentData = await fetchAgent(authUser.id);
    if (agentData) return agentData;

    // Trigger didn't fire — try creating from client
    console.log('[AuthContext] Creating agent profile from client...');
    try {
      const fullName = authUser.user_metadata?.full_name || '';
      const { data, error } = await supabase
        .from('agents')
        .insert({
          id: authUser.id,
          nombre: fullName,
          email: authUser.email || '',
          telefono: '',
          agencia: 'Independiente',
          es_ampi: false
        })
        .select()
        .single();

      if (data && !error) {
        console.log('[AuthContext] Agent profile created successfully');
        return mapDbAgentToAgent(data as DbAgent);
      }

      if (error) {
        // Unique constraint violation = trigger fired late, fetch again
        if (error.code === '23505') {
          return await fetchAgent(authUser.id);
        }
        console.error('[AuthContext] Insert agent failed:', error.message, error.code);
      }
    } catch (err) {
      console.error('[AuthContext] Insert agent exception:', err);
    }

    // Everything failed — return null, don't hang
    console.warn('[AuthContext] Could not create agent profile. User will see fallback UI.');
    return null;
  };

  // Public method to refresh agent data (e.g., after profile update)
  const refreshAgent = useCallback(async () => {
    if (user) {
      const agentData = await fetchAgent(user.id);
      if (agentData) {
        setAgent(agentData);
      }
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      // Fail-safe: Never let the app hang indefinitely
      const timeoutId = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('[AuthContext] Loading timed out after 10s. Forcing ready state.');
          setLoading(false);
        }
      }, 10000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // fetch agent without awaiting it indefinitely for the 'loading' state
          // but we still want to try to have it before we stop loading if possible
          const agentPromise = ensureAgentProfile(currentUser);
          const timeoutPromise = new Promise<null>(r => setTimeout(() => r(null), 5000)); // 5s max wait for agent fetch
          
          const agentData = await Promise.race([agentPromise, timeoutPromise]);
          if (isMounted) setAgent(agentData);
        }
      } catch (err) {
        console.warn('[AuthContext] Init failed:', err);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    // Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const agentData = await ensureAgentProfile(currentUser);
        if (isMounted) setAgent(agentData);
      } else {
        setAgent(null);
      }
      
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { error, user: data?.user ?? null };
  };

  const signOut = async () => {
    setAgent(null);
    setUser(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, agent, loading, signIn, signUp, signOut, refreshAgent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
