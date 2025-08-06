import { ReactElement } from 'react';
import { WidgetApi } from '@matrix-widget-toolkit/api';
import {
  MuiThemeProvider,
  MuiWidgetApiProvider,
} from '@matrix-widget-toolkit/mui';
import RatingWidget from './components/RatingWidget';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export function App({
  widgetApiPromise,
}: {
  widgetApiPromise: Promise<WidgetApi>;
}): ReactElement {
  return (
    <BrowserRouter basename="/matrix_test_widget">
      <MuiThemeProvider>
        <MuiWidgetApiProvider
          widgetApiPromise={widgetApiPromise}
          widgetRegistration={{
            name: 'Rating Widget',
            type: 'space.comind.rating.widget',
            data: {
              title: 'Оценка бота',
            },
          }}
        >
          <Routes>
            <Route path="/" element={<RatingWidget />} />
            <Route path="/*" element={<RatingWidget />} />
          </Routes>
        </MuiWidgetApiProvider>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}
