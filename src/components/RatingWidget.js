import React, { useState, useCallback, useEffect } from 'react';
import { WidgetApi } from 'matrix-widget-api';

const RatingWidget = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetApi, setWidgetApi] = useState(null);

  // Инициализируем Widget API
  useEffect(() => {
    const api = new WidgetApi();
    api.start();
    
    try {
      api.sendContentLoaded();
    } catch (e) {
      console.log('Локальное тестирование - sendContentLoaded не требуется');
    }

    try {
      api.requestCapabilities([
        'org.matrix.msc2762.send_event.m.reaction',
        'org.matrix.msc2762.receive_event',
      ]);
    } catch (e) {
      console.log('Локальное тестирование - capabilities не требуются');
    }

    setWidgetApi(api);
  }, []);

  // Получаем event_id из URL параметров
  const getEventId = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event_id');
  }, []);

  const sendRating = useCallback(async (stars) => {
    if (!widgetApi) {
      setFeedback('API не готов');
      return;
    }

    const eventId = getEventId();
    if (!eventId) {
      setFeedback('Локальное тестирование - реакция не отправлена');
      return;
    }

    setIsSubmitting(true);
    setFeedback('Отправляем оценку...');

    try {
      await widgetApi.sendEvent('m.reaction', {
        'm.relates_to': {
          rel_type: 'm.annotation',
          event_id: eventId,
          key: `rating:${stars}`
        }
      });
      
      setFeedback(`Спасибо! Вы поставили ${stars} ${stars === 1 ? 'звезду' : stars < 5 ? 'звезды' : 'звёзд'}`);
    } catch (error) {
      console.error('Ошибка отправки реакции:', error);
      setFeedback('Ошибка при отправке оценки');
    } finally {
      setIsSubmitting(false);
    }
  }, [widgetApi, getEventId]);

  const handleStarClick = useCallback((stars) => {
    if (isSubmitting) return;
    
    setRating(stars);
    sendRating(stars);
  }, [sendRating, isSubmitting]);

  const handleStarHover = useCallback((stars) => {
    if (!isSubmitting) {
      setHoverRating(stars);
    }
  }, [isSubmitting]);

  const handleMouseLeave = useCallback(() => {
    setHoverRating(0);
  }, []);

  // Проверяем наличие event_id при загрузке
  useEffect(() => {
    const eventId = getEventId();
    if (!eventId) {
      setFeedback('Режим предварительного просмотра');
    }
  }, [getEventId]);

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= displayRating ? 'active' : ''}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          style={{ 
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div className="rating-widget">
      <h3 className="rating-title">Оцените ответ бота</h3>
      <div 
        className="stars-container" 
        onMouseLeave={handleMouseLeave}
      >
        {renderStars()}
      </div>
      <div className="rating-feedback">
        {feedback}
      </div>
    </div>
  );
};

export default RatingWidget;