import { WidgetApiImpl } from '@matrix-widget-toolkit/api';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Инициализируем Widget API при старте. Клиент инициирует
// соединение с capabilities и мы должны убедиться,
// что сообщение не потеряется пока мы инициализируем React.
const widgetApiPromise = WidgetApiImpl.create({
  // Запрашиваем необходимые capabilities при старте
  capabilities: [
    // Разрешаем получать и отправлять события реакций
    WidgetEventCapability.forRoomEvent(EventDirection.Send, 'm.reaction'),
    WidgetEventCapability.forRoomEvent(EventDirection.Receive, 'm.reaction'),
    // Разрешаем получать события сообщений
    WidgetEventCapability.forRoomEvent(
      EventDirection.Receive,
      'm.room.message'
    ),
    // Разрешаем работать с модульными виджетами
    WidgetEventCapability.forStateEvent(
      EventDirection.Send,
      'im.vector.modular.widgets'
    ),
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      'im.vector.modular.widgets'
    ),
    WidgetEventCapability.forStateEvent(EventDirection.Receive, 'm.room.name'),
  ],
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App widgetApiPromise={widgetApiPromise} />
  </React.StrictMode>
);
