import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean; // состояние аутентификации/сессии
  profileLoading: boolean; // отдельная загрузка профиля
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    profileLoading: false,
  });

  const ensureProfile = useCallback(async (user: User) => {
    const userId = user.id;

    // maybeSingle() не кидает ошибку, если данных нет — просто вернёт data: null
    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('Error fetching profile:', selectError);
      return null;
    }

    if (existing) return existing as Profile;

    // Если профиля нет (например, старые аккаунты/сбой триггера) — создаём.
    const displayName =
      (user.user_metadata as any)?.display_name ||
      (user.email ? user.email.split('@')[0] : null) ||
      'Игрок';

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({ user_id: userId, display_name: displayName })
      .select('*')
      .maybeSingle();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return null;
    }

    return inserted as Profile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authState.user) return null;
    setAuthState(prev => ({ ...prev, profileLoading: true }));

    try {
      const profile = await ensureProfile(authState.user);
      setAuthState(prev => ({ ...prev, profile, profileLoading: false }));
      return profile;
    } catch (e) {
      console.error('refreshProfile failed:', e);
      setAuthState(prev => ({ ...prev, profileLoading: false }));
      return null;
    }
  }, [authState.user, ensureProfile]);

  useEffect(() => {
    let isMounted = true;

    const startProfileLoad = (user: User) => {
      // Важно: не блокируем UI на ожидании профиля
      setAuthState(prev => ({ ...prev, profileLoading: true }));
      void (async () => {
        const profile = await ensureProfile(user);
        if (!isMounted) return;
        setAuthState(prev => ({ ...prev, profile, profileLoading: false }));
      })();
    };

    // 1) подписка на изменения
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State changed:', event);

      if (!isMounted) return;

      if (session?.user) {
        // Сессию выставляем сразу
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          loading: false,
        }));
        startProfileLoad(session.user);
      } else {
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          profileLoading: false,
        });
      }
    });

    // 2) текущая сессия
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;

        if (session?.user) {
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session,
            loading: false,
          }));
          startProfileLoad(session.user);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      })
      .catch((e) => {
        console.error('getSession failed:', e);
        if (!isMounted) return;
        setAuthState(prev => ({ ...prev, loading: false }));
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmed`,
        data: {
          display_name: displayName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!authState.user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', authState.user.id)
      .select()
      .single();

    if (!error && data) {
      setAuthState(prev => ({ ...prev, profile: data as Profile }));
    }

    return { data, error };
  };

  const uploadAvatar = async (file: File) => {
    if (!authState.user) return { error: new Error('Not authenticated'), url: null };

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${authState.user.id}/avatar.${fileExt}`;

    console.log('[Avatar] Uploading to:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('[Avatar] Upload error:', uploadError);
      return { error: uploadError, url: null };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Добавляем timestamp для сброса кеша
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
    console.log('[Avatar] Public URL:', urlWithCacheBust);

    // Обновляем профиль с новым URL
    const { error: updateError } = await updateProfile({ avatar_url: urlWithCacheBust });
    
    if (updateError) {
      console.error('[Avatar] Profile update error:', updateError);
      return { error: updateError, url: null };
    }

    return { error: null, url: urlWithCacheBust };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar,
    refreshProfile,
    isAuthenticated: !!authState.user,
  };
};
