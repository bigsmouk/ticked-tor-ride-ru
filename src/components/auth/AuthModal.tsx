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
  const [resending, setResending] = useState(false);
  const { signIn, signUp } = useAuth();

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
