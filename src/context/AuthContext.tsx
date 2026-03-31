import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track if we are currently fetching an agent to prevent overlapping calls
  const isFetchingRef = useRef(false);

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
    } catch (err) {
      console.warn('[AuthContext] fetchAgent failed:', err);
    }
    return null;
  };

  const refreshAgent = useCallback(async () => {
    if (user && !isFetchingRef.current) {
      isFetchingRef.current = true;
      const agentData = await fetchAgent(user.id);
      setAgent(agentData);
      isFetchingRef.current = false;
    }
  }, [user]);

  // Safety global timeout for initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInitialized) {
        console.warn('[AuthContext] Global initialization timeout (15s). Forcing ready.');
        setLoading(false);
        setIsInitialized(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [isInitialized]);

  useEffect(() => {
    let isMounted = true;

    const handleSession = async (sessionUser: User | null) => {
      if (!isMounted) return;
      
      setUser(sessionUser);
      
      if (sessionUser) {
        let agentData = await fetchAgent(sessionUser.id);
        
        // Handle potential delay in trigger for new accounts
        if (!agentData && isMounted) {
          await new Promise(r => setTimeout(r, 1500));
          if (isMounted) agentData = await fetchAgent(sessionUser.id);
        }
        
        if (isMounted) setAgent(agentData);
      } else {
        if (isMounted) setAgent(null);
      }

      if (isMounted) {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        handleSession(session?.user ?? null);
      }
    }).catch(err => {
      console.error('[AuthContext] Session check failed:', err);
      if (isMounted) {
        setLoading(false);
        setIsInitialized(true);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        handleSession(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
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
    <AuthContext.Provider value={{ user, agent, loading, signIn, signUp, signOut, refreshAgent, isInitialized }}>
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
