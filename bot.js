// bot.js - Полный функционал для бота Газпром
const { Bot, Keyboard } = require('@maxhub/max-bot-api');

// Проверка токена
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ ОШИБКА: BOT_TOKEN не найден!');
  console.log('📝 Установите переменную окружения в BotHost');
  process.exit(1);
}

console.log('🚀 Запускаем бота для Газпром...');

// Создаем экземпляр бота
const bot = new Bot(BOT_TOKEN);

// Устанавливаем команды бота
bot.api.setMyCommands([
  { name: 'start', description: 'Запустить бота' },
  { name: 'contacts', description: 'Контактная информация' },
  { name: 'pay', description: 'Оплатить за газ' }
]);

// ==================== ОБРАБОТЧИКИ КОМАНД ====================

// Команда /start - главное меню
bot.command('start', async (ctx) => {
  console.log(`👤 Пользователь ${ctx.from?.user_id} вызвал /start`);
  
  // Создаем клавиатуру
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.callback('📞 Контакты', 'show_contacts'),
      Keyboard.button.link('💳 Оплатить', 'https://samararegiongaz.ru/consumer/online/')
    ],
    [
      Keyboard.button.requestContact('📱 Отправить контакт'),
      Keyboard.button.requestGeoLocation('📍 Отправить геолокацию')
    ]
  ]);
  
  await ctx.reply(
    `👋 Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\n` +
    `Мы предоставляем услуги по поставке газа в Самарской области.\n\n` +
    `🛠️ Выберите нужный раздел:`,
    { attachments: [keyboard] }
  );
});

// Команда /contacts - контакты
bot.command('contacts', async (ctx) => {
  const contacts = `📞 **Контактная информация:**\n\n` +
    `• Телефон: 8 846 212-32-12\n` +
    `• Горячая линия: 8 800 201-04-04\n` +
    `• Адрес: ул. Ново-Садовая, 307А, Самара\n` +
    `• Email: srg@samgas.ru\n\n` +
    `⏰ **Режим работы:**\n` +
    `Пн-Чт: 8:30-17:30\n` +
    `Пт: 8:30-16:15\n` +
    `Обед: 13:00-13:45`;
  
  const keyboard = Keyboard.inlineKeyboard([
    [Keyboard.button.callback('🔙 Назад в меню', 'back_to_menu')]
  ]);
  
  await ctx.reply(contacts, { 
    format: 'markdown',
    attachments: [keyboard]
  });
});

// Команда /pay - оплата
bot.command('pay', async (ctx) => {
  const paymentInfo = `💳 **Оплата за газ:**\n\n` +
    `Для оплаты услуг перейдите по ссылке:\n` +
    `https://samararegiongaz.ru/consumer/online/\n\n` +
    `📱 **Мобильные приложения:**\n` +
    `• Сбербанк Онлайн\n` +
    `• Тинькофф\n` +
    `• Госуслуги\n\n` +
    `🏛️ **Терминалы оплаты:**\n` +
    `• Отделения банков\n` +
    `• Почта России\n` +
    `• Платежные терминалы`;
  
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.link('💳 Оплатить онлайн', 'https://samararegiongaz.ru/consumer/online/'),
      Keyboard.button.callback('📞 Контакты', 'show_contacts')
    ],
    [Keyboard.button.callback('🔙 Назад', 'back_to_menu')]
  ]);
  
  await ctx.reply(paymentInfo, { 
    format: 'markdown',
    attachments: [keyboard]
  });
});

// ==================== ОБРАБОТЧИКИ CALLBACK-КНОПОК ====================

// Показать контакты (callback)
bot.action('show_contacts', async (ctx) => {
  const contacts = `📞 **Контакты:**\n8 846 212-32-12\n8 800 201-04-04\nул. Ново-Садовая, 307А\nsrg@samgas.ru`;
  
  const keyboard = Keyboard.inlineKeyboard([
    [Keyboard.button.callback('🔙 Назад в меню', 'back_to_menu')]
  ]);
  
  await ctx.editMessageText(contacts, {
    format: 'markdown',
    attachments: [keyboard]
  });
  
  await ctx.answerOnCallback({
    notification: 'Контакты загружены'
  });
});

// Вернуться в меню
bot.action('back_to_menu', async (ctx) => {
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.callback('📞 Контакты', 'show_contacts'),
      Keyboard.button.link('💳 Оплатить', 'https://samararegiongaz.ru/consumer/online/')
    ]
  ]);
  
  await ctx.editMessageText(
    `🏠 **Главное меню**\n\n` +
    `Выберите раздел:`,
    { 
      format: 'markdown',
      attachments: [keyboard]
    }
  );
  
  await ctx.answerOnCallback();
});

// ==================== ОБРАБОТЧИКИ СООБЩЕНИЙ ====================

// Обработка геолокации
bot.on('message_created', async (ctx, next) => {
  if (ctx.location) {
    console.log(`📍 Получена геолокация от ${ctx.from?.user_id}`);
    await ctx.reply(
      `📍 Спасибо! Ваша геолокация получена:\n` +
      `Широта: ${ctx.location.latitude}\n` +
      `Долгота: ${ctx.location.longitude}\n\n` +
      `Ближайший офис: ул. Ново-Садовая, 307А`
    );
    return;
  }
  return next();
});

// Обработка контактов
bot.on('message_created', async (ctx, next) => {
  if (ctx.contactInfo) {
    console.log(`📱 Получен контакт от ${ctx.from?.user_id}`);
    await ctx.reply(
      `✅ Контактная информация получена:\n` +
      `Имя: ${ctx.contactInfo.fullName || 'не указано'}\n` +
      `Телефон: ${ctx.contactInfo.tel || 'не указан'}\n\n` +
      `Мы свяжемся с вами в ближайшее время!`
    );
    return;
  }
  return next();
});

// Обработка текстовых сообщений
bot.on('message_created', async (ctx, next) => {
  const text = ctx.message?.body?.text;
  
  if (text && !text.startsWith('/')) {
    console.log(`💬 Сообщение от ${ctx.from?.user_id}: "${text}"`);
    
    // Клавиатура для ответа
    const keyboard = Keyboard.inlineKeyboard([
      [
        Keyboard.button.callback('📞 Контакты', 'show_contacts'),
        Keyboard.button.link('💳 Оплатить', 'https://samararegiongaz.ru/consumer/online/')
      ]
    ]);
    
    await ctx.reply(
      `📝 Вы написали: "${text}"\n\n` +
      `Для связи с нами используйте:\n` +
      `• Команду /contacts - контактная информация\n` +
      `• Команду /pay - оплата услуг\n` +
      `• Или выберите нужный раздел ниже:`,
      { attachments: [keyboard] }
    );
  }
  
  return next();
});

// ==================== СЛУЖЕБНЫЕ ФУНКЦИИ ====================

// Обработчик ошибок
bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error);
});

// Обработчик успешного запуска
bot.on('bot_started', () => {
  console.log('✅ Бот успешно запущен и подключен к MAX!');
  console.log('🤖 Бот готов принимать сообщения...');
  console.log('📱 Функционал:');
  console.log('  • Команда /start - главное меню');
  console.log('  • Команда /contacts - контакты');
  console.log('  • Команда /pay - оплата');
  console.log('  • Инлайн-кнопки с callback');
  console.log('  • Обработка геолокации и контактов');
});

// Запускаем бота
console.log('⏳ Подключаемся к серверам MAX...');
bot.start();

// Информация о запуске
console.log('📊 Информация о системе:');
console.log('Node.js:', process.version);
console.log('Токен:', BOT_TOKEN ? 'получен' : 'не получен');
console.log('Время запуска:', new Date().toLocaleString());
console.log('='.repeat(50));

// Обработка завершения
process.on('SIGTERM', () => {
  console.log('\n🛑 Получен SIGTERM, завершаем работу...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Получен SIGINT, завершаем работу...');
  process.exit(0);
});
