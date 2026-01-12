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
import { Loader2, Camera, Trophy, Target, TrendingUp, Trash2, Award, Route } from 'lucide-react';
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

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, uploadAvatar, signOut } = useAuth();
  const { matches, stats, loading: historyLoading, fetchMatchHistory, fetchPlayerStats, clearMatchHistory } = useMatchHistory();
  
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'stats'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    switch (placement) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${placement}`;
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-amber-50 border-amber-900/30 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-900 text-center">
            🎫 Профиль игрока
          </DialogTitle>
          <DialogDescription className="text-center text-amber-700">
            Настройки аккаунта и статистика
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-amber-200 pb-2">
          {(['profile', 'stats', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-t text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {tab === 'profile' && '👤 Профиль'}
              {tab === 'stats' && '📊 Статистика'}
              {tab === 'history' && '📜 История'}
            </button>
          ))}
        </div>

        <ScrollArea className="max-h-[60vh]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 p-1">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-amber-200 border-4 border-amber-400 overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🚂
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-amber-700 text-white rounded-full hover:bg-amber-800"
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
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="profileName" className="text-amber-800">
                  Имя игрока
                </Label>
                <Input
                  id="profileName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-white border-amber-300"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Сохранить'}
              </Button>

              <div className="pt-4 border-t border-amber-200">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
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
                    return (
                      <div
                        key={match.id}
                        className={`p-3 rounded-lg border ${
                          myResult?.is_winner
                            ? 'bg-green-50 border-green-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-amber-900">
                              {getPlacementEmoji(myResult?.placement || 1)} {match.room_name}
                            </div>
                            <div className="text-xs text-amber-600">
                              {format(new Date(match.played_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-900">
                              {myResult?.final_score} очков
                            </div>
                            <div className="text-xs text-amber-600">
                              {match.player_count} игроков
                            </div>
                          </div>
                        </div>
                        {myResult && (
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
      </DialogContent>
    </Dialog>
  );
};
