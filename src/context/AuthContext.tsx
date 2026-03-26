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
          // fetch agent profile
          const agentPromise = fetchAgent(currentUser.id);
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
        const agentData = await fetchAgent(currentUser.id);
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
