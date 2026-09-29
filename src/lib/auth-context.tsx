import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, Role } from './types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  role: Role | null;
}

interface AuthContextValue extends AuthState {
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    loading: true,
    role: null,
  });

  async function loadProfile(session: Session | null) {
    if (!session?.user) {
      setState({ session: null, profile: null, loading: false, role: null });
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      setState({ session, profile: null, loading: false, role: null });
      return;
    }
    setState({
      session,
      profile: (data as Profile) || null,
      loading: false,
      role: (data as Profile)?.role || null,
    });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        await loadProfile(session);
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (state.session) {
      await loadProfile(state.session);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
