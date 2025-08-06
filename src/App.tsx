import { ReactElement } from 'react';
import { WidgetApi } from '@matrix-widget-toolkit/api';
import {
  MuiThemeProvider,
  MuiWidgetApiProvider,
} from '@matrix-widget-toolkit/mui';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import RatingWidget from './components/RatingWidget';

// Создаем базовую тему
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export function App({
  widgetApiPromise,
}: {
  widgetApiPromise: Promise<WidgetApi>;
}): ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MuiThemeProvider>
        <MuiWidgetApiProvider
          widgetApiPromise={widgetApiPromise}
          widgetRegistration={{
            name: 'Rating Widget',
            type: 'space.comind.rating.widget',
            data: { 
              title: 'Оценка бота'
            },
          }}
        >
          <RatingWidget />
        </MuiWidgetApiProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}