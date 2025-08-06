import { WidgetApiImpl } from '@matrix-widget-toolkit/api';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Инициализируем Widget API при старте. Клиент инициирует
// соединение с capabilities и мы должны убедиться,
// что сообщение не потеряется пока мы инициализируем React.
const widgetApiPromise = WidgetApiImpl.create();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App widgetApiPromise={widgetApiPromise} />
  </React.StrictMode>,
);
