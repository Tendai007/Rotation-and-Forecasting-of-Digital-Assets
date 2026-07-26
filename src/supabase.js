import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isConfigured = [SUPABASE_URL, SUPABASE_ANON_KEY].every(value => typeof value === 'string' && value.length > 0);

const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const isSupabaseEnabled = Boolean(supabase);

export { supabase, isSupabaseEnabled };

export const safeOnAuthStateChanged = (callback) => {
  if (!isSupabaseEnabled || !supabase) {
    callback(null);
    return () => {};
  }

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    if (listener?.subscription) {
      listener.subscription.unsubscribe();
    }
  };
};

export const signInWithSupabaseEmail = async (email, password) => {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Supabase authentication is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
};

export const signOutSupabase = async () => {
  if (!isSupabaseEnabled || !supabase) {
    return;
  }
  await supabase.auth.signOut();
};

export const signInWithSupabasePhone = async (phone) => {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Supabase authentication is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  if (error) {
    throw error;
  }
  return data;
};

export const verifySupabasePhoneOtp = async (phone, token) => {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Supabase authentication is not configured.');
  }

  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) {
    throw error;
  }
  return data;
};
