import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../atoms/Button';

const ErrorScreen = ({
  title = 'Acesso Negado',
  message = 'Você não tem permissão para acessar esta página.',
  buttonText = 'Voltar',
  buttonLink = '/',
  icon: Icon,
  variant = 'error' // 'error' | 'access-denied'
}) => {
  const getIconColor = () => {
    switch (variant) {
      case 'access-denied':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'access-denied':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
      default:
        return 'bg-red-50 dark:bg-red-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center p-4 rounded-full ${getBackgroundColor()}`}>
            {Icon && <Icon className={`h-12 w-12 ${getIconColor()}`} />}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            {message}
          </p>
          <div className="mt-6">
            {buttonLink ? (
              <Link to={buttonLink}>
                <Button variant="primary">
                  {buttonText}
                </Button>
              </Link>
            ) : (
              <Button variant="primary" onClick={() => window.history.back()}>
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen; 