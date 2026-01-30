// bot.js - Полный бот для MAX API
require('dotenv').config();
const axios = require('axios');
const http = require('http');

const BOT_TOKEN = process.env.BOT_TOKEN;
const MAX_API_BASE = 'https://platform-api.max.ru';

if (!BOT_TOKEN) {
  console.error('❌ ОШИБКА: BOT_TOKEN не найден!');
  console.log('📝 Установите переменную окружения в BotHost');
  console.log('💡 Получите токен у @PrimeBot в MAX');
  process.exit(1);
}

console.log('🚀 Запускаем бота для Газпром...');
console.log('✅ Токен получен');
console.log('🔗 API Endpoint:', MAX_API_BASE);

// ==================== API ФУНКЦИИ ====================

async function callMaxApi(method, data = {}) {
  try {
    const url = `${MAX_API_BASE}${method}`;
    console.log(`📤 API Call: ${url}`);
    
    const response = await axios({
      method: 'POST',
      url: url,
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BOT_TOKEN
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Ошибка API ${method}:`, error.response?.data || error.message);
    return null;
  }
}

// Отправка сообщения
async function sendMessage(chatId, text, options = {}) {
  const messageData = {
    chat_id: chatId,
    text: text,
    ...options
  };
  
  return await callMaxApi('/messages', messageData);
}

// Получение информации о боте
async function getBotInfo() {
  return await callMaxApi('/users/me');
}

// Установка вебхука
async function setWebhook(url) {
  return await callMaxApi('/webhooks', { url: url });
}

// ==================== ОБРАБОТКА КОМАНД ====================

function processCommand(text, chatId, userName) {
  const command = text.toLowerCase().trim();
  
  if (command === '/start') {
    return {
      text: `👋 Добро пожаловать в бот ООО "Газпром межрегионгаз Самара"!\n\n` +
            `Мы предоставляем услуги по поставке газа в Самарской области.\n\n` +
            `🛠️ **Выберите нужный раздел:**\n\n` +
            `📞 Контакты - контактная информация\n` +
            `💳 Оплатить - оплата услуг онлайн\n` +
            `📱 Помощь - справка по использованию`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [
              {
                type: 'callback',
                text: '📞 Контакты',
                payload: 'show_contacts'
              },
              {
                type: 'link',
                text: '💳 Оплатить',
                url: 'https://samararegiongaz.ru/consumer/online/'
              }
            ],
            [
              {
                type: 'request_contact',
                text: '📱 Отправить контакт'
              },
              {
                type: 'request_geo_location',
                text: '📍 Геолокация'
              }
            ]
          ]
        }
      }],
      format: 'markdown'
    };
  }
  
  if (command === '/contacts' || command.includes('контакт')) {
    return {
      text: `📞 **Контактная информация:**\n\n` +
            `• Телефон: 8 846 212-32-12\n` +
            `• Горячая линия: 8 800 201-04-04\n` +
            `• Адрес: ул. Ново-Садовая, 307А, Самара\n` +
            `• Email: srg@samgas.ru\n\n` +
            `⏰ **Режим работы:**\n` +
            `Пн-Чт: 8:30-17:30\n` +
            `Пт: 8:30-16:15\n` +
            `Обед: 13:00-13:45`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [{
              type: 'callback',
              text: '🔙 Назад в меню',
              payload: 'back_to_menu'
            }]
          ]
        }
      }],
      format: 'markdown'
    };
  }
  
  if (command === '/pay' || command.includes('оплат')) {
    return {
      text: `💳 **Оплата за газ:**\n\n` +
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
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [
              {
                type: 'link',
                text: '💳 Оплатить онлайн',
                url: 'https://samararegiongaz.ru/consumer/online/'
              },
              {
                type: 'callback',
                text: '📞 Контакты',
                payload: 'show_contacts'
              }
            ],
            [{
              type: 'callback',
              text: '🔙 Назад',
              payload: 'back_to_menu'
            }]
          ]
        }
      }],
      format: 'markdown'
    };
  }
  
  if (command === '/help') {
    return {
      text: `📱 **Помощь по использованию бота:**\n\n` +
            `**Доступные команды:**\n` +
            `/start - Главное меню\n` +
            `/contacts - Контактная информация\n` +
            `/pay - Оплата услуг\n` +
            `/help - Эта справка\n\n` +
            `Также вы можете использовать кнопки ниже:`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [
              {
                type: 'callback',
                text: '📞 Контакты',
                payload: 'contacts'
              },
              {
                type: 'link',
                text: '💳 Оплатить',
                url: 'https://samararegiongaz.ru/consumer/online/'
              }
            ]
          ]
        }
      }],
      format: 'markdown'
    };
  }
  
  // Любое другое сообщение
  return {
    text: `👋 Привет, ${userName || 'друг'}!\n\n` +
          `Вы написали: "${text}"\n\n` +
          `Для получения информации используйте:\n` +
          `• /start - главное меню\n` +
          `• /contacts - контакты\n` +
          `• /pay - оплата\n` +
          `• /help - помощь\n\n` +
          `Или выберите нужный раздел ниже:`,
    attachments: [{
      type: 'inline_keyboard',
      payload: {
        buttons: [
          [
            {
              type: 'callback',
              text: '📞 Контакты',
              payload: 'contacts'
            },
            {
              type: 'link',
              text: '💳 Оплатить',
              url: 'https://samararegiongaz.ru/consumer/online/'
            }
          ],
          [{
            type: 'callback',
            text: '🆘 Помощь',
            payload: 'help'
          }]
        ]
      }
    }],
    format: 'markdown'
  };
}

// ==================== HTTP СЕРВЕР ДЛЯ ВЕБХУКА ====================

const server = http.createServer(async (req, res) => {
  // Статус бота
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      bot: 'Газпром межрегионгаз Самара',
      api: MAX_API_BASE,
      time: new Date().toISOString()
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
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// ==================== ОБРАБОТКА ОБНОВЛЕНИЙ ====================

async function handleUpdate(update) {
  // Обработка новых сообщений
  if (update.type === 'message_created' && update.message) {
    const message = update.message;
    const chatId = message.chat_id;
    const userId = message.user_id;
    const text = message.body?.text || '';
    
    console.log(`💬 Сообщение от ${userId} в чате ${chatId}: "${text}"`);
    
    // Получаем информацию о пользователе
    let userName = 'Пользователь';
    try {
      const userInfo = await callMaxApi(`/users/${userId}`);
      if (userInfo) {
        userName = userInfo.first_name || userInfo.username || 'Пользователь';
      }
    } catch (error) {
      console.log('⚠️ Не удалось получить имя пользователя');
    }
    
    // Обрабатываем команду
    const result = processCommand(text, chatId, userName);
    
    // Отправляем ответ
    await sendMessage(chatId, result.text, {
      attachments: result.attachments,
      format: result.format
    });
  }
  
  // Обработка callback-кнопок
  else if (update.type === 'message_callback' && update.callback) {
    const callback = update.callback;
    const chatId = callback.message.chat_id;
    const payload = callback.payload;
    const userId = callback.user_id;
    
    console.log(`🔘 Callback от ${userId}: ${payload}`);
    
    let responseText = '';
    let attachments = [];
    let format = 'markdown';
    
    switch (payload) {
      case 'show_contacts':
      case 'contacts':
        responseText = `📞 **Контакты:**\n\n` +
                      `• Телефон: 8 846 212-32-12\n` +
                      `• Горячая линия: 8 800 201-04-04\n` +
                      `• Адрес: ул. Ново-Садовая, 307А\n` +
                      `• Email: srg@samgas.ru`;
        attachments = [{
          type: 'inline_keyboard',
          payload: {
            buttons: [[{
              type: 'callback',
              text: '🔙 Назад в меню',
              payload: 'back_to_menu'
            }]]
          }
        }];
        break;
        
      case 'back_to_menu':
        responseText = `🏠 **Главное меню**\n\nВыберите раздел:`;
        attachments = [{
          type: 'inline_keyboard',
          payload: {
            buttons: [
              [
                {
                  type: 'callback',
                  text: '📞 Контакты',
                  payload: 'show_contacts'
                },
                {
                  type: 'link',
                  text: '💳 Оплатить',
                  url: 'https://samararegiongaz.ru/consumer/online/'
                }
              ]
            ]
          }
        }];
        break;
        
      case 'help':
        responseText = `🆘 **Помощь:**\n\nИспользуйте команды:\n/start - меню\n/contacts - контакты\n/pay - оплата\n\nИли кнопки ниже`;
        attachments = [{
          type: 'inline_keyboard',
          payload: {
            buttons: [
              [
                {
                  type: 'callback',
                  text: '📞 Контакты',
                  payload: 'show_contacts'
                },
                {
                  type: 'link',
                  text: '💳 Оплатить',
                  url: 'https://samararegiongaz.ru/consumer/online/'
                }
              ]
            ]
          }
        }];
        break;
        
      default:
        responseText = `Неизвестная команда: ${payload}`;
        attachments = [{
          type: 'inline_keyboard',
          payload: {
            buttons: [[{
              type: 'callback',
              text: '🏠 В меню',
              payload: 'back_to_menu'
            }]]
          }
        }];
    }
    
    // Отправляем ответ
    await sendMessage(chatId, responseText, {
      attachments: attachments,
      format: format
    });
  }
  
  // Обработка добавления бота в чат
  else if (update.type === 'bot_added') {
    console.log('🤖 Бот добавлен в чат:', update.chat_id);
    await sendMessage(update.chat_id,
      `👋 Привет! Я бот ООО "Газпром межрегионгаз Самара".\n\n` +
      `Используйте /start для начала работы.`,
      { format: 'markdown' }
    );
  }
}

// ==================== ЗАПУСК БОТА ====================

const PORT = process.env.PORT || 3000;

async function startBot() {
  try {
    // Проверяем авторизацию
    console.log('🔍 Проверяем авторизацию...');
    const botInfo = await getBotInfo();
    
    if (botInfo) {
      console.log(`✅ Бот авторизован: ${botInfo.first_name || 'Бот'} (ID: ${botInfo.id})`);
    } else {
      console.error('❌ Ошибка авторизации. Проверьте токен!');
      process.exit(1);
    }
    
    // Запускаем HTTP сервер
    server.listen(PORT, () => {
      console.log(`🌐 HTTP сервер запущен на порту ${PORT}`);
      console.log(`📡 Вебхук URL: https://ваш-домен.ботхост/webhook`);
      console.log('📊 Информация:');
      console.log('Node.js:', process.version);
      console.log('Время запуска:', new Date().toLocaleString());
      console.log('='.repeat(50));
      console.log('🤖 Бот готов к работе!');
      console.log('\n📝 Инструкция по настройке вебхука в MAX:');
      console.log('1. Получите домен от BotHost');
      console.log('2. В настройках бота укажите вебхук:');
      console.log(`   https://ваш-домен.ботхост/webhook`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
}

// Запускаем бота
startBot();

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
