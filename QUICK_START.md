# 🚀 Быстрый старт

## Установка

### 1. Установите зависимости для админ-панели

```bash
cd client
npm install lucide-react
```

### 2. Создайте файл .env на сервере

```bash
cd server
```

Создайте файл `.env` со следующим содержимым:

```env
PORT=3000
MONGOURL=mongodb://localhost:27017/your_database
SecretKey=your_super_secret_key_for_jwt
SecretKeyRefresh=your_super_secret_refresh_key
MailSMTP=your_mail_smtp_password
```

### 3. Создайте файл .env на клиенте

```bash
cd client
```

Создайте файл `.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Запуск

### Терминал 1 - Сервер

```bash
cd server
npm run dev
```

### Терминал 2 - Клиент

```bash
cd client
npm run dev
```

## Первый запуск

### 1. Регистрация

Перейдите на `http://localhost:5173/register` и зарегистрируйтесь.

### 2. Установите роль admin

**Вариант 1: MongoDB Compass**
1. Откройте MongoDB Compass
2. Найдите вашу базу данных
3. Откройте коллекцию `users`
4. Найдите своего пользователя
5. Измените поле `role` на `"admin"`

**Вариант 2: Mongo Shell**
```javascript
db.users.updateOne(
    { mail: "your@email.com" },
    { $set: { role: "admin" } }
)
```

### 3. Войдите в админ-панель

1. Перейдите на `http://localhost:5173/login`
2. Войдите с вашими учетными данными
3. Вы будете перенаправлены на `/admin`

## Структура проекта

```
tochkaLi/
├── server/
│   ├── Controllers/          # Контроллеры API
│   │   ├── UserController.js
│   │   ├── FAQController.js
│   │   ├── HoroscopeController.js
│   │   └── ...
│   ├── Models/              # Модели MongoDB
│   │   ├── User.js
│   │   ├── FAQ.js
│   │   └── ...
│   ├── Middlewares/         # Middleware
│   │   └── authMiddleware.js
│   └── index.js             # Точка входа сервера
│
└── client/
    ├── src/
    │   ├── components/      # Переиспользуемые компоненты
    │   │   ├── AdminLayout.tsx
    │   │   ├── AdminTable.tsx
    │   │   ├── RichTextEditor.tsx
    │   │   ├── Modal.tsx
    │   │   └── ...
    │   ├── pages/
    │   │   ├── Admin/       # Страницы админки
    │   │   │   ├── Main.tsx
    │   │   │   ├── FAQ.tsx
    │   │   │   ├── Horoscope.tsx
    │   │   │   └── ...
    │   │   ├── Login.tsx
    │   │   └── Register.tsx
    │   ├── contexts/        # React Contexts
    │   │   └── AuthContext.tsx
    │   ├── api.tsx          # Axios конфигурация
    │   └── routes.tsx       # Маршруты приложения
    └── package.json
```

## Основные функции

### ✅ Реализовано

#### Авторизация
- ✅ Регистрация пользователей
- ✅ Вход в систему
- ✅ Единственная сессия (при входе с нового устройства старая сессия закрывается)
- ✅ Защита маршрутов по ролям
- ✅ Автоматическая проверка сессии каждые 5 минут

#### API (7 сущностей)
- ✅ FAQ
- ✅ Гороскопы
- ✅ Медитации
- ✅ Практики
- ✅ Видео уроки
- ✅ Расписание событий
- ✅ Транзиты планет

#### Админ-панель
- ✅ Навигация по всем разделам
- ✅ Список записей для каждой сущности
- ✅ Создание новых записей
- ✅ Редактирование существующих
- ✅ Удаление с подтверждением
- ✅ Rich Text Editor с форматированием:
  - Жирный, курсив, подчёркивание
  - Списки (упорядоченные и неупорядоченные)
  - Ссылки
  - Заголовки (H1, H2, H3)

## Документация

📚 **Полная документация:**
- `API_DOCUMENTATION.md` - Документация по всем API эндпоинтам
- `AUTH_README.md` - Документация по системе авторизации
- `ADMIN_PANEL_README.md` - Подробная документация по админ-панели

## Основные маршруты

### Клиент

- `/` - Главная страница пользователя (защищена)
- `/login` - Страница входа
- `/register` - Страница регистрации
- `/admin` - Главная страница админки (только admin)
- `/admin/faq` - Управление FAQ
- `/admin/horoscope` - Управление гороскопами
- `/admin/meditation` - Управление медитациями
- `/admin/practice` - Управление практиками
- `/admin/video-lesson` - Управление видео уроками
- `/admin/schedule` - Управление расписанием
- `/admin/transit` - Управление транзитами

### API эндпоинты

#### Авторизация (публичные)
```
POST /api/user/register
POST /api/user/login
```

#### Защищенные (требуют авторизации)
```
GET  /api/user/me
GET  /api/user/check-session
```

#### CRUD для каждой сущности
```
GET    /api/faq           # Получить все
POST   /api/faq           # Создать (требует токен)
GET    /api/faq/:id       # Получить по ID
PUT    /api/faq/:id       # Обновить (требует токен)
DELETE /api/faq/:id       # Удалить (требует токен)
```

Аналогично для:
- `/api/horoscope`
- `/api/meditation`
- `/api/practice`
- `/api/video-lesson`
- `/api/schedule`
- `/api/transit`

## Решение проблем

### Ошибка: "secret or public key must be provided"

Проблема: Не установлены переменные окружения на сервере.

**Решение:** Создайте файл `/server/.env` с секретными ключами.

### Админ-панель недоступна

Проблема: У пользователя нет роли admin.

**Решение:** Измените роль в MongoDB на "admin".

### Rich Text Editor не отображается

Проблема: Не установлены зависимости.

**Решение:**
```bash
cd client
npm install lucide-react
npm run dev
```

## Полезные команды

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки (сервер)
npm run dev

# Запуск в режиме разработки (клиент)
npm run dev

# Сборка для production (клиент)
npm run build
```

## Технологии

### Backend
- Express.js
- MongoDB + Mongoose
- JWT для авторизации
- bcrypt для хеширования паролей
- nodemailer для отправки email

### Frontend
- React 19
- TypeScript
- React Router DOM
- Axios
- Lucide React (иконки)
- Tailwind CSS
- React Toastify (уведомления)
- Custom Rich Text Editor (contentEditable API)

## Готово! 🎉

Теперь у вас есть полностью функциональная админ-панель с CRUD операциями, Rich Text Editor и системой авторизации.

**Следующие шаги:**
1. Настройте переменные окружения
2. Запустите сервер и клиент
3. Зарегистрируйтесь и установите роль admin
4. Начните создавать контент!

