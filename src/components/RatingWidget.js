import React, { useState, useCallback, useEffect } from 'react';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import {
  Box,
  Typography,
  Rating,
  Paper,
  Alert,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

const RatingWidget = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(-1);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('info');

  // Используем Nordeck Widget API
  const widgetApi = useWidgetApi();

  // Получаем event_id из URL параметров
  const getEventId = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event_id');
  }, []);

  // Инициализация и запрос прав
  useEffect(() => {
    if (!widgetApi) return;

    // Запрашиваем необходимые права
    widgetApi
      .requestCapabilities([
        'org.matrix.msc2762.send_event.m.reaction',
        'org.matrix.msc2762.receive_event',
      ])
      .catch((e) => {
        console.log('Локальное тестирование - capabilities не требуются:', e);
      });

    // Уведомляем о готовности
    widgetApi.sendContentLoaded().catch((e) => {
      console.log(
        'Локальное тестирование - sendContentLoaded не требуется:',
        e
      );
    });
  }, [widgetApi]);

  const sendRating = useCallback(
    async (stars) => {
      if (!widgetApi) {
        setFeedback('Widget API не готов');
        setAlertSeverity('error');
        return;
      }

      const eventId = getEventId();
      if (!eventId) {
        setFeedback('Режим предварительного просмотра - реакция не отправлена');
        setAlertSeverity('info');
        return;
      }

      setIsSubmitting(true);
      setFeedback('Отправляем оценку...');
      setAlertSeverity('info');

      try {
        await widgetApi.sendRoomEvent('m.reaction', {
          'm.relates_to': {
            rel_type: 'm.annotation',
            event_id: eventId,
            key: `rating:${stars}`,
          },
        });

        const starsText =
          stars === 1 ? 'звезду' : stars < 5 ? 'звезды' : 'звёзд';
        setFeedback(`Спасибо! Вы поставили ${stars} ${starsText}`);
        setAlertSeverity('success');
      } catch (error) {
        console.error('Ошибка отправки реакции:', error);
        setFeedback('Ошибка при отправке оценки');
        setAlertSeverity('error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [widgetApi, getEventId]
  );

  const handleRatingChange = useCallback(
    (event, newValue) => {
      if (isSubmitting || newValue === null) return;

      setRating(newValue);
      sendRating(newValue);
    },
    [sendRating, isSubmitting]
  );

  // Проверяем наличие event_id при загрузке
  useEffect(() => {
    const eventId = getEventId();
    if (!eventId) {
      setFeedback('Режим предварительного просмотра');
      setAlertSeverity('info');
    }
  }, [getEventId]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        maxWidth: 320,
        background: 'transparent',
      }}
    >
      <Typography
        variant="subtitle2"
        component="h3"
        gutterBottom
        sx={{
          color: 'text.secondary',
          mb: 1,
        }}
      >
        Оцените ответ бота
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Rating
          name="bot-rating"
          value={rating}
          onChange={handleRatingChange}
          onChangeActive={(event, newHover) => {
            if (!isSubmitting) {
              setHoverRating(newHover);
            }
          }}
          size="large"
          icon={<Star fontSize="inherit" />}
          emptyIcon={<StarBorder fontSize="inherit" />}
          disabled={isSubmitting}
          sx={{
            '& .MuiRating-iconFilled': {
              color: '#f5b301',
            },
            '& .MuiRating-iconHover': {
              color: '#f5b301',
            },
          }}
        />

        {isSubmitting && <CircularProgress size={20} sx={{ ml: 1 }} />}
      </Box>

      <Fade in={Boolean(feedback)} timeout={300}>
        <Alert
          severity={alertSeverity}
          sx={{
            fontSize: '0.75rem',
            py: 0.5,
            '& .MuiAlert-message': {
              fontSize: '0.75rem',
            },
          }}
        >
          {feedback}
        </Alert>
      </Fade>
    </Paper>
  );
};

export default RatingWidget;
