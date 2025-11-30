import { Telegraf } from 'telegraf';
import 'dotenv/config';
import axios from 'axios';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Экспортируем бота для использования в других модулях
export default bot;

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const telegramId = ctx.from.id;

  console.log("chatId:", chatId);
  const telegramUserName = ctx.from.username;
  console.log("telegramUserName:", telegramUserName);
  
  // Получаем реферальный ID из параметра start
  // В Telegraf параметр start доступен через ctx.startParam
  const startParam = ctx.startParam || (ctx.message?.text?.split(' ')[1] || null);
  console.log("startParam (referral ID):", startParam);
  
  await axios.post(`${process.env.API_URL}/api/user/create`, {
    telegramId: telegramId,
    telegramUserName: telegramUserName,
    referralTelegramId: startParam || null
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Получаем информацию о боте для получения username
  const botInfo = await bot.telegram.getMe();
  const botUsername = botInfo.username;
  
  // 1. Сбрасываем глобальное меню (если есть)
  await bot.telegram.setChatMenuButton({
    menuButton: { type: "default" }
  });

  // 2. Сбрасываем локальное меню
  await bot.telegram.setChatMenuButton({
    chatId,
    menuButton: { type: "default" }
  });

  // 3. Устанавливаем новую кнопку используя формат t.me/... с параметром startapp
  // Формируем параметры для передачи в веб-приложение
  const appParams = new URLSearchParams({
    telegramId: telegramId.toString(),
    telegramUserName: telegramUserName || '',
    v: Date.now().toString()
  });
  
  // Используем формат deep link через бота: t.me/bot_username?startapp=params
  // Параметры будут доступны в веб-приложении через window.Telegram.WebApp.initDataUnsafe.start_param
  await bot.telegram.setChatMenuButton({
    chatId,
    menuButton: {
      type: "web_app",
      text: "Портал .li",
      web_app: {
        url: `https://t.me/${botUsername}?startapp=${encodeURIComponent(appParams.toString())}`
      },
    }
  });

  await ctx.reply(`Портал .li активирован.\nЖми кнопку запуска👇`);
});

// Бот запускается из server.js, поэтому здесь не запускаем
