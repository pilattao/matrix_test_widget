import React from 'react';
import { WidgetApiProvider } from '@matrix-widget-toolkit/react';
import { MuiThemeProvider } from '@matrix-widget-toolkit/mui';
import { CssBaseline } from '@mui/material';
import RatingWidget from './components/RatingWidget';

function App() {
  return (
    <WidgetApiProvider>
      <MuiThemeProvider>
        <CssBaseline />
        <RatingWidget />
      </MuiThemeProvider>
    </WidgetApiProvider>
  );
}

export default App;
