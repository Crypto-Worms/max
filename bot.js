require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const MAX_API_BASE = 'https://platform-api.max.ru';

if (!BOT_TOKEN) {
  console.error('❌ ОШИБКА: BOT_TOKEN не найден!');
  process.exit(1);
}

// ==================== API ФУНКЦИИ ====================

async function callMaxApi(method, data = {}, httpMethod = 'POST') {
  try {
    const url = `${MAX_API_BASE}${method}`;
    console.log(`📤 API Call: ${url} [${httpMethod}]`);
    
    const config = {
      method: httpMethod,
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BOT_TOKEN
      },
      timeout: 10000
    };
    
    if (httpMethod === 'POST' || httpMethod === 'PUT') {
      config.data = data;
    }
    
    const response = await axios(config);
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

// Получение обновлений (long polling)
async function getUpdates(offset = 0, limit = 100, timeout = 30) {
  return await callMaxApi('/updates', {
    offset: offset,
    limit: limit,
    timeout: timeout
  }, 'GET');
}

// Получение информации о боте
async function getBotInfo() {
  return await callMaxApi('/me', {}, 'GET');
}

// ==================== ОБРАБОТКА СООБЩЕНИЙ ====================

function processMessage(text, userName = 'Пользователь') {
  const command = text.toLowerCase().trim();
  
  if (command === '/start' || command === 'start') {
    return {
      text: `👋 Добро пожаловать в бот ООО "Газпром межрегионгаз Самара", ${userName}!\n\n` +
            `Выберите нужный раздел:`,
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
                type: 'callback',
                text: '💳 Оплата',
                payload: 'show_payment'
              }
            ],
            [
              {
                type: 'callback',
                text: '📊 Тарифы',
                payload: 'show_tariffs'
              },
              {
                type: 'callback',
                text: '📱 Помощь',
                payload: 'show_help'
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
      text: `📞 **Контакты:**\n\n` +
            `• Телефон: 8 846 212-32-12\n` +
            `• Горячая линия: 8 800 201-04-04\n` +
            `• Адрес: ул. Ново-Садовая, 307А\n` +
            `• Email: srg@samgas.ru`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [[{
            type: 'callback',
            text: '🔙 Назад в меню',
            payload: 'back_to_menu'
          }]]
        }
      }],
      format: 'markdown'
    };
  }
  
  if (command === '/pay' || command.includes('оплат')) {
    return {
      text: `💳 **Оплата за газ:**\n\n` +
            `Для оплаты перейдите:\n` +
            `https://samararegiongaz.ru/consumer/online/`,
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
      text: `📱 **Помощь:**\n\n` +
            `**Команды:**\n` +
            `/start - меню\n` +
            `/contacts - контакты\n` +
            `/pay - оплата\n` +
            `/help - справка`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [[{
            type: 'callback',
            text: '🔙 Назад в меню',
            payload: 'back_to_menu'
          }]]
        }
      }],
      format: 'markdown'
    };
  }
  
  if (command.includes('тариф')) {
    return {
      text: `📊 **Тарифы на газ:**\n\n` +
            `• С газовой плитой: 8,30 ₽/м³\n` +
            `• Отопление газом: 6,67 ₽/м³`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [[{
            type: 'callback',
            text: '🔙 Назад',
            payload: 'back_to_menu'
          }]]
        }
      }],
      format: 'markdown'
    };
  }
  
  if (command.includes('запах') || command.includes('утечк') || command === '104') {
    return {
      text: `🚨 **ДЕЙСТВИЯ ПРИ ЗАПАХЕ ГАЗА:**\n\n` +
            `1. 📞 **Позвоните 104**\n` +
            `2. 🔥 **Не включайте** электроприборы\n` +
            `3. 🚭 **Не зажигайте** огонь\n` +
            `4. 🪟 **Откройте** окна\n` +
            `5. 🚪 **Покиньте** помещение`,
      format: 'markdown'
    };
  }
  
  // Любое другое сообщение
  return {
    text: `👋 Привет, ${userName}!\n\n` +
          `Для информации используйте:\n` +
          `/start - главное меню\n` +
          `/contacts - контакты\n` +
          `/pay - оплата\n` +
          `/help - помощь`,
    attachments: [{
      type: 'inline_keyboard',
      payload: {
        buttons: [[{
          type: 'callback',
          text: '🏠 Главное меню',
          payload: 'back_to_menu'
        }]]
      }
    }],
    format: 'markdown'
  };
}

// ==================== ОБРАБОТКА CALLBACK ====================

function processCallback(payload) {
  switch (payload) {
    case 'show_contacts':
      return {
        text: `📞 **Контакты:**\n\n` +
              `• Телефон: 8 846 212-32-12\n` +
              `• Горячая линия: 8 800 201-04-04\n` +
              `• Адрес: ул. Ново-Садовая, 307А\n` +
              `• Email: srg@samgas.ru`,
        attachments: [{
          type: 'inline_keyboard',
          payload: {
            buttons: [[{
              type: 'callback',
              text: '🔙 Назад в меню',
              payload: 'back_to_menu'
            }]]
          }
        }],
        format: 'markdown'
      };
      
    case 'show_payment':
      return {
        text: `💳 **Оплата за газ:**\n\n` +
              `Для оплаты перейдите:\n` +
              `https://samararegiongaz.ru/consumer/online/`,
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
      
    case 'show_tariffs':
      return {
        text: `📊 **Тарифы на газ:**\n\n` +
              `• С газовой плитой: 8,30 ₽/м³\n` +
              `• Отопление газом: 6,67 ₽/м³`,
        attachments: [{
          type: 'inline_keyboard',
          payload: {
            buttons: [[{
              type: 'callback',
              text: '🔙 Назад',
              payload: 'back_to_menu'
            }]]
          }
        }],
        format: 'markdown'
      };
      
    case 'show_help':
      return {
        text: `📱 **Помощь:**\n\n` +
              `**Команды:**\n` +
              `/start - меню\n` +
              `/contacts - контакты\n` +
              `/pay - оплата\n` +
              `/help - справка`,
        attachments: [{
          type: 'inline_keyboard',
          payload: {
            buttons: [[{
              type: 'callback',
              text: '🔙 Назад в меню',
              payload: 'back_to_menu'
            }]]
          }
        }],
        format: 'markdown'
      };
      
    case 'back_to_menu':
      return {
        text: `🏠 **Главное меню**\n\nВыберите раздел:`,
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
                  type: 'callback',
                  text: '💳 Оплата',
                  payload: 'show_payment'
                }
              ],
              [
                {
                  type: 'callback',
                  text: '📊 Тарифы',
                  payload: 'show_tariffs'
                },
                {
                  type: 'callback',
                  text: '📱 Помощь',
                  payload: 'show_help'
                }
              ]
            ]
          }
        }],
        format: 'markdown'
      };
      
    default:
      return {
        text: `Неизвестная команда. Используйте меню:`,
        attachments: [{
          type: 'inline_keyboard',
          payload: {
            buttons: [[{
              type: 'callback',
              text: '🏠 Главное меню',
              payload: 'back_to_menu'
            }]]
          }
        }],
        format: 'markdown'
      };
  }
}

// ==================== LONG POLLING ====================

async function startPolling() {
  console.log('🚀 Запускаем long polling...');
  let offset = 0;
  
  while (true) {
    try {
      const updates = await getUpdates(offset, 100, 30);
      
      if (updates && updates.length > 0) {
        console.log(`📨 Получено ${updates.length} обновлений`);
        
        for (const update of updates) {
          offset = Math.max(offset, update.update_id + 1);
          
          // Обработка сообщений
          if (update.type === 'message_created' && update.message) {
            const message = update.message;
            const chatId = message.chat_id;
            const text = message.body?.text || '';
            const userId = message.user_id;
            
            console.log(`💬 Сообщение от ${userId}: "${text}"`);
            
            const result = processMessage(text);
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
            
            console.log(`🔘 Callback: ${payload}`);
            
            const result = processCallback(payload);
            await sendMessage(chatId, result.text, {
              attachments: result.attachments,
              format: result.format
            });
          }
          
          // Бот добавлен в чат
          else if (update.type === 'bot_added') {
            console.log('🤖 Бот добавлен в чат:', update.chat_id);
            await sendMessage(update.chat_id,
              `👋 Здравствуйте! Я бот ООО "Газпром межрегионгаз Самара".\n\n` +
              `Используйте /start для начала работы.`,
              { format: 'markdown' }
            );
          }
          
          // Бот запущен
          else if (update.type === 'bot_started') {
            console.log('🚀 Бот запущен пользователем');
            await sendMessage(update.chat_id,
              `👋 Привет! Отправь мне /start для начала работы.`,
              { format: 'markdown' }
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Ошибка polling:', error.message);
      // Ждем перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// ==================== ЗАПУСК БОТА ====================

async function main() {
  console.log('🚀 Запускаем бота для Газпром...');
  console.log('✅ Токен получен');
  console.log('🔗 API Endpoint:', MAX_API_BASE);
  
  try {
    // Проверяем авторизацию
    console.log('🔍 Проверяем авторизацию...');
    const botInfo = await getBotInfo();
    
    if (botInfo) {
      console.log(`✅ Бот авторизован: ${botInfo.first_name || 'Бот'}`);
      console.log(`👤 Username: @${botInfo.username || 'не указан'}`);
    } else {
      console.error('❌ Ошибка авторизации');
      process.exit(1);
    }
    
    // Запускаем long polling
    await startPolling();
    
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
}

// Обработка завершения
process.on('SIGTERM', () => {
  console.log('\n🛑 Завершаем работу...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Завершаем работу...');
  process.exit(0);
});

// Запускаем
if (require.main === module) {
  main();
}
