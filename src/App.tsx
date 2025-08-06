import { ReactElement } from 'react';
import { WidgetApi } from '@matrix-widget-toolkit/api';
import {
  MuiThemeProvider,
  MuiWidgetApiProvider,
} from '@matrix-widget-toolkit/mui';
import RatingWidget from './components/RatingWidget';

export function App({
  widgetApiPromise,
}: {
  widgetApiPromise: Promise<WidgetApi>;
}): ReactElement {
  return (
    <MuiThemeProvider>
      <MuiWidgetApiProvider
        widgetApiPromise={widgetApiPromise}
        widgetRegistration={{
          name: 'Rating Widget',
          type: 'space.comining.rating.clock',
          data: { 
            title: 'Оценка бота'
          },
        }}
      >
        <RatingWidget />
      </MuiWidgetApiProvider>
    </MuiThemeProvider>
  );
}