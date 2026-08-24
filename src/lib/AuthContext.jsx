import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';

const AuthContext = createContext({
  session: null,
  user: null,
  ready: !supabase,
  signIn: async () => ({ error: new Error('Supabase nije spojen') }),
  signOut: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return undefined;

    let ignore = false;

    supabase.auth.getSession().then(({ data }) => {
      if (ignore) return;
      setSession(data.session ?? null);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });

    return () => {
      ignore = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      ready,
      signIn: (email, password) => {
        if (!supabase) return Promise.resolve({ error: new Error('Supabase nije spojen') });
        return supabase.auth.signInWithPassword({ email, password });
      },
      signOut: () => (supabase ? supabase.auth.signOut() : Promise.resolve())
    }),
    [session, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
