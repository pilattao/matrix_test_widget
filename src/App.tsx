import React from 'react';
import { WidgetApiProvider } from '@matrix-widget-toolkit/react';
import { MuiThemeProvider } from '@matrix-widget-toolkit/mui';
import { CssBaseline } from '@mui/material';
import { WidgetApi } from '@matrix-widget-toolkit/api';
import RatingWidget from './components/RatingWidget';

// Создаем Widget API
const createWidgetApi = (): Promise<WidgetApi> => {
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
};

const App: React.FC = () => {
  return (
    <WidgetApiProvider
      widgetApiPromise={createWidgetApi()}
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
