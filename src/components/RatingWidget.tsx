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
  AlertColor,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useWidgetEventHandlers } from '../hooks/useWidgetEventHandlers';

const RatingWidget: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [, setHoverRating] = useState<number>(-1);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('info');

  // Используем Nordeck Widget API
  const widgetApi = useWidgetApi();
  
  // Используем кастомный хук для обработки событий виджета
  const { theme } = useWidgetEventHandlers();

  // Получаем event_id из URL параметров
  const getEventId = useCallback((): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event_id');
  }, []);

  // Инициализация
  useEffect(() => {
    if (!widgetApi) return;
    console.log('Widget API инициализирован');
  }, [widgetApi]);

  const sendRating = useCallback(
    async (stars: number): Promise<void> => {
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
    (_event: React.SyntheticEvent, newValue: number | null): void => {
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
        color: theme === 'dark' ? '#ffffff' : 'inherit',
      }}
    >
      <Typography
        variant="subtitle2"
        component="h3"
        gutterBottom
        sx={{
          color: theme === 'dark' ? '#cccccc' : 'text.secondary',
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
          onChangeActive={(
            _event: React.SyntheticEvent,
            newHover: number
          ): void => {
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
