import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { toast } from 'sonner';
import { Loader2, Camera, Trophy, Target, TrendingUp, Trash2, Award, Route, RefreshCw, Train, Star, Medal, Crown, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Система рангов (ММР на основе побед)
const RANKS = [
  { name: 'Новичок', minWins: 0, icon: '🎫', color: 'text-gray-500', tier: 'bronze' },
  { name: 'Пассажир', minWins: 3, icon: '🧳', color: 'text-amber-700', tier: 'bronze' },
  { name: 'Кочегар', minWins: 7, icon: '🔥', color: 'text-orange-600', tier: 'bronze' },
  { name: 'Помощник машиниста', minWins: 12, icon: '🔧', color: 'text-slate-600', tier: 'silver' },
  { name: 'Машинист III класса', minWins: 20, icon: '🚃', color: 'text-blue-500', tier: 'silver' },
  { name: 'Машинист II класса', minWins: 30, icon: '🚂', color: 'text-blue-600', tier: 'silver' },
  { name: 'Машинист I класса', minWins: 45, icon: '⭐', color: 'text-amber-500', tier: 'gold' },
  { name: 'Старший машинист', minWins: 65, icon: '🌟', color: 'text-amber-600', tier: 'gold' },
  { name: 'Инспектор депо', minWins: 90, icon: '🎖️', color: 'text-purple-500', tier: 'platinum' },
  { name: 'Начальник депо', minWins: 120, icon: '🏅', color: 'text-purple-600', tier: 'platinum' },
  { name: 'Начальник станции', minWins: 160, icon: '🏆', color: 'text-yellow-500', tier: 'diamond' },
  { name: 'Директор железных дорог', minWins: 220, icon: '👑', color: 'text-gold', tier: 'diamond' },
  { name: 'Железнодорожный магнат', minWins: 300, icon: '💎', color: 'text-cyan-400', tier: 'master' },
  { name: 'Легенда рельсов', minWins: 500, icon: '🌠', color: 'text-rose-500', tier: 'legend' },
];

const TIER_STYLES: Record<string, { bg: string; border: string; glow: string }> = {
  bronze: { bg: 'from-amber-800/20 to-amber-900/10', border: 'border-amber-700', glow: '' },
  silver: { bg: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400', glow: '' },
  gold: { bg: 'from-yellow-500/30 to-amber-500/20', border: 'border-yellow-500', glow: 'shadow-yellow-500/30' },
  platinum: { bg: 'from-purple-500/25 to-indigo-500/15', border: 'border-purple-400', glow: 'shadow-purple-500/30' },
  diamond: { bg: 'from-cyan-400/30 to-blue-500/20', border: 'border-cyan-400', glow: 'shadow-cyan-400/40' },
  master: { bg: 'from-cyan-300/35 to-teal-400/25', border: 'border-cyan-300', glow: 'shadow-cyan-300/50' },
  legend: { bg: 'from-rose-500/30 to-pink-500/20', border: 'border-rose-400', glow: 'shadow-rose-500/50' },
};

const getRank = (wins: number) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (wins >= RANKS[i].minWins) return RANKS[i];
  }
  return RANKS[0];
};

const getNextRank = (wins: number) => {
  for (const rank of RANKS) {
    if (wins < rank.minWins) return rank;
  }
  return null;
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, profileLoading, refreshProfile, updateProfile, uploadAvatar, signOut, syncFromProvider } = useAuth();
  const { matches, stats, loading: historyLoading, fetchMatchHistory, fetchPlayerStats, clearMatchHistory } = useMatchHistory();
  
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'stats'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Проверяем, вошёл ли пользователь через OAuth провайдер
  const hasProviderData = !!(
    (user?.user_metadata as any)?.full_name || 
    (user?.user_metadata as any)?.name ||
    (user?.user_metadata as any)?.avatar_url ||
    (user?.user_metadata as any)?.picture
  );

  const handleSyncFromProvider = async () => {
    setSyncing(true);
    const { error, synced } = await syncFromProvider();
    setSyncing(false);

    if (error) {
      toast.error(error.message || 'Ошибка синхронизации');
    } else if (synced) {
      toast.success('Данные синхронизированы из Google');
      // Обновляем локальный state
      if (profile) {
        setDisplayName(profile.display_name);
      }
    }
  };

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      fetchMatchHistory(profile.id);
      fetchPlayerStats(profile.id);
    }
  }, [profile, fetchMatchHistory, fetchPlayerStats]);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Введите имя игрока');
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({ display_name: displayName.trim() });
    setSaving(false);

    if (error) {
      toast.error('Ошибка сохранения');
    } else {
      toast.success('Профиль обновлён');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 2MB)');
      return;
    }

    setSaving(true);
    const { error } = await uploadAvatar(file);
    setSaving(false);

    if (error) {
      toast.error('Ошибка загрузки');
    } else {
      toast.success('Аватар обновлён');
    }
  };

  const handleClearHistory = async () => {
    if (!profile) return;
    
    const { success } = await clearMatchHistory(profile.id);
    if (success) {
      toast.success('История очищена');
    } else {
      toast.error('Ошибка очистки');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    toast.success('Вы вышли из аккаунта');
  };

  const getPlacementEmoji = (placement: number) => {
    if (placement === 0) return '🚪'; // Покинул игру
    if (placement === -1) return '⚠️'; // Игра не засчитана (кто-то вышел)
    switch (placement) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${placement}`;
    }
  };

  const getPlacementText = (placement: number) => {
    if (placement === 0) return 'Покинул';
    if (placement === -1) return 'Не засчитано';
    return null;
  };

  if (!user) return null;

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg bg-amber-50 border-amber-900/30 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-900 text-center">
              🎫 Профиль игрока
            </DialogTitle>
            <DialogDescription className="text-center text-amber-700">
              {profileLoading ? 'Загружаем профиль…' : 'Профиль пока не загрузился'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center text-amber-800">
            <div className="text-4xl mb-3">🚂</div>
            <p className="text-sm">Если это висит долго — нажмите «Повторить».</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => refreshProfile()}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white"
              disabled={profileLoading}
            >
              {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Повторить загрузку'}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              Выйти из аккаунта
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentRank = getRank(stats?.wins || 0);
  const nextRank = getNextRank(stats?.wins || 0);
  const winsToNext = nextRank ? nextRank.minWins - (stats?.wins || 0) : 0;
  const progressToNext = nextRank 
    ? ((stats?.wins || 0) - currentRank.minWins) / (nextRank.minWins - currentRank.minWins) * 100 
    : 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-transparent border-none max-h-[90vh]">
        {/* Vintage Railway Ticket Design */}
        <div className="relative bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 border-4 border-amber-800 rounded-lg overflow-hidden">
          {/* Perforation effect - top */}
          <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-background rounded-full -translate-y-1" />
            ))}
          </div>
          
          {/* Perforation effect - bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-background rounded-full translate-y-1" />
            ))}
          </div>

          {/* Header with stamp effect */}
          <DialogHeader className="px-6 pt-6 pb-3 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 relative">
            <div className="absolute top-2 right-2 w-16 h-16 border-4 border-red-600 rounded-full flex items-center justify-center rotate-12 opacity-80">
              <div className="text-red-600 font-bold text-[8px] text-center leading-tight">
                VERIFIED<br/>PASSENGER
              </div>
            </div>
            <DialogTitle className="text-xl font-display font-bold text-amber-100 flex items-center gap-2">
              <Train className="h-6 w-6" />
              ПРОЕЗДНОЙ БИЛЕТ
            </DialogTitle>
            <DialogDescription className="text-amber-200/80 font-display tracking-wider">
              ЖЕЛЕЗНОДОРОЖНОЕ ПРИКЛЮЧЕНИЕ
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            {/* Tabs styled as ticket sections */}
            <div className="flex gap-1 mb-4 border-b-2 border-dashed border-amber-400 pb-3">
              {(['profile', 'stats', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-display font-bold transition-all border-2 ${
                    activeTab === tab
                      ? 'bg-amber-800 text-amber-100 border-amber-800 shadow-md'
                      : 'bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-200'
                  }`}
                >
                  {tab === 'profile' && '👤 ПРОФИЛЬ'}
                  {tab === 'stats' && '📊 СТАТИСТИКА'}
                  {tab === 'history' && '📜 ИСТОРИЯ'}
                </button>
              ))}
            </div>

            <ScrollArea className="max-h-[55vh]">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4 p-1">
                  {/* Ticket-style passenger info */}
                  <div className="flex gap-4 items-start">
                    {/* Avatar as passenger photo */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-28 bg-amber-200 border-4 border-amber-600 overflow-hidden shadow-inner">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover sepia-[0.2]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-b from-amber-100 to-amber-200">
                            🚂
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-amber-700 text-white rounded-full hover:bg-amber-800 shadow-lg border-2 border-amber-100"
                        disabled={saving}
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    {/* Passenger details */}
                    <div className="flex-1 space-y-2">
                      <div className="border-b-2 border-dotted border-amber-400 pb-1">
                        <span className="text-[10px] text-amber-600 font-display uppercase tracking-widest">Пассажир</span>
                        <div className="font-display font-bold text-amber-900 text-lg truncate">
                          {profile.display_name}
                        </div>
                      </div>
                      
                      {/* Rank display */}
                      {(() => {
                        const tierStyle = TIER_STYLES[currentRank.tier] || TIER_STYLES.bronze;
                        return (
                          <div className={`bg-gradient-to-r ${tierStyle.bg} border-2 ${tierStyle.border} p-3 rounded-lg ${tierStyle.glow ? `shadow-lg ${tierStyle.glow}` : ''}`}>
                            <span className="text-[10px] text-amber-600 font-display uppercase tracking-widest">Звание</span>
                            <div className={`font-display font-bold text-lg flex items-center gap-2 ${currentRank.color}`}>
                              <span className="text-2xl">{currentRank.icon}</span>
                              <span>{currentRank.name}</span>
                            </div>
                            <div className="text-[10px] text-amber-700 mt-1">
                              Побед: <span className="font-bold">{stats?.wins || 0}</span>
                            </div>
                            {nextRank && (
                              <div className="mt-2">
                                <div className="flex justify-between text-[10px] text-amber-700 mb-1">
                                  <span>→ {nextRank.icon} {nextRank.name}</span>
                                  <span>{winsToNext} побед</span>
                                </div>
                                <div className="h-2.5 bg-amber-300/50 rounded-full overflow-hidden border border-amber-400/50">
                                  <div 
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 rounded-full"
                                    style={{ width: `${progressToNext}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {!nextRank && (
                              <div className="mt-2 text-[10px] text-gold font-bold flex items-center gap-1">
                                ✨ Максимальный ранг достигнут!
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Edit Name Field */}
                  <div className="space-y-2 border-t-2 border-dashed border-amber-400 pt-4">
                    <Label htmlFor="profileName" className="text-amber-800 font-display text-xs uppercase tracking-wider">
                      Изменить имя
                    </Label>
                    <Input
                      id="profileName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white border-2 border-amber-400 font-display"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-display"
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '✓ Сохранить изменения'}
                  </Button>

                  {/* Кнопка синхронизации из Google */}
                  {hasProviderData && (
                    <Button
                      variant="outline"
                      onClick={handleSyncFromProvider}
                      className="w-full border-blue-400 text-blue-700 hover:bg-blue-50 font-display"
                      disabled={syncing}
                    >
                      {syncing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Синхронизировать из Google
                    </Button>
                  )}

                  <div className="pt-4 border-t-2 border-dashed border-amber-400">
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="w-full border-red-400 text-red-700 hover:bg-red-50 font-display"
                    >
                      Выйти из аккаунта
                    </Button>
                  </div>
                </div>
              )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4 p-1">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-100 rounded-lg p-3 text-center">
                    <Trophy className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                    <div className="text-2xl font-bold text-amber-900">{stats.wins}</div>
                    <div className="text-xs text-amber-700">Побед</div>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-3 text-center">
                    <Target className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                    <div className="text-2xl font-bold text-amber-900">{stats.totalGames}</div>
                    <div className="text-xs text-amber-700">Игр всего</div>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-3 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                    <div className="text-2xl font-bold text-amber-900">{stats.winRate}%</div>
                    <div className="text-xs text-amber-700">Винрейт</div>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-3 text-center">
                    <Award className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                    <div className="text-2xl font-bold text-amber-900">{stats.bestScore}</div>
                    <div className="text-xs text-amber-700">Лучший счёт</div>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-3 text-center col-span-2">
                    <Route className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                    <div className="text-2xl font-bold text-amber-900">{stats.avgScore}</div>
                    <div className="text-xs text-amber-700">Средний счёт за игру</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-amber-600">
                  Нет данных. Сыграйте несколько игр!
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3 p-1">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
              ) : matches.length > 0 ? (
                <>
                  {matches.map((match) => {
                    const myResult = match.match_players.find(p => p.profile_id === profile.id);
                    const placement = myResult?.placement || 1;
                    const placementText = getPlacementText(placement);
                    const isNotCounted = placement <= 0;
                    
                    return (
                      <div
                        key={match.id}
                        className={`p-3 rounded-lg border ${
                          isNotCounted
                            ? 'bg-gray-50 border-gray-300'
                            : myResult?.is_winner
                              ? 'bg-green-50 border-green-200'
                              : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-amber-900 flex items-center gap-1">
                              {getPlacementEmoji(placement)} 
                              {placementText && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  placement === 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {placementText}
                                </span>
                              )}
                              <span className="ml-1">{match.room_name}</span>
                            </div>
                            <div className="text-xs text-amber-600">
                              {format(new Date(match.played_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${isNotCounted ? 'text-gray-500' : 'text-amber-900'}`}>
                              {myResult?.final_score} очков
                            </div>
                            <div className="text-xs text-amber-600">
                              {match.player_count} игроков
                            </div>
                          </div>
                        </div>
                        {myResult && !isNotCounted && (
                          <div className="flex gap-2 text-xs text-amber-700">
                            <span>🛤️ {myResult.route_points}</span>
                            <span>🎫 {myResult.ticket_points}</span>
                            {myResult.longest_path_bonus > 0 && (
                              <span>🏆 +{myResult.longest_path_bonus}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Очистить историю
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-amber-50">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Очистить историю?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие удалит всю вашу историю матчей и статистику. Это нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearHistory}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <div className="text-center py-8 text-amber-600">
                  История пуста. Сыграйте свою первую игру!
                </div>
              )}
            </div>
          )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
