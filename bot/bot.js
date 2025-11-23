import { Telegraf } from 'telegraf';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Экспортируем бота для использования в других модулях
export default bot;

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const telegramId = ctx.from.id;

  console.log("chatId:", chatId);
  const telegramUserName = ctx.from.username;
  console.log("telegramUserName:", telegramUserName);
  // 1. Сбрасываем глобальное меню (если есть)
  await bot.telegram.setChatMenuButton({
    menuButton: { type: "default" }
  });

  // 2. Сбрасываем локальное меню
  await bot.telegram.setChatMenuButton({
    chatId,
    menuButton: { type: "default" }
  });

  // 3. Устанавливаем новую кнопку (обновление через параметр v)
  await bot.telegram.setChatMenuButton({
    chatId,
    menuButton: {
      type: "web_app",
      text: "testButton",
      web_app: {
        url: `https://kulzhabay.kz?telegramId=${telegramId}&telegramUserName=${telegramUserName}&v=${Date.now()}`
      }
    }
  });

  await ctx.reply("Кнопка обновлена.");
});

// Бот запускается из server.js, поэтому здесь не запускаем
