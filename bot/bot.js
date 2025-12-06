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
  
  // Удаляем menu button, чтобы остался только inline
  try {
    await bot.telegram.setChatMenuButton({
      chatId,
      menuButton: { type: "default" }
    });
  } catch (error) {
    console.log("Ошибка при удалении menu button:", error);
  }
  
  await axios.post(`${process.env.API_URL}/api/user/create`, {
    telegramId: telegramId,
    telegramUserName: telegramUserName,
    referralTelegramId: startParam || null
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Отправляем сообщение с inline кнопкой для запуска WebApp
  await ctx.reply(
    `Портал .li активирован.\nЖми кнопку запуска👇`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🚀 Открыть Портал .li',
            url: `https://kulzhabay.kz?telegramId=${telegramId}&telegramUserName=${telegramUserName}`
          }
        ]]
      }
    }
  );
});

// Команда для удаления menu button (запустите /removemenu один раз)
bot.command('removemenu', async (ctx) => {
  try {
    await bot.telegram.setChatMenuButton({
      menuButton: { type: "default" }
    });
    await ctx.reply('✅ Menu button удалён глобально');
  } catch (error) {
    await ctx.reply('❌ Ошибка при удалении menu button');
  }
});

// Бот запускается из server.js, поэтому здесь не запускаем
