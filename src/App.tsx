import React from 'react';
import { WidgetApiProvider } from '@matrix-widget-toolkit/react';
import { MuiThemeProvider } from '@matrix-widget-toolkit/mui';
import { CssBaseline } from '@mui/material';
import { WidgetApi } from '@matrix-widget-toolkit/api';
import RatingWidget from './components/RatingWidget';

// Создаем Widget API
const createWidgetApi = (): Promise<WidgetApi> => {
  // Проверяем, запущены ли мы в Matrix клиенте
  const isInMatrix = window.parent !== window || new URLSearchParams(window.location.search).has('widgetId');
  
  if (isInMatrix) {
    console.log('Инициализируем реальный Matrix Widget API');
    // В Matrix клиенте используем реальный API через postMessage
    return new Promise((resolve, reject) => {
      try {
        // Создаем простой Widget API для работы с Matrix
        const widgetApi = {
          requestCapabilities: (capabilities: string[]) => {
            console.log('Запрашиваем capabilities:', capabilities);
            // Отправляем запрос capabilities через postMessage
            window.parent.postMessage({
              api: 'toWidget',
              action: 'capabilities',
              data: { capabilities }
            }, '*');
            return Promise.resolve();
          },
          sendRoomEvent: (type: string, content: any) => {
            console.log('Отправляем room event:', type, content);
            // Отправляем событие в комнату через postMessage
            window.parent.postMessage({
              api: 'toWidget', 
              action: 'send_event',
              data: { type, content }
            }, '*');
            return Promise.resolve({ event_id: `event_${Date.now()}` });
          },
          readEventRelations: () => Promise.resolve([]),
          observeModalButtons: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
          setModalButtonEnabled: () => Promise.resolve(),
        } as any;
        
        resolve(widgetApi);
      } catch (error) {
        console.error('Ошибка создания Widget API:', error);
        reject(error);
      }
    });
  } else {
    // Для локальной разработки создаем mock API
    console.log('Создаем mock Widget API для локальной разработки');
    return Promise.resolve({
      requestCapabilities: () => Promise.resolve(),
      sendRoomEvent: (type: string, content: any) => {
        console.log('Mock sendRoomEvent:', type, content);
        return Promise.resolve({ event_id: 'mock_event_id' });
      },
      readEventRelations: () => Promise.resolve([]),
      observeModalButtons: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      setModalButtonEnabled: () => Promise.resolve(),
    } as any);
  }
};

const App: React.FC = () => {
  return (
    <WidgetApiProvider
      widgetApiPromise={createWidgetApi()}
      widgetRegistration={{
        name: 'Rating Widget',
        type: 'space.comining.rating.clock',
        data: {
          title: 'Rating Widget',
        }
      }}
      loadingViewComponent={() => <div>Загрузка...</div>}
      mobileClientErrorComponent={() => <div>Ошибка мобильного клиента</div>}
      outsideClientErrorComponent={() => <div>Ошибка клиента</div>}
      missingParametersErrorComponent={() => <div>Отсутствуют параметры</div>}
      childErrorComponent={() => <div>Ошибка дочернего компонента</div>}
      missingCapabilitiesComponent={() => <div>Отсутствуют возможности</div>}
    >
      <MuiThemeProvider>
        <CssBaseline />
        <RatingWidget />
      </MuiThemeProvider>
    </WidgetApiProvider>
  );
};

export default App;
