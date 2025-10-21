# Схема работы интеграции с Robokassa

## Визуальная схема процесса оплаты

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ПРОЦЕСС ОПЛАТЫ КУРСА                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Пользователь │
│  на сайте    │
└──────┬───────┘
       │ 1. Нажимает "Оплатить курс"
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  КЛИЕНТ (React)                                                       │
│  components/RobokassaPayment.tsx                                     │
├──────────────────────────────────────────────────────────────────────┤
│  ✓ Получает данные из .env:                                          │
│    - VITE_ROBOKASSA_MERCHANT_LOGIN                                   │
│    - VITE_ROBOKASSA_PASSWORD1                                        │
│                                                                       │
│  ✓ Генерирует:                                                       │
│    - InvoiceID (timestamp)                                           │
│    - OutSum (сумма)                                                  │
│                                                                       │
│  ✓ Формирует строку подписи:                                         │
│    MerchantLogin:OutSum:InvoiceID:Password1:Shp_userId=userId       │
│                                                                       │
│  ✓ Вычисляет MD5 хеш (crypto-js)                                    │
│                                                                       │
│  ✓ Формирует URL с параметрами:                                      │
│    - MerchantLogin                                                   │
│    - OutSum                                                          │
│    - InvoiceID                                                       │
│    - Description                                                     │
│    - SignatureValue                                                  │
│    - Shp_userId (ID пользователя)                                   │
│    - SuccessURL                                                      │
│    - FailURL                                                         │
│    - IsTest (0 или 1)                                               │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ 2. Перенаправление
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ROBOKASSA                                                            │
│  https://auth.robokassa.ru/Merchant/Index.aspx                       │
├──────────────────────────────────────────────────────────────────────┤
│  Пользователь видит форму оплаты:                                    │
│  ┌──────────────────────────────────┐                                │
│  │ Оплата курса TochkaLi            │                                │
│  │ Сумма: 5000 ₸                    │                                │
│  │                                   │                                │
│  │ [Номер карты]                    │                                │
│  │ [Срок действия]                  │                                │
│  │ [CVC]                            │                                │
│  │                                   │                                │
│  │          [Оплатить]              │                                │
│  └──────────────────────────────────┘                                │
└───────────┬────────────────────────────────────┬─────────────────────┘
            │ Успешная оплата                    │ Отмена/Ошибка
            │ 3. Отправка результата              │
            ▼                                     ▼
┌──────────────────────────────────────┐  ┌──────────────────────────┐
│  СЕРВЕР - Result URL                 │  │  СЕРВЕР - Fail URL       │
│  POST/GET /api/robres                │  │  GET /api/robokassa/fail │
└──────────────────────────────────────┘  └──────────────────────────┘
            │                                     │
            │ 4. Обработка результата             │
            ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│  СЕРВЕР (Node.js + Express)                                          │
│  server/Controllers/RobokassaController.js                           │
├──────────────────────────────────────────────────────────────────────┤
│  handleResult():                                                      │
│                                                                       │
│  ✓ Получает параметры от Robokassa:                                 │
│    - OutSum                                                          │
│    - InvId                                                           │
│    - SignatureValue                                                  │
│    - Shp_userId                                                      │
│                                                                       │
│  ✓ Формирует строку для проверки:                                   │
│    OutSum:InvId:Password2:Shp_userId=userId                         │
│                                                                       │
│  ✓ Вычисляет MD5 хеш (crypto)                                       │
│                                                                       │
│  ✓ Сравнивает подписи:                                              │
│    calculatedSignature === SignatureValue ?                          │
│                                                                       │
│  ✓ Если верно - обновляет пользователя:                             │
│    User.findByIdAndUpdate(userId, {                                 │
│      hasPaid: true,                                                  │
│      paymentDate: Date.now(),                                        │
│      paymentAmount: OutSum,                                          │
│      invoiceId: InvId                                                │
│    })                                                                │
│                                                                       │
│  ✓ Отвечает Robokassa: "OK{InvId}"                                  │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ 5. Перенаправление пользователя
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  СЕРВЕР - Success URL                                                 │
│  GET /api/robokassa/success                                          │
├──────────────────────────────────────────────────────────────────────┤
│  handleSuccess():                                                     │
│                                                                       │
│  ✓ Проверяет подпись                                                 │
│  ✓ Возвращает HTML страницу с подтверждением:                        │
│                                                                       │
│  ┌────────────────────────────────────────┐                          │
│  │           ✓                             │                          │
│  │                                         │                          │
│  │    Оплата успешна!                     │                          │
│  │                                         │                          │
│  │    Спасибо за покупку!                 │                          │
│  │    Ваш платеж обработан.               │                          │
│  │                                         │                          │
│  │    Номер счета: 1729512345678          │                          │
│  │    Сумма: 5000 ₸                       │                          │
│  │                                         │                          │
│  │    [Вернуться на сайт]                 │                          │
│  └────────────────────────────────────────┘                          │
└──────────────────────────────────────────────────────────────────────┘
```

## Структура данных

### 1. Клиент → Robokassa

```javascript
URL: https://auth.robokassa.ru/Merchant/Index.aspx

Параметры:
{
  MerchantLogin: "merchant_login",
  OutSum: "5000.00",
  InvoiceID: "1729512345678",
  Description: "Оплата курса TochkaLi",
  SignatureValue: "a1b2c3d4e5f6...",  // MD5 hash
  IsTest: "1",                          // 1 - тест, 0 - продакшен
  Shp_userId: "67890abcdef12345",       // ID пользователя
  SuccessURL: "https://api.kulzhabay.kz/api/robokassa/success",
  FailURL: "https://api.kulzhabay.kz/api/robokassa/fail"
}

Подпись (MD5):
MerchantLogin:OutSum:InvoiceID:Password1:Shp_userId=userId
```

### 2. Robokassa → Сервер (Result URL)

```javascript
URL: https://api.kulzhabay.kz/api/robres

Метод: POST или GET

Параметры:
{
  OutSum: "5000.00",
  InvId: "1729512345678",
  SignatureValue: "x9y8z7w6v5...",     // MD5 hash
  Shp_userId: "67890abcdef12345"
}

Подпись для проверки (MD5):
OutSum:InvId:Password2:Shp_userId=userId

Ответ сервера:
"OK1729512345678"  // OK + InvoiceID
```

### 3. Обновление пользователя в БД

```javascript
MongoDB Update:
{
  _id: "67890abcdef12345",
  hasPaid: true,
  paymentDate: ISODate("2025-10-21T12:00:00Z"),
  paymentAmount: 5000,
  invoiceId: "1729512345678"
}
```

## Безопасность

### Генерация подписи (клиент)

```javascript
// Строка для подписи
const signatureString = 
  `${merchantLogin}:${outSum}:${invoiceId}:${password1}:Shp_userId=${userId}`;

// MD5 хеш
const signature = CryptoJS.MD5(signatureString).toString();
```

### Проверка подписи (сервер)

```javascript
// Строка для проверки
const signatureString = 
  `${OutSum}:${InvId}:${password2}:Shp_userId=${userId}`;

// MD5 хеш
const calculatedSignature = crypto
  .createHash('md5')
  .update(signatureString)
  .digest('hex')
  .toUpperCase();

// Сравнение
if (calculatedSignature === SignatureValue.toUpperCase()) {
  // Подпись верна - обрабатываем платеж
}
```

## Переменные окружения

### client/.env
```
VITE_ROBOKASSA_MERCHANT_LOGIN → Для формирования URL
VITE_ROBOKASSA_PASSWORD1      → Для генерации подписи
VITE_ROBOKASSA_TEST_MODE      → Режим работы (0/1)
VITE_API_URL                  → Для Success/Fail URL
```

### server/.env
```
ROBOKASSA_MERCHANT_LOGIN → Для проверки
ROBOKASSA_PASSWORD2      → Для проверки подписи (Result)
ROBOKASSA_PASSWORD1      → Для проверки подписи (Success)
CLIENT_URL               → Для редиректа пользователя
```

## Важные моменты

⚠️ **Password1** используется для создания платежа (клиент) и проверки Success URL  
⚠️ **Password2** используется для проверки Result URL (сервер)  
⚠️ Подписи должны быть в верхнем регистре (UPPERCASE)  
⚠️ Порядок параметров в строке подписи важен  
⚠️ Дополнительные параметры (Shp_*) должны быть отсортированы по алфавиту  
⚠️ Result URL должен отвечать "OK{InvoiceID}" для подтверждения  

## Тестовые данные Robokassa

### Тестовый режим (IsTest=1)
- Используется тот же URL
- Деньги не списываются
- Можно использовать тестовые карты
- Логи доступны в личном кабинете

### Тестовые карты
См. документацию Robokassa: https://docs.robokassa.ru/testing/

---

**Примечание:** Эта схема актуальна на октябрь 2025 года.  
Для обновлений см. официальную документацию Robokassa.

