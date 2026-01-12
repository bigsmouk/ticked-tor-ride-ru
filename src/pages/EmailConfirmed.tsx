import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

const EmailConfirmed: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold text-amber-900 mb-2">
          ✉️ Email подтверждён!
        </h1>
        
        <p className="text-amber-700 mb-6">
          Ваш аккаунт успешно активирован. Теперь вы можете войти и начать играть!
        </p>
        
        <div className="flex items-center justify-center gap-2 text-amber-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Переход на главную через {countdown} сек...</span>
        </div>
        
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors"
        >
          Перейти сейчас
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmed;
