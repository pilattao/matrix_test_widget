import { useEffect, useState } from 'react';
import { useWidgetApi } from '@matrix-widget-toolkit/react';

interface ThemeChangeData {
  theme: 'light' | 'dark';
}

interface SendEventData {
  type: string;
  content: Record<string, any>;
  state_key?: string;
}

export const useWidgetEventHandlers = () => {
  const widgetApi = useWidgetApi();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (!widgetApi) return;

    console.log('Setting up widget event handlers');

    // Попытаемся определить тему из URL параметров или системных настроек
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam === 'dark' || themeParam === 'light') {
      setTheme(themeParam);
      document.documentElement.setAttribute('data-theme', themeParam);
    } else {
      // Определяем тему по системным настройкам
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }

    // Обработчик смены темы
    const handleThemeChange = (data: ThemeChangeData) => {
      console.log('Theme change event received:', data);
      
      try {
        const { theme: newTheme } = data;
        setTheme(newTheme);
        
        // Применяем тему к документу
        document.documentElement.setAttribute('data-theme', newTheme);
        
        console.log(`Theme changed to: ${newTheme}`);
        return {}; // Возвращаем пустой объект как подтверждение
      } catch (error) {
        console.error('Error handling theme change:', error);
        throw error;
      }
    };

    // Обработчик отправки событий
    const handleSendEvent = (data: SendEventData) => {
      console.log('Send event request received:', data);
      
      try {
        const { type, content, state_key } = data;
        
        // Логируем событие (в реальном приложении здесь была бы отправка)
        console.log('Sending event:', { type, content, state_key });
        
        // Для демонстрации просто возвращаем успешный ответ
        return { 
          event_id: `$${Math.random().toString(36).substring(7)}` 
        };
        
      } catch (error) {
        console.error('Error handling send event:', error);
        throw error;
      }
    };

    // Добавляем обработчики через addEventListener на window
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      const { action, data } = event.data;
      
      try {
        let response;
        
        switch (action) {
          case 'theme_change':
            response = handleThemeChange(data);
            break;
          case 'send_event':
            response = handleSendEvent(data);
            break;
          default:
            console.log('Unknown action:', action);
            return;
        }
        
        // Отправляем ответ обратно
        if (event.source && event.origin) {
          (event.source as Window).postMessage({
            ...event.data,
            response
          }, event.origin);
        }
        
      } catch (error) {
        console.error('Error handling widget message:', error);
        
        // Отправляем ошибку обратно
        if (event.source && event.origin) {
          (event.source as Window).postMessage({
            ...event.data,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, event.origin);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup функция
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [widgetApi]);

  return {
    theme,
    setTheme,
  };
};
