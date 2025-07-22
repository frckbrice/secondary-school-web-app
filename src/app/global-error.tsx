'use client';

import React, { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useLanguage } from '../hooks/use-language';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);
  const { language } = useLanguage();

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {language === 'fr'
                    ? 'Une erreur est survenue !'
                    : 'Something went wrong!'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'fr'
                    ? 'Nous avons rencontré une erreur inattendue. Veuillez réessayer ou contacter le support si le problème persiste.'
                    : 'We encountered an unexpected error. Please try again or contact support if the problem persists.'}
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={reset} className="w-full" variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {language === 'fr' ? 'Réessayer' : 'Try again'}
                </Button>

                <Button
                  onClick={() => (window.location.href = '/')}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  {language === 'fr' ? "Retour à l'accueil" : 'Go home'}
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    {language === 'fr'
                      ? "Détails de l'erreur (développement uniquement)"
                      : 'Error details (development only)'}
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
