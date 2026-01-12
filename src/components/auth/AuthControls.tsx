import React, { useEffect, useMemo, useState } from "react";
import { LogIn, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileModal } from "@/components/profile/ProfileModal";

type AuthControlsProps = {
  className?: string;
};

export const AuthControls: React.FC<AuthControlsProps> = ({ className }) => {
  const {
    isAuthenticated,
    user,
    profile,
    loading: authLoading,
    profileLoading,
    refreshProfile,
  } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Если авторизованы, но профиль не подгрузился (или был очищен) — пробуем подтянуть его ещё раз.
  useEffect(() => {
    if (isAuthenticated && !authLoading && !profile && !profileLoading) {
      void refreshProfile();
    }
  }, [isAuthenticated, authLoading, profile, profileLoading, refreshProfile]);

  const displayName = useMemo(() => {
    if (profile?.display_name) return profile.display_name;
    if (user?.email) return user.email.split("@")[0];
    return "Аккаунт";
  }, [profile?.display_name, user?.email]);

  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div className={className}>
      {authLoading ? (
        <div className="w-10 h-10 rounded-full bg-amber-700/50 animate-pulse" />
      ) : isAuthenticated ? (
        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-700/80 hover:bg-amber-700 transition-colors text-white"
          aria-label="Открыть профиль"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
              <UserIcon className="h-4 w-4" />
            </div>
          )}
          <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
            {displayName}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-700/80 hover:bg-amber-700 transition-colors text-white text-sm font-medium"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Войти</span>
        </button>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
};
