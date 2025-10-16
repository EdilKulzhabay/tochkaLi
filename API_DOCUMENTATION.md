# 📚 API Документация

## 🔐 Авторизация

Защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 👤 User API

### Регистрация
```http
POST /api/user/register
Content-Type: application/json

{
  "fullName": "Иван Иванов",
  "mail": "ivan@example.com",
  "phone": "+77001234567",
  "password": "password123"
}
```

### Авторизация
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "ivan@example.com",
  "password": "password123"
}
```

### Получить данные текущего пользователя
```http
GET /api/user/me
Authorization: Bearer TOKEN
```

### Проверить сессию
```http
GET /api/user/check-session
Authorization: Bearer TOKEN
```

---

## ❓ FAQ API

### Создать FAQ (требует авторизации)
```http
POST /api/faq
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "question": "Как начать практику?",
  "answer": "Начните с простых медитаций..."
}
```

### Получить все FAQ
```http
GET /api/faq
```

### Получить FAQ по ID
```http
GET /api/faq/:id
```

### Обновить FAQ (требует авторизации)
```http
PUT /api/faq/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "question": "Обновленный вопрос",
  "answer": "Обновленный ответ"
}
```

### Удалить FAQ (требует авторизации)
```http
DELETE /api/faq/:id
Authorization: Bearer TOKEN
```

---

## ♈ Horoscope API

### Создать гороскоп (требует авторизации)
```http
POST /api/horoscope
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "zodiacSign": "Aries",
  "period": "Ежедневный",
  "title": "Гороскоп на сегодня",
  "date": "2024-01-15",
  "content": "Сегодня отличный день для...",
  "accessType": "free"
}
```

**Знаки зодиака:** Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces

### Получить все гороскопы
```http
GET /api/horoscope
GET /api/horoscope?zodiacSign=Aries
GET /api/horoscope?period=Ежедневный
GET /api/horoscope?isActive=true
```

### Получить гороскоп по ID
```http
GET /api/horoscope/:id
```

### Обновить гороскоп (требует авторизации)
```http
PUT /api/horoscope/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "content": "Обновленное содержание"
}
```

### Удалить гороскоп (требует авторизации)
```http
DELETE /api/horoscope/:id
Authorization: Bearer TOKEN
```

---

## 🧘 Meditation API

### Создать медитацию (требует авторизации)
```http
POST /api/meditation
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "title": "Утренняя медитация",
  "subtitle": "Начните день с энергии",
  "category": "Утро",
  "shortDescription": "Краткое описание до 500 символов",
  "fullDescription": "Полное описание медитации...",
  "imageUrl": "https://example.com/image.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "accessType": "free"
}
```

### Получить все медитации
```http
GET /api/meditation
GET /api/meditation?category=Утро
GET /api/meditation?accessType=free
GET /api/meditation?isActive=true
```

### Получить медитацию по ID
```http
GET /api/meditation/:id
```

### Обновить медитацию (требует авторизации)
```http
PUT /api/meditation/:id
Authorization: Bearer TOKEN
```

### Удалить медитацию (требует авторизации)
```http
DELETE /api/meditation/:id
Authorization: Bearer TOKEN
```

---

## 🔮 Practice API

### Создать практику (требует авторизации)
```http
POST /api/practice
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "title": "Дыхательная практика",
  "subtitle": "Техника осознанного дыхания",
  "category": "Дыхание",
  "shortDescription": "Краткое описание",
  "fullDescription": "Полное описание...",
  "imageUrl": "https://example.com/image.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "accessType": "subscription"
}
```

### Получить все практики
```http
GET /api/practice
GET /api/practice?category=Дыхание
GET /api/practice?accessType=free
GET /api/practice?isActive=true
```

### Получить практику по ID
```http
GET /api/practice/:id
```

### Обновить практику (требует авторизации)
```http
PUT /api/practice/:id
Authorization: Bearer TOKEN
```

### Удалить практику (требует авторизации)
```http
DELETE /api/practice/:id
Authorization: Bearer TOKEN
```

---

## 🎬 VideoLesson API

### Создать видео урок (требует авторизации)
```http
POST /api/video-lesson
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "title": "Основы астрологии",
  "subtitle": "Урок 1: Введение",
  "category": "Астрология",
  "shortDescription": "Краткое описание",
  "fullDescription": "Полное описание...",
  "imageUrl": "https://example.com/image.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "duration": 45,
  "accessType": "paid"
}
```

### Получить все видео уроки
```http
GET /api/video-lesson
GET /api/video-lesson?category=Астрология
GET /api/video-lesson?accessType=paid
GET /api/video-lesson?isActive=true
```

### Получить видео урок по ID
```http
GET /api/video-lesson/:id
```

### Обновить видео урок (требует авторизации)
```http
PUT /api/video-lesson/:id
Authorization: Bearer TOKEN
```

### Удалить видео урок (требует авторизации)
```http
DELETE /api/video-lesson/:id
Authorization: Bearer TOKEN
```

---

## 📅 Schedule API

### Создать событие (требует авторизации)
```http
POST /api/schedule
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "eventTitle": "Онлайн вебинар",
  "eventDate": "2024-02-20T18:00:00Z",
  "location": "Zoom",
  "eventLink": "https://zoom.us/j/123456789",
  "description": "Описание события..."
}
```

### Получить все события
```http
GET /api/schedule
GET /api/schedule?isActive=true
GET /api/schedule?upcoming=true  // только предстоящие события
```

### Получить событие по ID
```http
GET /api/schedule/:id
```

### Обновить событие (требует авторизации)
```http
PUT /api/schedule/:id
Authorization: Bearer TOKEN
```

### Удалить событие (требует авторизации)
```http
DELETE /api/schedule/:id
Authorization: Bearer TOKEN
```

---

## 🌟 Transit API

### Создать транзит (требует авторизации)
```http
POST /api/transit
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "title": "Меркурий в ретрограде",
  "category": "Ретроградность",
  "description": "Описание транзита...",
  "planet": "Меркурий",
  "aspect": "Ретроград",
  "intensity": "high",
  "startDate": "2024-01-15",
  "endDate": "2024-02-05",
  "affectedZodiacs": ["Gemini", "Virgo"],
  "accessType": "subscription"
}
```

**Intensity:** low, medium, high

### Получить все транзиты
```http
GET /api/transit
GET /api/transit?planet=Меркурий
GET /api/transit?category=Ретроградность
GET /api/transit?intensity=high
GET /api/transit?accessType=subscription
GET /api/transit?isActive=true
GET /api/transit?active=true  // только активные на данный момент
```

### Получить транзит по ID
```http
GET /api/transit/:id
```

### Обновить транзит (требует авторизации)
```http
PUT /api/transit/:id
Authorization: Bearer TOKEN
```

### Удалить транзит (требует авторизации)
```http
DELETE /api/transit/:id
Authorization: Bearer TOKEN
```

---

## 📋 Общие типы accessType

Все сущности с контентом поддерживают три типа доступа:

- **free** - бесплатный доступ для всех
- **paid** - платный контент (разовая оплата)
- **subscription** - доступен по подписке

---

## ✅ Стандартные ответы API

### Успешный ответ
```json
{
  "success": true,
  "data": { ... },
  "message": "Операция выполнена успешно"
}
```

### Ответ с массивом
```json
{
  "success": true,
  "data": [ ... ],
  "count": 10
}
```

### Ошибка
```json
{
  "success": false,
  "message": "Описание ошибки",
  "error": "Детали ошибки"
}
```

---

## 🔒 Коды ответов

- **200** - Успешно
- **201** - Создано
- **400** - Неверные данные
- **401** - Не авторизован
- **403** - Доступ запрещен / Сессия истекла
- **404** - Не найдено
- **409** - Конфликт (например, пользователь уже существует)
- **500** - Внутренняя ошибка сервера

---

## 💡 Примеры использования

### JavaScript/Axios
```javascript
import axios from 'axios';

// Получить все медитации категории "Утро"
const response = await axios.get('http://localhost:3000/api/meditation?category=Утро');

// Создать новую медитацию (требует токен)
const newMeditation = await axios.post(
  'http://localhost:3000/api/meditation',
  {
    title: "Утренняя медитация",
    subtitle: "Начните день с энергии",
    // ... другие поля
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
```

### cURL
```bash
# Получить все гороскопы для Овна
curl http://localhost:3000/api/horoscope?zodiacSign=Aries

# Создать FAQ (с авторизацией)
curl -X POST http://localhost:3000/api/faq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question":"Вопрос","answer":"Ответ"}'
```

---

## 🚀 Быстрый старт

1. Запустите сервер: `npm run dev` (в папке server)
2. Зарегистрируйтесь: `POST /api/user/register`
3. Получите токен: `POST /api/user/login`
4. Используйте токен для защищенных эндпоинтов

Готово! 🎉

