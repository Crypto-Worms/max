require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const MAX_API_BASE = 'https://platform-api.max.ru';

let botInfo = null;

// Основная функция отправки сообщения
async function sendMessage(chatId, text) {
  try {
    await axios({
      method: 'POST',
      url: `${MAX_API_BASE}/messages`,
      headers: {
        'Authorization': BOT_TOKEN,
        'Content-Type': 'application/json'
      },
      data: {
        chat_id: chatId,
        text: text,
        format: 'markdown'
      }
    });
  } catch (error) {
    console.error('❌ Ошибка отправки:', error.message);
  }
}

// Простой бот, который отвечает на команды вручную
async function startSimpleBot() {
  console.log('🤖 Простой бот запущен');
  console.log('Бот готов к работе!');
  console.log('Username: @id6310000026_bot');
  console.log('Добавьте бота в чат и используйте команды:');
  console.log('/start, /contacts, /pay, /help');
  
  // Бот не делает автоматических запросов
  // Ожидает вебхуки от MAX
}

// Проверяем токен
async function checkToken() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${MAX_API_BASE}/me`,
      headers: {
        'Authorization': BOT_TOKEN
      }
    });
    
    botInfo = response.data;
    console.log(`✅ Бот авторизован: ${botInfo.first_name}`);
    console.log(`👤 Username: @${botInfo.username}`);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error.response?.data || error.message);
    return false;
  }
}

// Главная функция
async function main() {
  console.log('🚀 Запускаем бота для Газпром...');
  
  if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN не найден!');
    process.exit(1);
  }
  
  const authSuccess = await checkToken();
  if (!authSuccess) {
    process.exit(1);
  }
  
  // Запускаем простой бот
  startSimpleBot();
  
  // Обработка завершения
  process.on('SIGTERM', () => {
    console.log('\n🛑 Завершаем работу...');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Завершаем работу...');
    process.exit(0);
  });
}

// Запускаем
main();
