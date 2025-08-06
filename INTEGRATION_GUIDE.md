# Интеграция виджета рейтинга с Matrix ботом

## Обзор

Этот виджет позволяет пользователям оценивать ответы бота звёздочками от 1 до 5. Виджет интегрируется с Matrix через Widget API и отправляет рейтинги как реакции к сообщениям бота.

## Как это работает

### 1. Сценарий использования

1. **Бот отправляет ответ** пользователю в Matrix комнате
2. **Бот добавляет виджет рейтинга** сразу после своего сообщения  
3. **Пользователь видит виджет** с 5 звёздочками
4. **Пользователь ставит оценку** (1-5 звёзд)
5. **Виджет отправляет реакцию** к сообщению бота
6. **Бот получает обратную связь** и может её обработать

### 2. Техническая реализация

#### Отправка виджета ботом

```python
# Пример для Python Matrix SDK
async def send_message_with_rating_widget(room_id: str, message: str):
    # 1. Отправляем основное сообщение бота
    response = await client.room_send(
        room_id=room_id,
        message_type="m.room.message",
        content={
            "msgtype": "m.text",
            "body": message
        }
    )
    
    message_event_id = response.event_id
    
    # 2. Добавляем виджет рейтинга
    widget_url = f"https://ваш-домен.com/matrix_test_widget/?event_id={message_event_id}"
    
    await client.room_send(
        room_id=room_id,
        message_type="m.room.message", 
        content={
            "msgtype": "m.widget",
            "url": widget_url,
            "info": {
                "name": "Оцените ответ бота"
            }
        }
    )
```

#### Получение рейтингов ботом

```python
# Обработчик событий реакций
async def on_reaction_event(room, event):
    if event.content.get("m.relates_to", {}).get("key", "").startswith("rating:"):
        rating_key = event.content["m.relates_to"]["key"]
        rating_value = int(rating_key.split(":")[1])  # Извлекаем число 1-5
        original_event_id = event.content["m.relates_to"]["event_id"]
        user_id = event.sender
        
        print(f"Получен рейтинг {rating_value} от {user_id} для события {original_event_id}")
        
        # Здесь можете сохранить рейтинг в базу данных
        await save_rating_to_database(user_id, original_event_id, rating_value)
```

### 3. Формат данных

#### URL виджета
```
https://ваш-домен.com/matrix_test_widget/?event_id={EVENT_ID}&theme={light|dark}
```

Параметры:
- `event_id` - ID сообщения бота для связывания рейтинга (обязательный)
- `theme` - тема оформления: light или dark (опциональный)

#### Формат отправляемой реакции
```json
{
  "type": "m.reaction",
  "content": {
    "m.relates_to": {
      "rel_type": "m.annotation",
      "event_id": "$исходное_сообщение_бота", 
      "key": "rating:4"
    }
  }
}
```

Где `rating:X` - рейтинг от 1 до 5 звёзд.

### 4. Настройка виджета

#### Развёртывание
1. Соберите проект: `yarn build`
2. Разместите на веб-сервере (например, GitHub Pages)
3. Убедитесь, что домен доступен для Matrix клиентов

#### Конфигурация бота
```python
WIDGET_BASE_URL = "https://ваш-домен.com/matrix_test_widget/"

def get_rating_widget_url(event_id: str, theme: str = "light") -> str:
    return f"{WIDGET_BASE_URL}?event_id={event_id}&theme={theme}"
```

### 5. Безопасность

- Виджет работает только с валидными `event_id`
- В режиме предварительного просмотра (без `event_id`) рейтинги не отправляются
- Все взаимодействия проходят через официальный Matrix Widget API

### 6. Тестирование

Для тестирования виджета используйте файл `public/test-widget-events.html`:

```bash
yarn dev
# Откройте http://localhost:5173/matrix_test_widget/test-widget-events.html
```

### 7. Мониторинг рейтингов

Бот может собирать статистику:
- Средний рейтинг по пользователям
- Рейтинг по типам ответов
- Динамика качества ответов
- Проблемные области (низкие рейтинги)

## Примеры интеграции

### Node.js бот
```javascript
const sdk = require("matrix-js-sdk");

class RatingBot {
    constructor(homeserver, accessToken) {
        this.client = sdk.createClient({
            baseUrl: homeserver,
            accessToken: accessToken
        });
    }
    
    async sendMessageWithRating(roomId, message) {
        // Отправляем сообщение
        const response = await this.client.sendMessage(roomId, {
            msgtype: "m.text",
            body: message
        });
        
        // Добавляем виджет рейтинга
        const widgetUrl = `https://your-domain.com/matrix_test_widget/?event_id=${response.event_id}`;
        
        await this.client.sendMessage(roomId, {
            msgtype: "m.widget",
            url: widgetUrl,
            info: { name: "Оцените ответ бота" }
        });
    }
}
```

### Python бот с matrix-nio
```python
from nio import AsyncClient, RoomMessageText, ReactionEvent

class RatingBot:
    def __init__(self, homeserver, user_id, access_token):
        self.client = AsyncClient(homeserver, user_id)
        self.client.access_token = access_token
        
    async def send_message_with_rating(self, room_id: str, message: str):
        # Отправляем сообщение
        response = await self.client.room_send(
            room_id, "m.room.message", {
                "msgtype": "m.text",
                "body": message
            }
        )
        
        # Добавляем виджет
        widget_url = f"https://your-domain.com/matrix_test_widget/?event_id={response.event_id}"
        await self.client.room_send(
            room_id, "m.room.message", {
                "msgtype": "m.widget", 
                "url": widget_url,
                "info": {"name": "Оцените ответ бота"}
            }
        )
    
    async def handle_rating(self, room, event: ReactionEvent):
        if event.key.startswith("rating:"):
            rating = int(event.key.split(":")[1])
            print(f"Получен рейтинг: {rating} от {event.sender}")
```

## Заключение

Виджет полностью готов для интеграции с Matrix ботами. Он предоставляет простой и интуитивный способ сбора обратной связи от пользователей, что поможет улучшить качество ответов бота.
