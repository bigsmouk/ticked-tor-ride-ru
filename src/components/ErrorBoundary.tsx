import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Можно отправить ошибку в сервис аналитики
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('ttr_last_error', JSON.stringify(errorData));
    } catch (e) {
      // Игнорируем ошибки при сохранении
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    // Очищаем состояние ошибки и редиректим на главную
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/?noRecover=1';
  };

  private handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Ошибка: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(errorText);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen parchment flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="ornate-frame bg-card rounded-lg p-8 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Что-то пошло не так
              </h1>
              
              <p className="text-muted-foreground mb-6">
                Произошла непредвиденная ошибка. Не волнуйтесь, ваш прогресс в игре сохранён.
              </p>

              {/* Error details (collapsed) */}
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Показать детали ошибки
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-32">
                  <p className="text-destructive font-semibold">{this.state.error?.message}</p>
                  {this.state.error?.stack && (
                    <pre className="mt-2 text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  )}
                </div>
                <button
                  onClick={this.handleCopyError}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  📋 Копировать для отчёта
                </button>
              </details>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="btn-gold w-full rounded-lg py-3 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Перезагрузить страницу
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="btn-vintage w-full rounded-lg py-3 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Вернуться на главную
                </button>
              </div>

              {/* Hint */}
              <p className="text-xs text-muted-foreground mt-6">
                Если ошибка повторяется, попробуйте очистить кэш браузера или обратитесь к разработчику.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}