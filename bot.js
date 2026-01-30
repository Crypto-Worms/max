// bot.js - Работаем напрямую с API MAX
require('dotenv').config();
const axios = require('axios');
const http = require('http');

const BOT_TOKEN = process.env.BOT_TOKEN;
const MAX_API_BASE = 'https://api.max.ru/bot/v1';

// Проверка токена
if (!BOT_TOKEN) {
  console.error('❌ ОШИБКА: BOT_TOKEN не найден!');
  console.log('📝 Установите переменную окружения в BotHost');
  console.log('💡 Получите токен у @PrimeBot в MAX');
  process.exit(1);
}

console.log('🚀 Запускаем бота для Газпром...');
console.log('✅ Токен получен');

// ==================== API ФУНКЦИИ ====================

async function callMaxApi(method, data = {}) {
  try {
    const url = `${MAX_API_BASE}/${method}`;
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOT_TOKEN}`
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Ошибка API ${method}:`, error.response?.data || error.message);
    return null;
  }
}

async function sendMessage(chatId, text, options = {}) {
  const data = {
    chat_id: chatId,
    text: text,
    ...options
  };
  return await callMaxApi('sendMessage', data);
}

// ==================== ОБРАБОТКА КОМАНД ====================

function processCommand(text, chatId, userId, userName) {
  const command = text.toLowerCase().trim();
  
  if (command === '/start' || command === '/start@' || text === '/start') {
    return {
      response: `👋 Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\n` +
                `Мы предоставляем услуги по поставке газа в Самарской области.\n\n` +
                `🛠️ Выберите нужный раздел:\n\n` +
                `📞 Контакты - контактная информация\n` +
                `💳 Оплатить - оплата услуг онлайн\n` +
                `📱 Помощь - справка по использованию`,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📞 Контакты', callback_data: 'contacts' },
            { text: '💳 Оплатить', url: 'https://samararegiongaz.ru/consumer/online/' }
          ],
          [
            { text: '📱 Отправить контакт', callback_data: 'request_contact' },
            { text: '📍 Геолокация', callback_data: 'request_location' }
          ]
        ]
      }
    };
  }
  
  if (command === '/contacts' || command.includes('контакт')) {
    return {
      response: `📞 **Контактная информация:**\n\n` +
                `• Телефон: 8 846 212-32-12\n` +
                `• Горячая линия: 8 800 201-04-04\n` +
                `• Адрес: ул. Ново-Садовая, 307А, Самара\n` +
                `• Email: srg@samgas.ru\n\n` +
                `⏰ **Режим работы:**\n` +
                `Пн-Чт: 8:30-17:30\n` +
                `Пт: 8:30-16:15\n` +
                `Обед: 13:00-13:45`,
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад в меню', callback_data: 'menu' }]
        ]
      },
      parse_mode: 'Markdown'
    };
  }
  
  if (command === '/pay' || command.includes('оплат')) {
    return {
      response: `💳 **Оплата за газ:**\n\n` +
                `Для оплаты услуг перейдите по ссылке:\n` +
                `https://samararegiongaz.ru/consumer/online/\n\n` +
                `📱 **Мобильные приложения:**\n` +
                `• Сбербанк Онлайн\n` +
                `• Тинькофф\n` +
                `• Госуслуги\n\n` +
                `🏛️ **Терминалы оплаты:**\n` +
                `• Отделения банков\n` +
                `• Почта России\n` +
                `• Платежные терминалы`,
      keyboard: {
        inline_keyboard: [
          [
            { text: '💳 Оплатить онлайн', url: 'https://samararegiongaz.ru/consumer/online/' },
            { text: '📞 Контакты', callback_data: 'contacts' }
          ],
          [{ text: '🔙 Назад', callback_data: 'menu' }]
        ]
      },
      parse_mode: 'Markdown'
    };
  }
  
  if (command === '/help' || command === '/помощь') {
    return {
      response: `📱 **Помощь по использованию бота:**\n\n` +
                `Доступные команды:\n` +
                `/start - Главное меню\n` +
                `/contacts - Контактная информация\n` +
                `/pay - Оплата услуг\n` +
                `/help - Эта справка\n\n` +
                `Также вы можете использовать кнопки ниже:`,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📞 Контакты', callback_data: 'contacts' },
            { text: '💳 Оплатить', url: 'https://samararegiongaz.ru/consumer/online/' }
          ]
        ]
      },
      parse_mode: 'Markdown'
    };
  }
  
  // Любое другое сообщение
  return {
    response: `👋 Привет, ${userName || 'друг'}!\n\n` +
              `Вы написали: "${text}"\n\n` +
              `Для получения информации используйте:\n` +
              `• /start - главное меню\n` +
              `• /contacts - контакты\n` +
              `• /pay - оплата\n` +
              `• /help - помощь\n\n` +
              `Или выберите нужный раздел ниже:`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '📞 Контакты', callback_data: 'contacts' },
          { text: '💳 Оплатить', url: 'https://samararegiongaz.ru/consumer/online/' }
        ],
        [{ text: '🆘 Помощь', callback_data: 'help' }]
      ]
    }
  };
}

// ==================== HTTP СЕРВЕР ДЛЯ ВЕБХУКА ====================

const server = http.createServer(async (req, res) => {
  // Корневой путь - статус бота
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: 'Газпром межрегионгаз Самара Бот',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Вебхук от MAX
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        console.log('📨 Получен вебхук:', JSON.stringify(update, null, 2));
        
        // Обрабатываем обновление
        await handleUpdate(update);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('❌ Ошибка обработки вебхука:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// ==================== ОБРАБОТКА ОБНОВЛЕНИЙ ====================

async function handleUpdate(update) {
  // Обработка сообщений
  if (update.message && update.message.text) {
    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const userName = message.from.first_name || message.from.username || 'Пользователь';
    const text = message.text;
    
    console.log(`💬 Сообщение от ${userName} (${userId}): "${text}"`);
    
    // Обрабатываем команду
    const result = processCommand(text, chatId, userId, userName);
    
    // Отправляем ответ
    await sendMessage(chatId, result.response, {
      reply_markup: result.keyboard,
      parse_mode: result.parse_mode || 'HTML'
    });
  }
  
  // Обработка callback-запросов
  else if (update.callback_query) {
    const callback = update.callback_query;
    const chatId = callback.message.chat.id;
    const data = callback.data;
    const userId = callback.from.id;
    
    console.log(`🔘 Callback от ${userId}: ${data}`);
    
    // Обрабатываем callback
    let responseText = '';
    let keyboard = {};
    let parse_mode = 'HTML';
    
    switch (data) {
      case 'contacts':
        responseText = `📞 **Контакты:**\n8 846 212-32-12\n8 800 201-04-04\nул. Ново-Садовая, 307А\nsrg@samgas.ru`;
        keyboard = {
          inline_keyboard: [[{ text: '🔙 Назад в меню', callback_data: 'menu' }]]
        };
        parse_mode = 'Markdown';
        break;
        
      case 'menu':
        responseText = `🏠 **Главное меню**\n\nВыберите раздел:`;
        keyboard = {
          inline_keyboard: [
            [
              { text: '📞 Контакты', callback_data: 'contacts' },
              { text: '💳 Оплатить', url: 'https://samararegiongaz.ru/consumer/online/' }
            ]
          ]
        };
        parse_mode = 'Markdown';
        break;
        
      case 'help':
        responseText = `🆘 **Помощь:**\n\nИспользуйте команды:\n/start - меню\n/contacts - контакты\n/pay - оплата\n\nИли кнопки ниже`;
        keyboard = {
          inline_keyboard: [
            [
              { text: '📞 Контакты', callback_data: 'contacts' },
              { text: '💳 Оплатить', url: 'https://samararegiongaz.ru/consumer/online/' }
            ]
          ]
        };
        parse_mode = 'Markdown';
        break;
        
      case 'request_contact':
        responseText = `📱 Для отправки контакта используйте соответствующую кнопку в клавиатуре.\n\nПока что отправьте номер телефона вручную:`;
        keyboard = {
          inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'menu' }]]
        };
        break;
        
      case 'request_location':
        responseText = `📍 Для отправки геолокации используйте соответствующую кнопку.\n\nИли укажите адрес вручную:`;
        keyboard = {
          inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'menu' }]]
        };
        break;
        
      default:
        responseText = `Неизвестная команда: ${data}`;
        keyboard = {
          inline_keyboard: [[{ text: '🏠 В меню', callback_data: 'menu' }]]
        };
    }
    
    // Отправляем ответ на callback
    await sendMessage(chatId, responseText, {
      reply_markup: keyboard,
      parse_mode: parse_mode
    });
    
    // Отвечаем на callback (чтобы убрать часики)
    await callMaxApi('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: 'Готово!'
    });
  }
}

// ==================== ЗАПУСК БОТА ====================

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`🌐 HTTP сервер запущен на порту ${PORT}`);
  console.log(`📡 Вебхук URL: http://ваш-домен:${PORT}/webhook`);
  console.log('📊 Информация о системе:');
  console.log('Node.js:', process.version);
  console.log('Токен:', BOT_TOKEN ? 'получен' : 'не получен');
  console.log('Время запуска:', new Date().toLocaleString());
  console.log('='.repeat(50));
  
  try {
    // Проверяем соединение с API
    const botInfo = await callMaxApi('getMe');
    if (botInfo && botInfo.ok) {
      console.log(`✅ Бот авторизован: ${botInfo.result.first_name} (@${botInfo.result.username})`);
      console.log('🤖 Бот готов к работе!');
      
      // Устанавливаем вебхук
      const webhookUrl = `https://ваш-домен-ботхост/webhook`;
      const webhookResult = await callMaxApi('setWebhook', {
        url: webhookUrl
      });
      
      if (webhookResult && webhookResult.ok) {
        console.log(`✅ Вебхук установлен: ${webhookUrl}`);
      } else {
        console.log('⚠️  Вебхук не установлен, используйте long polling');
      }
      
    } else {
      console.error('❌ Ошибка авторизации. Проверьте токен!');
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке соединения:', error.message);
    console.log('ℹ️  Продолжаем работу в тестовом режиме...');
  }
  
  console.log('\n📝 Инструкция по настройке в MAX:');
  console.log('1. Получите домен от BotHost');
  console.log('2. В настройках бота укажите вебхук:');
  console.log(`   https://ваш-домен.ботхост/webhook`);
  console.log('3. Или используйте метод getUpdates');
});

// ==================== ЛОНГ ПОЛЛИНГ (альтернатива вебхуку) ====================

async function startLongPolling() {
  console.log('⏳ Запускаем long polling...');
  
  let offset = 0;
  
  while (true) {
    try {
      const updates = await callMaxApi('getUpdates', {
        offset: offset,
        timeout: 30,
        limit: 100
      });
      
      if (updates && updates.result && updates.result.length > 0) {
        for (const update of updates.result) {
          offset = update.update_id + 1;
          await handleUpdate(update);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('❌ Ошибка long polling:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Раскомментируйте для использования long polling вместо вебхука
// startLongPolling();

// ==================== ОБРАБОТКА ЗАВЕРШЕНИЯ ====================

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен SIGTERM, завершаем работу...');
  server.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Получен SIGINT, завершаем работу...');
  server.close();
  process.exit(0);
});
