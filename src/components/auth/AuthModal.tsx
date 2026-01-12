import React, { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'confirm-pending' | 'forgot-password' | 'reset-sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setMode('reset-sent');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('📧 Письмо отправлено повторно!', {
          description: 'Проверьте почту ' + email,
        });
      }
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message === 'Email not confirmed') {
            toast.error('Email не подтверждён. Проверьте почту.');
            setMode('confirm-pending');
          } else {
            toast.error(error.message === 'Invalid login credentials' 
              ? 'Неверный email или пароль' 
              : error.message);
          }
        } else {
          toast.success('Добро пожаловать!');
          onClose();
        }
      } else {
        if (!displayName.trim()) {
          toast.error('Введите имя игрока');
          setLoading(false);
          return;
        }
        const { error, data } = await signUp(email, password, displayName.trim());
        if (error) {
          toast.error(error.message);
        } else {
          // Check if email confirmation is required
          if (data?.user && !data.session) {
            setMode('confirm-pending');
            toast.success('📧 Проверьте почту!', {
              description: 'Мы отправили ссылку для подтверждения на ' + email,
              duration: 10000,
            });
          } else {
            toast.success('Аккаунт создан! Добро пожаловать!');
            onClose();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMode('login');
    onClose();
  };

  // Password reset sent screen
  if (mode === 'reset-sent') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-amber-50 border-amber-900/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-900 text-center">
              📧 Письмо отправлено
            </DialogTitle>
            <DialogDescription className="text-center text-amber-700">
              Ссылка для сброса пароля отправлена на
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center">
            <p className="font-medium text-amber-900 text-lg mb-4">{email}</p>
            
            <div className="bg-amber-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                Перейдите по ссылке в письме, чтобы создать новый пароль.
                Проверьте папку «Спам», если письмо не пришло.
              </p>
            </div>

            <Button
              onClick={handleForgotPassword}
              variant="outline"
              className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Отправить повторно
            </Button>
          </div>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-sm text-amber-700 hover:text-amber-900 underline"
            >
              Вернуться к входу
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Forgot password screen
  if (mode === 'forgot-password') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-amber-50 border-amber-900/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-900 text-center">
              🔐 Сброс пароля
            </DialogTitle>
            <DialogDescription className="text-center text-amber-700">
              Введите email для получения ссылки сброса
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-amber-800">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-amber-300 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <Button
              onClick={handleForgotPassword}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Отправить ссылку'
              )}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-sm text-amber-700 hover:text-amber-900 underline"
            >
              Вернуться к входу
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation pending screen
  if (mode === 'confirm-pending') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-amber-50 border-amber-900/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-900 text-center">
              📧 Подтвердите email
            </DialogTitle>
            <DialogDescription className="text-center text-amber-700">
              Мы отправили ссылку для подтверждения на
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center">
            <p className="font-medium text-amber-900 text-lg mb-4">{email}</p>
            
            <div className="bg-amber-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                Перейдите по ссылке в письме, чтобы активировать аккаунт.
                Проверьте папку «Спам», если письмо не пришло.
              </p>
            </div>

            <Button
              onClick={handleResendConfirmation}
              variant="outline"
              className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
              disabled={resending}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Отправить письмо повторно
            </Button>
          </div>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-sm text-amber-700 hover:text-amber-900 underline"
            >
              Вернуться к входу
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-amber-50 border-amber-900/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-900 text-center">
            {mode === 'login' ? '🚂 Вход в аккаунт' : '🎫 Регистрация'}
          </DialogTitle>
          <DialogDescription className="text-center text-amber-700">
            {mode === 'login' 
              ? 'Войдите для сохранения прогресса и мультиплеера' 
              : 'Создайте аккаунт для игры с друзьями'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-amber-800">
                Имя игрока
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Ваш никнейм"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 bg-white border-amber-300 focus:border-amber-500"
                  required={mode === 'register'}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-amber-800">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white border-amber-300 focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-amber-800">
              Пароль
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white border-amber-300 focus:border-amber-500"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-700 hover:bg-amber-800 text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'login' ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-amber-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-amber-50 px-2 text-amber-600">или</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Войти через Google
        </Button>

        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-amber-700 hover:text-amber-900 underline"
          >
            {mode === 'login'
              ? 'Нет аккаунта? Зарегистрироваться'
              : 'Уже есть аккаунт? Войти'}
          </button>
          
          {mode === 'login' && (
            <div>
              <button
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-sm text-amber-600 hover:text-amber-800 underline"
              >
                Забыли пароль?
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
