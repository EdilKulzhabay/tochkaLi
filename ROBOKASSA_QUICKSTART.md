# Быстрый старт: Интеграция Robokassa

## Что было сделано

✅ Создан компонент кнопки оплаты `RobokassaPayment`  
✅ Добавлена страница оплаты курса  
✅ Настроена серверная обработка результатов оплаты  
✅ Добавлены поля для отслеживания оплаты в модель пользователя  
✅ Установлена библиотека crypto-js для генерации MD5 подписи  

## Что нужно настроить

### 1. Создайте файл `.env` в папке `client/`

```env
VITE_API_URL=https://api.kulzhabay.kz/api
VITE_ROBOKASSA_MERCHANT_LOGIN=ваш_merchant_login
VITE_ROBOKASSA_PASSWORD1=ваш_password1
VITE_ROBOKASSA_PASSWORD2=ваш_password2
VITE_ROBOKASSA_TEST_MODE=1
```

### 2. Добавьте в файл `.env` в папке `server/`

```env
ROBOKASSA_MERCHANT_LOGIN=ваш_merchant_login
ROBOKASSA_PASSWORD1=ваш_password1
ROBOKASSA_PASSWORD2=ваш_password2
CLIENT_URL=https://kulzhabay.kz
```

### 3. Настройте Robokassa

В личном кабинете Robokassa установите:

**Result URL:**  
`https://api.kulzhabay.kz/api/robres`

**Success URL:**  
`https://api.kulzhabay.kz/api/robokassa/success`

**Fail URL:**  
`https://api.kulzhabay.kz/api/robokassa/fail`

## Как использовать

Кнопка оплаты уже добавлена на страницу `/` (User/Main.tsx):

```tsx
<RobokassaPayment 
  amount={5000} 
  description="Оплата курса TochkaLi"
/>
```

Вы можете изменить сумму и описание по необходимости.

## Тестирование

1. Запустите клиент: `cd client && npm run dev`
2. Запустите сервер: `cd server && npm run dev`
3. Авторизуйтесь в системе
4. Перейдите на главную страницу пользователя
5. Нажмите кнопку "Оплатить курс"
6. Используйте тестовую карту из документации Robokassa

## Как это работает

1. Пользователь нажимает кнопку "Оплатить курс"
2. Система формирует ссылку на оплату с MD5 подписью
3. Пользователь перенаправляется на страницу Robokassa
4. После оплаты Robokassa отправляет результат на ваш сервер
5. Сервер проверяет подпись и обновляет статус пользователя
6. Пользователь видит страницу успешной оплаты

## Безопасность

✅ Все пароли хранятся в переменных окружения  
✅ Результаты оплаты проверяются по MD5 подписи  
✅ Password1 для создания платежа, Password2 для проверки результата  

## Структура файлов

```
client/
  └── src/
      ├── components/RobokassaPayment.tsx    # Кнопка оплаты
      └── pages/User/Main.tsx                 # Страница с кнопкой

server/
  ├── Controllers/RobokassaController.js     # Обработка оплаты
  ├── Models/User.js                         # Модель с полями оплаты
  └── index.js                               # Маршруты

/ROBOKASSA_SETUP.md                          # Полная документация
```

## Следующие шаги

1. Создайте файлы .env с настройками Robokassa
2. Настройте URL в личном кабинете Robokassa
3. Протестируйте в тестовом режиме
4. Для продакшена установите `VITE_ROBOKASSA_TEST_MODE=0`

Подробная документация: [ROBOKASSA_SETUP.md](./ROBOKASSA_SETUP.md)

