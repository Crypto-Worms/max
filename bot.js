// bot.js - безопасная версия с переменными окружения

// Аналог: from dotenv import load_dotenv
require('dotenv').config();

// Аналог: import { Bot, Keyboard } from ...
const { Bot, Keyboard } = require('@maxhub/max-bot-api');

// Аналог: TOKEN = os.getenv('BOT_TOKEN')
const BOT_TOKEN = process.env.BOT_TOKEN;

// Проверяем токен
if (!BOT_TOKEN) {
  console.error('❌ ОШИБКА: Токен бота не найден!');
  console.log('\n📝 Установите переменную окружения BOT_TOKEN:');
  console.log('1. На BotHost: добавьте в Environment Variables');
  console.log('2. Локально: создайте файл .env с BOT_TOKEN=ваш_токен');
  console.log('\n💡 Получите токен у @BotFather в MAX');
  process.exit(1);
}

console.log('✅ Токен получен из переменных окружения');
console.log('🚀 Запускаем бота...');

// Создаем экземпляр бота (аналог: bot = Bot(token=TOKEN))
const bot = new Bot(BOT_TOKEN);

// === ОСТАЛЬНОЙ КОД БОТА БЕЗ ИЗМЕНЕНИЙ ===

// Обработчик команды /start
bot.command('start', async (ctx) => {
  console.log('🔹 Пользователь вызвал /start');
  
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.message('📞 Контакты', 'Контакты'),
      Keyboard.button.link('💳 Заплатить за газ', 'https://samararegiongaz.ru/consumer/online/')
    ]
  ]);

  await ctx.reply(
    `Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\n` +
    `Выберите нужный раздел:`,
    { attachments: [keyboard] }
  );
});

// Обработчик текста "Контакты"
bot.hears('Контакты', async (ctx) => {
  const contacts = `📞 **Актуальные контакты:**\n\n` +
    `• Телефон: 8 846 212-32-12\n` +
    `• Горячая линия: 8 800 201-04-04\n` +
    `• Адрес: ул. Ново-Садовая, 307А\n` +
    `• Email: srg@samgas.ru`;

  const backKeyboard = Keyboard.inlineKeyboard([
    [Keyboard.button.message('🔙 Назад', 'Назад')]
  ]);

  await ctx.reply(contacts, { 
    format: 'markdown',
    attachments: [backKeyboard]
  });
});

// Обработчик текста "Назад"
bot.hears('Назад', async (ctx) => {
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.message('📞 Контакты', 'Контакты'),
      Keyboard.button.link('💳 Заплатить за газ', 'https://samararegiongaz.ru/consumer/online/')
    ]
  ]);

  await ctx.reply(
    `Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\n` +
    `Выберите нужный раздел:`,
    { attachments: [keyboard] }
  );
});

// Обработчик команды /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    `Доступные команды:\n` +
    `/start - Начать работу с ботом\n` +
    `/help - Помощь\n\n` +
    `Используйте кнопки для навигации.`
  );
});

// Запускаем бота
bot.start();

console.log('🤖 Бот успешно запущен и ожидает сообщений...');
