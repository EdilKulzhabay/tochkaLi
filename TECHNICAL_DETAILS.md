# Технические детали проекта TochkaLi

## Содержание

1. [Архитектура компонентов](#архитектура-компонентов)
2. [Система защиты Telegram WebApp](#система-защиты-telegram-webapp)
3. [Обработка дат и времени](#обработка-дат-и-времени)
4. [Система доступа к контенту](#система-доступа-к-контенту)
5. [Реферальная система](#реферальная-система)
6. [Отслеживание прогресса видео](#отслеживание-прогресса-видео)

---

## Архитектура компонентов

### Frontend компоненты

#### TelegramGuard

Компонент защиты страниц от доступа через обычный браузер.

**Расположение:** `client/src/components/TelegramGuard.tsx`

**Функционал:**
- Проверяет наличие Telegram WebApp API
- Перенаправляет на `/client/blocked-browser` если открыто не в Telegram
- Использует функцию `isTelegramWebView()` для проверки

**Использование:**
```tsx
<TelegramGuard>
  <ProtectedRoute>
    <YourComponent />
  </ProtectedRoute>
</TelegramGuard>
```

#### ProtectedRoute

Компонент защиты маршрутов на основе авторизации и ролей.

**Расположение:** `client/src/components/ProtectedRoute.tsx`

**Параметры:**
- `requiredRole?: string[]` — массив разрешенных ролей
- Проверяет наличие токена в localStorage
- Перенаправляет на `/client/login` если не авторизован

#### AuthContext

Контекст для управления состоянием авторизации.

**Расположение:** `client/src/contexts/AuthContext.tsx`

**Функции:**
- `login(token, refreshToken)` — сохранение токенов
- `logout()` — выход из системы
- `isAuthenticated()` — проверка авторизации

---

## Система защиты Telegram WebApp

### Механизм проверки

#### Функция `isTelegramWebView()`

**Расположение:** `client/src/utils/telegramWebApp.ts`

**Логика проверки:**

1. **Проверка наличия объекта:**
   ```typescript
   const tg = window.Telegram?.WebApp;
   if (!tg) return false;
   ```

2. **Проверка initData:**
   ```typescript
   if (tg.initData && typeof tg.initData === 'string' && tg.initData.trim().length > 0) {
     return true;
   }
   ```
   - В реальном Telegram WebApp `initData` всегда содержит данные
   - В обычном браузере скрипт SDK создает объект, но `initData` пустой

3. **Проверка initDataUnsafe:**
   ```typescript
   if (tg.initDataUnsafe?.user?.id) {
     return true;
   }
   ```
   - Проверяет наличие данных пользователя

### Почему это работает?

Telegram WebApp SDK загружается в `index.html` и создает объект `window.Telegram.WebApp` даже в обычном браузере. Однако:

- **В Telegram:** `initData` содержит строку с данными авторизации
- **В браузере:** `initData` пустая строка или `undefined`

Поэтому проверка на наличие непустого `initData` является надежным способом определения реального Telegram окружения.

### Страница блокировки

**Расположение:** `client/src/pages/User/BlockedBrowser.tsx`

Отображается пользователям, которые пытаются открыть приложение в обычном браузере. Содержит инструкции по открытию через Telegram.

---

## Обработка дат и времени

### Часовой пояс

Приложение использует **Asia/Almaty (UTC+6)** как основной часовой пояс.

### Сохранение дат событий

#### Клиентская часть

**Функция:** `dateToLocalDateTime()`

**Расположение:** `client/src/pages/Admin/ScheduleForm.tsx`

Конвертирует UTC время в локальное время Asia/Almaty для отображения:

```typescript
const dateToLocalDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Добавляем 6 часов (Asia/Almaty = UTC+6)
  const localDate = new Date(d.getTime() + (6 * 60 * 60 * 1000));
  // Форматируем в YYYY-MM-DDTHH:mm
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
```

#### Серверная часть

**Функция:** `parseDateTimeLocal()`

**Расположение:** `server/Controllers/ScheduleController.js`

Интерпретирует datetime-local как время в Asia/Almaty и конвертирует в UTC:

```javascript
const parseDateTimeLocal = (dateTimeString) => {
  // Парсим формат YYYY-MM-DDTHH:mm
  // Создаем Date в UTC, вычитая 6 часов
  const utcDate = new Date(Date.UTC(year, month, day, hours - 6, minutes));
  return utcDate;
};
```

### Пример работы

1. **Пользователь вводит:** `2024-01-15T14:00` (14:00 в Asia/Almaty)
2. **Клиент отправляет:** `"2024-01-15T14:00"` (без изменений)
3. **Сервер сохраняет:** `08:00 UTC` (14:00 - 6 часов = 08:00 UTC)
4. **При загрузке:** Сервер возвращает `08:00 UTC`, клиент показывает `14:00` (08:00 + 6 часов)

---

## Система доступа к контенту

### Типы доступа

Контент может иметь один из трех типов доступа:

1. **free** — доступен всем
2. **paid** — требуется одноразовая оплата
3. **subscription** — требуется активная подписка

### Проверка доступа

#### Модели контента

Все модели контента содержат поле:
```javascript
accessType: {
  type: String,
  enum: ['free', 'paid', 'subscription'],
  default: 'subscription'
}
```

#### Проверка на клиенте

Проверка происходит при отображении контента:
- Если `accessType === 'free'` — показывается всем
- Если `accessType === 'paid'` — проверяется наличие покупки в `user.products`
- Если `accessType === 'subscription'` — проверяется `user.subscriptionEndDate > new Date()`

### Статусы пользователя

1. **guest** — гость (не зарегистрирован)
2. **registered** — зарегистрирован, но не оплатил
3. **active** — активный пользователь с подпиской
4. **client** — постоянный клиент

---

## Реферальная система

### Механизм работы

1. **При регистрации:**
   - Пользователь может указать `referralTelegramId`
   - Система находит пользователя-пригласителя
   - Создается связь через поле `invitedUser`

2. **Начисление бонусов:**
   - При успешной регистрации по реферальной ссылке
   - Пригласивший получает +1 к `bonus`
   - Увеличивается `inviteesCount`

3. **Отслеживание:**
   - `invitedUser` — ссылка на пользователя-пригласителя
   - `inviteesCount` — количество приглашенных

### API эндпоинты

- `POST /api/user/create` — создание пользователя с реферальной ссылкой
- `GET /api/user/:id` — получение информации о рефералах

---

## Отслеживание прогресса видео

### Модель VideoProgress

```javascript
{
  userId: ObjectId (ref: User),
  videoLessonId: ObjectId (ref: VideoLesson),
  progress: Number, // процент просмотра (0-100)
  lastPosition: Number // последняя позиция в секундах
}
```

### Обновление прогресса

Прогресс обновляется при:
- Паузе видео
- Переходе на другое видео
- Закрытии страницы

### API эндпоинты

- `POST /api/video-progress` — создание/обновление прогресса
- `GET /api/video-progress/user/:userId` — получение всего прогресса пользователя
- `GET /api/video-progress/video/:videoId` — получение прогресса по видео

---

## Система подписок

### Автоматическая проверка

**Cron задача:** Проверка истекших подписок

**Расположение:** `server/index.js`

**Расписание:** Каждый день в 12:00 (Asia/Almaty)

```javascript
cron.schedule('0 12 * * *', async () => {
  await SubscriptionController.checkExpiredSubscriptions();
}, {
  timezone: "Asia/Almaty"
});
```

### Логика проверки

1. Находит всех пользователей с `subscriptionEndDate < new Date()`
2. Обновляет статус на предыдущий (`previousStatus`)
3. Устанавливает `subscriptionEndDate = null`

### Активация подписки

**Эндпоинт:** `PUT /api/user/:id/activate-subscription`

**Параметры:**
- `subscriptionEndDate` — дата окончания подписки
- Обновляет статус пользователя на `active` или `client`

---

## Загрузка файлов

### Multer конфигурация

**Расположение:** `server/Controllers/UploadController.js`

**Типы файлов:**
- Изображения (cover, profile photos)
- Видео (для видео-уроков)

**Хранение:**
- Файлы сохраняются в `server/uploads/`
- URL формируется как `/uploads/filename`

### Обработка изображений

- Поддержка форматов: jpg, jpeg, png, webp
- Проверка размера файла
- Генерация уникальных имен

---

## Email система

### Nodemailer конфигурация

**Расположение:** `server/Controllers/UserController.js`

**Использование:**
- Отправка кодов подтверждения
- Восстановление пароля
- Уведомления

### Процесс подтверждения email

1. Пользователь вводит email
2. Отправляется код из 6 цифр
3. Код сохраняется в памяти (с таймаутом)
4. Пользователь вводит код
5. Email подтверждается (`emailConfirmed = true`)

---

## Telegram Bot интеграция

### Основные функции

1. **Управление группой/каналом:**
   - Добавление пользователей
   - Удаление пользователей
   - Бан/разбан пользователей

2. **Рассылки:**
   - Массовые рассылки сообщений
   - Персонализация через `usersData`
   - Поддержка HTML форматирования

3. **Отправка invite-ссылок:**
   - Автоматическая отправка ссылок на группу/канал
   - Разбан перед отправкой

### API эндпоинты бота

- `POST /api/bot/send-message` — отправка сообщения пользователю
- `POST /api/bot/send-invite-links` — отправка invite-ссылок
- `POST /api/bot/broadcast` — массовая рассылка

---

## Безопасность

### Хеширование паролей

Используется `bcrypt` с 10 раундами хеширования:

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### JWT токены

- **Access Token:** короткоживущий (обычно 1 час)
- **Refresh Token:** долгоживущий (обычно 7 дней)

### CORS настройки

```javascript
cors({
  origin: "*", // В продакшене указать конкретные домены
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
})
```

---

## Оптимизация производительности

### Frontend

- Code splitting через Vite
- Lazy loading компонентов
- Оптимизация изображений

### Backend

- Индексы MongoDB для часто запрашиваемых полей
- Пагинация для больших списков
- Кэширование статических данных

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024

