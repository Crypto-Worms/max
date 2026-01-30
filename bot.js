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

// Получение информации о боте
async function getBotInfo() {
  return await callMaxApi('/me', {}, 'GET');
}

// Установка вебхука (подписка на события)
async function setWebhook(url) {
  return await callMaxApi('/subscriptions', {
    url: url,
    update_types: ['message_created', 'message_callback', 'bot_added', 'bot_removed', 'bot_started']
  });
}

// Удаление вебхука
async function deleteWebhook() {
  return await callMaxApi('/subscriptions', {}, 'DELETE');
}

// Получение информации о пользователе
async function getUserInfo(userId) {
  return await callMaxApi(`/users/${userId}`, {}, 'GET');
}

// ==================== ОБРАБОТКА КОМАНД ====================

function processCommand(text, chatId, userName) {
  const command = text.toLowerCase().trim();
  
  if (command === '/start' || command === 'start') {
    return {
      text: `👋 Добро пожаловать в бот ООО "Газпром межрегионгаз Самара", ${userName}!\n\n` +
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
      text: `📞 **Контактная информация ООО "Газпром межрегионгаз Самара":**\n\n` +
            `📱 **Телефоны:**\n` +
            `• Единый сервисный центр: 8 846 212-32-12\n` +
            `• Бесплатная горячая линия: 8 800 201-04-04\n` +
            `• Диспетчерская служба: 8 846 212-30-80\n\n` +
            `🏢 **Адрес:**\n` +
            `г. Самара, ул. Ново-Садовая, 307А\n\n` +
            `📧 **Email:** srg@samgas.ru\n\n` +
            `🌐 **Сайт:** https://samararegiongaz.ru\n\n` +
            `⏰ **Режим работы клиентского центра:**\n` +
            `Понедельник - Четверг: 8:30 - 17:30\n` +
            `Пятница: 8:30 - 16:15\n` +
            `Обед: 13:00 - 13:45\n` +
            `Суббота, Воскресенье: выходной`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [
              {
                type: 'callback',
                text: '📋 Тарифы',
                payload: 'show_tariffs'
              },
              {
                type: 'link',
                text: '🗺️ Карта офисов',
                url: 'https://samararegiongaz.ru/about/contacts/'
              }
            ],
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
      text: `💳 **Способы оплаты за газ:**\n\n` +
            `**🌐 Онлайн-оплата:**\n` +
            `• [Официальный портал](https://samararegiongaz.ru/consumer/online/)\n` +
            `• Госуслуги\n` +
            `• Сбербанк Онлайн\n` +
            `• Тинькофф\n` +
            `• ВТБ Онлайн\n\n` +
            `**🏛️ Банки и терминалы:**\n` +
            `• Отделения Сбербанка\n` +
            `• Почта России\n` +
            `• Платежные терминалы QIWI, Элекснет\n` +
            `• Банкоматы с функцией оплаты\n\n` +
            `**📱 Мобильные приложения:**\n` +
            `• Мой Газ (официальное приложение)\n` +
            `• СберБанк Онлайн\n` +
            `• Тинькофф\n\n` +
            `**💡 Для оплаты потребуется:**\n` +
            `• Лицевой счет абонента\n` +
            `• Сумма к оплате\n` +
            `• Данные банковской карты`,
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
                type: 'link',
                text: '📱 Приложение "Мой Газ"',
                url: 'https://apps.apple.com/ru/app/мой-газ/id1435736436'
              }
            ],
            [
              {
                type: 'callback',
                text: '📞 Контакты',
                payload: 'show_contacts'
              },
              {
                type: 'callback',
                text: '💡 Помощь',
                payload: 'show_help'
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
  
  if (command === '/tariffs' || command.includes('тариф')) {
    return {
      text: `📊 **Тарифы на газ для населения (2024 год):**\n\n` +
            `**Самарская область:**\n` +
            `• При наличии газовой плиты и центрального горячего водоснабжения: 8,30 ₽/м³\n` +
            `• При наличии газовой плиты и отсутствии центрального ГВС: 8,30 ₽/м³\n` +
            `• При наличии газовой плиты и газового водонагревателя: 8,30 ₽/м³\n` +
            `• Отопление газом: 6,67 ₽/м³\n\n` +
            `**💡 Примечание:**\n` +
            `• Тарифы устанавливаются Региональной службой\n` +
            `• Актуальные тарифы уточняйте на сайте\n` +
            `• Для юридических лиц тарифы индивидуальны\n\n` +
            `**📅 Перерасчет:**\n` +
            `При временном отсутствии более 5 дней`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [
              {
                type: 'link',
                text: '📄 Подробнее о тарифах',
                url: 'https://samararegiongaz.ru/consumer/tariffs/'
              },
              {
                type: 'callback',
                text: '💳 Оплатить',
                payload: 'show_payment'
              }
            ],
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
  
  if (command === '/help' || command === 'помощь') {
    return {
      text: `📱 **Помощь по использованию бота:**\n\n` +
            `**Основные команды:**\n` +
            `/start - Главное меню\n` +
            `/contacts - Контактная информация\n` +
            `/pay - Оплата услуг\n` +
            `/tariffs - Тарифы на газ\n` +
            `/help - Эта справка\n\n` +
            `**Частые вопросы:**\n` +
            `• Как передать показания счетчика?\n` +
            `• Куда звонить при утечке газа?\n` +
            `• Как оформить перерасчет?\n\n` +
            `**🔔 Экстренные службы:**\n` +
            `При запахе газа: 104 (бесплатно)\n` +
            `Пожарная служба: 101\n` +
            `Скорая помощь: 103`,
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
                text: '❓ Частые вопросы',
                url: 'https://samararegiongaz.ru/consumer/faq/'
              }
            ],
            [
              {
                type: 'callback',
                text: '📋 Тарифы',
                payload: 'show_tariffs'
              },
              {
                type: 'callback',
                text: '💳 Оплата',
                payload: 'show_payment'
              }
            ]
          ]
        }
      }],
      format: 'markdown'
    };
  }
  
  // Если спрашивают про показания счетчика
  if (command.includes('показани') || command.includes('счетчик') || command.includes('передат')) {
    return {
      text: `🔢 **Передача показаний счетчика:**\n\n` +
            `**Способы передачи:**\n` +
            `1. 📱 **Мобильное приложение** "Мой Газ"\n` +
            `2. 🌐 **Личный кабинет** на сайте\n` +
            `3. 📞 **Телефон:** 8 846 212-32-12\n` +
            `4. 📧 **Email:** srg@samgas.ru\n` +
            `5. 📱 **SMS** на номер: +7 927 692-02-20\n\n` +
            `**📅 Сроки передачи:**\n` +
            `• С 15 по 25 число каждого месяца\n\n` +
            `**📸 Рекомендации:**\n` +
            `• Сфотографируйте счетчик для подтверждения\n` +
            `• Указывайте все цифры до запятой\n` +
            `• Сохраняйте чеки об оплате`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [
              {
                type: 'link',
                text: '📱 Личный кабинет',
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
              text: '🔙 Назад в меню',
              payload: 'back_to_menu'
            }]
          ]
        }
      }],
      format: 'markdown'
    };
  }
  
  // Если спрашивают про утечку газа
  if (command.includes('утечк') || command.includes('запах') || command === '104') {
    return {
      text: `🚨 **ДЕЙСТВИЯ ПРИ ЗАПАХЕ ГАЗА:**\n\n` +
            `**НЕМЕДЛЕННО:**\n` +
            `1. 📞 **Позвоните 104** (аварийная газовая служба)\n` +
            `2. 🔥 **Не включайте** электроприборы\n` +
            `3. 🚭 **Не зажигайте** огонь\n` +
            `4. 🪟 **Откройте** окна для проветривания\n` +
            `5. 🚪 **Покиньте** помещение\n\n` +
            `**⚠️ ЗАПРЕЩАЕТСЯ:**\n` +
            `• Пользоваться электроприборами\n` +
            `• Курить\n` +
            `• Искать утечку с помощью огня\n` +
            `• Включать/выключать свет\n\n` +
            `**📞 Экстренные телефоны:**\n` +
            `• Газовая служба: 104\n` +
            `• Пожарная служба: 101\n` +
            `• ЕДДС: 112`,
      attachments: [{
        type: 'inline_keyboard',
        payload: {
          buttons: [
            [{
              type: 'callback',
              text: '📞 Все контакты',
              payload: 'show_contacts'
            }],
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
  
  // Любое другое сообщение
  return {
    text: `👋 Привет, ${userName || 'друг'}!\n\n` +
          `Вы написали: "${text}"\n\n` +
          `Для получения информации используйте:\n` +
          `• /start - главное меню\n` +
          `• /contacts - контакты\n` +
          `• /pay - оплата\n` +
          `• /tariffs - тарифы на газ\n` +
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
              text: '🆘 Помощь',
              payload: 'show_help'
            }
          ]
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
      time: new Date().toISOString(),
      version: '1.0.0'
    }));
    return;
  }
  
  // Статус бота (альтернативный)
  if (req.method === 'GET' && req.url === '/status') {
    try {
      const botInfo = await getBotInfo();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'online',
        bot: botInfo,
        server_time: new Date().toISOString(),
        uptime: process.uptime()
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
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
        console.log('📨 Получен вебхук от MAX:', update.type || 'unknown');
        
        // Обрабатываем обновление
        await handleUpdate(update);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('❌ Ошибка обработки вебхука:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// ==================== ОБРАБОТКА ОБНОВЛЕНИЙ ====================

async function handleUpdate(update) {
  console.log('🔄 Обработка обновления типа:', update.type);
  
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
      const userInfo = await getUserInfo(userId);
      if (userInfo) {
        userName = userInfo.first_name || userInfo.username || 'Пользователь';
      }
    } catch (error) {
      console.log('⚠️ Не удалось получить имя пользователя');
    }
    
    // Обрабатываем команду
    const result = processCommand(text, chatId, userName);
    
    // Отправляем ответ
    try {
      await sendMessage(chatId, result.text, {
        attachments: result.attachments,
        format: result.format
      });
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
    }
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
        responseText = `📞 **Контакты ООО "Газпром межрегионгаз Самара":**\n\n` +
                      `📱 **Телефоны:**\n` +
                      `• Единый сервисный центр: 8 846 212-32-12\n` +
                      `• Горячая линия: 8 800 201-04-04\n` +
                      `• Диспетчерская: 8 846 212-30-80\n\n` +
                      `🏢 **Адрес:**\n` +
                      `г. Самара, ул. Ново-Садовая, 307А\n\n` +
                      `📧 **Email:** srg@samgas.ru\n\n` +
                      `⏰ **Режим работы:**\n` +
                      `Пн-Чт: 8:30-17:30\n` +
                      `Пт: 8:30-16:15\n` +
                      `Обед: 13:00-13:45`;
        attachments = [{
          type: 'inline_keyboard',
          payload: {
            buttons: [
              [
                {
                  type: 'link',
                  text: '🗺️ Карта офисов',
                  url: 'https://samararegiongaz.ru/about/contacts/'
                },
                {
                  type: 'link',
                  text: '💳 Оплатить',
                  url: 'https://samararegiongaz.ru/consumer/online/'
                }
              ],
              [{
                type: 'callback',
                text: '🔙 Назад в меню',
                payload: 'back_to_menu'
              }]
            ]
          }
        }];
        break;
        
      case 'show_payment':
        responseText = `💳 **Оплата за газ:**\n\n` +
                      `**Онлайн-оплата:**\n` +
                      `https://samararegiongaz.ru/consumer/online/\n\n` +
                      `**Мобильные приложения:**\n` +
                      `• Сбербанк Онлайн\n` +
                      `• Тинькофф\n` +
                      `• Госуслуги\n\n` +
                      `**Терминалы оплаты:**\n` +
                      `• Отделения банков\n` +
                      `• Почта России\n` +
                      `• Платежные терминалы`;
        attachments = [{
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
        }];
        break;
        
      case 'show_tariffs':
        responseText = `📊 **Тарифы на газ (2024):**\n\n` +
                      `**Самарская область:**\n` +
                      `• С газовой плитой: 8,30 ₽/м³\n` +
                      `• Отопление газом: 6,67 ₽/м³\n\n` +
                      `**💡 Примечание:**\n` +
                      `• Тарифы устанавливаются РСО\n` +
                      `• Актуальные тарифы на сайте`;
        attachments = [{
          type: 'inline_keyboard',
          payload: {
            buttons: [
              [
                {
                  type: 'link',
                  text: '📄 Подробнее о тарифах',
                  url: 'https://samararegiongaz.ru/consumer/tariffs/'
                },
                {
                  type: 'callback',
                  text: '💳 Оплатить',
                  payload: 'show_payment'
                }
              ],
              [{
                type: 'callback',
                text: '🔙 Назад в меню',
                payload: 'back_to_menu'
              }]
            ]
          }
        }];
        break;
        
      case 'show_help':
        responseText = `📱 **Помощь:**\n\n` +
                      `**Команды:**\n` +
                      `/start - меню\n` +
                      `/contacts - контакты\n` +
                      `/pay - оплата\n` +
                      `/tariffs - тарифы\n` +
                      `/help - справка\n\n` +
                      `**Экстренные службы:**\n` +
                      `При запахе газа: 104\n` +
                      `Пожарная: 101\n` +
                      `Скорая: 103`;
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
                  text: '❓ Частые вопросы',
                  url: 'https://samararegiongaz.ru/consumer/faq/'
                }
              ],
              [{
                type: 'callback',
                text: '🔙 Назад',
                payload: 'back_to_menu'
              }]
            ]
          }
        }];
        break;
        
      case 'back_to_menu':
        responseText = `🏠 **Главное меню**\n\n` +
                      `ООО "Газпром межрегионгаз Самара"\n` +
                      `Выберите раздел:`;
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
        }];
        break;
        
      default:
        responseText = `Команда "${payload}" не распознана.\n` +
                      `Используйте меню ниже:`;
        attachments = [{
          type: 'inline_keyboard',
          payload: {
            buttons: [[{
              type: 'callback',
              text: '🏠 В главное меню',
              payload: 'back_to_menu'
            }]]
          }
        }];
    }
    
    // Отправляем ответ
    try {
      await sendMessage(chatId, responseText, {
        attachments: attachments,
        format: format
      });
    } catch (error) {
      console.error('❌ Ошибка отправки callback ответа:', error);
    }
  }
  
  // Обработка добавления бота в чат
  else if (update.type === 'bot_added') {
    console.log('🤖 Бот добавлен в чат:', update.chat_id);
    try {
      await sendMessage(update.chat_id,
        `👋 Здравствуйте! Я бот ООО "Газпром межрегионгаз Самара".\n\n` +
        `Я помогу вам с:\n` +
        `• Контактной информацией\n` +
        `• Оплатой услуг\n` +
        `• Тарифами на газ\n` +
        `• Ответами на вопросы\n\n` +
        `Используйте /start для начала работы.`,
        { format: 'markdown' }
      );
    } catch (error) {
      console.error('❌ Ошибка при добавлении бота:', error);
    }
  }
  
  // Обработка запуска бота
  else if (update.type === 'bot_started') {
    console.log('🚀 Бот запущен пользователем:', update.user_id);
  }
  
  // Обработка удаления бота из чата
  else if (update.type === 'bot_removed') {
    console.log('👋 Бот удален из чата:', update.chat_id);
  }
  
  else {
    console.log('⚠️ Необработанный тип обновления:', update.type);
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
      console.log(`👤 Username: @${botInfo.username || 'не указан'}`);
    } else {
      console.error('❌ Ошибка авторизации. Проверьте токен!');
      process.exit(1);
    }
    
    // Запускаем HTTP сервер
    server.listen(PORT, () => {
      console.log(`🌐 HTTP сервер запущен на порту ${PORT}`);
      console.log(`📡 Статус сервера: http://localhost:${PORT}/`);
      console.log('📊 Информация:');
      console.log('Node.js:', process.version);
      console.log('Платформа:', process.platform);
      console.log('Время запуска:', new Date().toLocaleString());
      console.log('='.repeat(50));
      console.log('🤖 Бот готов к работе!');
      console.log('\n📝 Инструкция по настройке вебхука в MAX:');
      console.log('1. Получите публичный домен от BotHost');
      console.log('2. В настройках бота @PrimeBot укажите вебхук:');
      console.log(`   https://ваш-домен.ботхост/webhook`);
      console.log('\n⚠️  Если домен еще не получен:');
      console.log('1. Запустите бота');
      console.log('2. Получите домен в BotHost');
      console.log('3. Вызовите функцию установки вебхука');
      console.log('\n🔄 Для установки вебхука выполните:');
      console.log('curl -X POST http://localhost:3000/set-webhook');
    });
    
    // Ручная установка вебхука (раскомментировать при необходимости)
    // const webhookUrl = 'https://ваш-домен.ботхост/webhook';
    // console.log(`\n📡 Устанавливаем вебхук: ${webhookUrl}`);
    // const webhookResult = await setWebhook(webhookUrl);
    // if (webhookResult) {
    //   console.log('✅ Вебхук успешно установлен');
    // } else {
    //   console.log('⚠️ Не удалось установить вебхук');
    // }
    
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
}

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

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('💥 Необработанная ошибка:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Необработанный промис:', reason);
});

// Запускаем бота
startBot();
