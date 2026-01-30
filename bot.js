require('dotenv').config();
const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const MAX_API_URL = 'https://api.max.ru/bot/v1';

if (!BOT_TOKEN) {
  console.error('❌ ОШИБКА: Токен не найден');
  process.exit(1);
}

// Функция для отправки запросов к API MAX
async function callMaxApi(method, params = {}) {
  const url = `${MAX_API_URL}/${method}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOT_TOKEN}`
      },
      body: JSON.stringify(params)
    });
    
    return await response.json();
  } catch (error) {
    console.error('❌ Ошибка API:', error);
    return null;
  }
}

// Простой вебхук-сервер для получения обновлений
const http = require('http');

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        await handleUpdate(update);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('❌ Ошибка обработки вебхука:', error);
        res.writeHead(500);
        res.end();
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Обработка обновлений
async function handleUpdate(update) {
  console.log('📨 Получено обновление:', JSON.stringify(update, null, 2));
  
  // Проверяем тип обновления
  if (update.message && update.message.text) {
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text;
    
    // Команда /start
    if (text === '/start' || text === '/start@' + (process.env.BOT_USERNAME || '')) {
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '📞 Контакты',
              callback_data: 'contacts'
            },
            {
              text: '💳 Заплатить за газ',
              url: 'https://samararegiongaz.ru/consumer/online/'
            }
          ]
        ]
      };
      
      await sendMessage(chatId, 
        'Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\nВыберите нужный раздел:',
        keyboard
      );
    }
    
    // Текст "Контакты"
    else if (text === 'Контакты') {
      const contacts = `📞 **Актуальные контакты:**\n\n` +
        `• Телефон: 8 846 212-32-12\n` +
        `• Горячая линия: 8 800 201-04-04\n` +
        `• Адрес: ул. Ново-Садовая, 307А\n` +
        `• Email: srg@samgas.ru`;
      
      const backKeyboard = {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'back' }]
        ]
      };
      
      await sendMessage(chatId, contacts, backKeyboard, 'markdown');
    }
    
    // Текст "Назад"
    else if (text === 'Назад') {
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '📞 Контакты',
              callback_data: 'contacts'
            },
            {
              text: '💳 Заплатить за газ',
              url: 'https://samararegiongaz.ru/consumer/online/'
            }
          ]
        ]
      };
      
      await sendMessage(chatId, 
        'Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\nВыберите нужный раздел:',
        keyboard
      );
    }
  }
  
  // Обработка callback-кнопок
  else if (update.callback_query) {
    const callback = update.callback_query;
    const chatId = callback.message.chat.id;
    const data = callback.data;
    
    if (data === 'contacts') {
      const contacts = `📞 **Актуальные контакты:**\n\n` +
        `• Телефон: 8 846 212-32-12\n` +
        `• Горячая линия: 8 800 201-04-04\n` +
        `• Адрес: ул. Ново-Садовая, 307А\n` +
        `• Email: srg@samgas.ru`;
      
      const backKeyboard = {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'back' }]
        ]
      };
      
      await sendMessage(chatId, contacts, backKeyboard, 'markdown');
      
      // Отвечаем на callback
      await callMaxApi('answerCallbackQuery', {
        callback_query_id: callback.id
      });
    }
    
    else if (data === 'back') {
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '📞 Контакты',
              callback_data: 'contacts'
            },
            {
              text: '💳 Заплатить за газ',
              url: 'https://samararegiongaz.ru/consumer/online/'
            }
          ]
        ]
      };
      
      await sendMessage(chatId, 
        'Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\nВыберите нужный раздел:',
        keyboard
      );
      
      await callMaxApi('answerCallbackQuery', {
        callback_query_id: callback.id
      });
    }
  }
}

// Функция отправки сообщения
async function sendMessage(chatId, text, replyMarkup = null, parseMode = null) {
  const params = {
    chat_id: chatId,
    text: text
  };
  
  if (replyMarkup) {
    params.reply_markup = replyMarkup;
  }
  
  if (parseMode) {
    params.parse_mode = parseMode;
  }
  
  return await callMaxApi('sendMessage', params);
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Бот запущен на порту ${PORT}`);
  console.log(`🌐 Вебхук: http://ваш_домен:${PORT}/webhook`);
  
  // Регистрируем вебхук (нужно будет настроить в панели MAX)
  console.log('\n📝 Для настройки:');
  console.log('1. В настройках бота MAX укажите вебхук:');
  console.log(`   https://ваш_домен.ботхост/${BOT_TOKEN}/webhook`);
  console.log('2. Или используйте long polling');
});
