const { Bot, Dispatcher, F } = require('maxapi');
const { 
  MessageCreated, 
  MessageCallback, 
  BotAdded,
  BotStarted,
  Command
} = require('maxapi').types;
const { InlineKeyboardBuilder } = require('maxapi/utils/inline_keyboard');
const { CallbackButton, LinkButton } = require('maxapi/types');

// Инициализация бота (токен берется из переменной окружения BOT_TOKEN)
const bot = new Bot();
const dp = new Dispatcher();

// ==================== ОБРАБОТЧИКИ КОМАНД ====================

// Команда /start
dp.message_created(Command('start'))
  .handle(async (event) => {
    const userName = event.from_user?.first_name || 'Пользователь';
    const builder = new InlineKeyboardBuilder();
    
    builder.row(
      CallbackButton(
        text: '📞 Контакты',
        payload: 'show_contacts'
      ),
      CallbackButton(
        text: '💳 Оплата',
        payload: 'show_payment'
      )
    );
    
    builder.row(
      CallbackButton(
        text: '📊 Тарифы',
        payload: 'show_tariffs'
      ),
      CallbackButton(
        text: '📱 Помощь',
        payload: 'show_help'
      )
    );
    
    await event.message.answer(
      `👋 Добро пожаловать в бот ООО "Газпром межрегионгаз Самара", ${userName}!\n\n` +
      `Мы предоставляем услуги по поставке газа в Самарской области.\n\n` +
      `🛠️ **Выберите нужный раздел:**`,
      {
        attachments: [builder.as_markup()],
        format: 'markdown'
      }
    );
  });

// Команда /contacts
dp.message_created(Command('contacts'))
  .handle(async (event) => {
    const builder = new InlineKeyboardBuilder();
    
    builder.row(
      LinkButton(
        text: '🗺️ Карта офисов',
        url: 'https://samararegiongaz.ru/about/contacts/'
      )
    );
    
    builder.row(
      CallbackButton(
        text: '🔙 Назад в меню',
        payload: 'back_to_menu'
      )
    );
    
    await event.message.answer(
      `📞 **Контактная информация ООО "Газпром межрегионгаз Самара":**\n\n` +
      `📱 **Телефоны:**\n` +
      `• Единый сервисный центр: 8 846 212-32-12\n` +
      `• Бесплатная горячая линия: 8 800 201-04-04\n` +
      `• Диспетчерская служба: 8 846 212-30-80\n\n` +
      `🏢 **Адрес:**\n` +
      `г. Самара, ул. Ново-Садовая, 307А\n\n` +
      `📧 **Email:** srg@samgas.ru\n\n` +
      `🌐 **Сайт:** https://samararegiongaz.ru\n\n` +
      `⏰ **Режим работы:**\n` +
      `Пн-Чт: 8:30-17:30, Пт: 8:30-16:15, Обед: 13:00-13:45`,
      {
        attachments: [builder.as_markup()],
        format: 'markdown'
      }
    );
  });

// Команда /pay
dp.message_created(Command('pay'))
  .handle(async (event) => {
    const builder = new InlineKeyboardBuilder();
    
    builder.row(
      LinkButton(
        text: '💳 Оплатить онлайн',
        url: 'https://samararegiongaz.ru/consumer/online/'
      ),
      LinkButton(
        text: '📱 Приложение "Мой Газ"',
        url: 'https://apps.apple.com/ru/app/мой-газ/id1435736436'
      )
    );
    
    builder.row(
      CallbackButton(
        text: '📞 Контакты',
        payload: 'show_contacts'
      ),
      CallbackButton(
        text: '🔙 Назад',
        payload: 'back_to_menu'
      )
    );
    
    await event.message.answer(
      `💳 **Способы оплаты за газ:**\n\n` +
      `**🌐 Онлайн-оплата:**\n` +
      `• [Официальный портал](https://samararegiongaz.ru/consumer/online/)\n` +
      `• Госуслуги\n` +
      `• Сбербанк Онлайн\n\n` +
      `**🏛️ Банки и терминалы:**\n` +
      `• Отделения Сбербанка\n` +
      `• Почта России\n` +
      `• Платежные терминалы\n\n` +
      `**💡 Для оплаты потребуется:**\n` +
      `• Лицевой счет абонента\n` +
      `• Сумма к оплате`,
      {
        attachments: [builder.as_markup()],
        format: 'markdown'
      }
    );
  });

// Команда /help
dp.message_created(Command('help'))
  .handle(async (event) => {
    const builder = new InlineKeyboardBuilder();
    
    builder.row(
      CallbackButton(
        text: '📞 Контакты',
        payload: 'show_contacts'
      ),
      CallbackButton(
        text: '💳 Оплата',
        payload: 'show_payment'
      )
    );
    
    builder.row(
      CallbackButton(
        text: '📊 Тарифы',
        payload: 'show_tariffs'
      ),
      LinkButton(
        text: '❓ Частые вопросы',
        url: 'https://samararegiongaz.ru/consumer/faq/'
      )
    );
    
    await event.message.answer(
      `📱 **Помощь по использованию бота:**\n\n` +
      `**Основные команды:**\n` +
      `/start - Главное меню\n` +
      `/contacts - Контактная информация\n` +
      `/pay - Оплата услуг\n` +
      `/help - Эта справка\n\n` +
      `**🔔 Экстренные службы:**\n` +
      `При запахе газа: 104 (бесплатно)\n` +
      `Пожарная служба: 101\n` +
      `Скорая помощь: 103`,
      {
        attachments: [builder.as_markup()],
        format: 'markdown'
      }
    );
  });

// Обработка текстовых сообщений с ключевыми словами (используем MagicFilter)
dp.message_created(F.message.body.text.lower().contains('тариф'))
  .handle(async (event) => {
    const builder = new InlineKeyboardBuilder();
    
    builder.row(
      LinkButton(
        text: '📄 Подробнее о тарифах',
        url: 'https://samararegiongaz.ru/consumer/tariffs/'
      ),
      CallbackButton(
        text: '💳 Оплатить',
        payload: 'show_payment'
      )
    );
    
    await event.message.answer(
      `📊 **Тарифы на газ для населения (2024 год):**\n\n` +
      `**Самарская область:**\n` +
      `• При наличии газовой плиты: 8,30 ₽/м³\n` +
      `• Отопление газом: 6,67 ₽/м³\n\n` +
      `**💡 Примечание:**\n` +
      `• Тарифы устанавливаются Региональной службой\n` +
      `• Актуальные тарифы уточняйте на сайте`,
      {
        attachments: [builder.as_markup()],
        format: 'markdown'
      }
    );
  });

// Экстренная ситуация - запах газа
dp.message_created(F.message.body.text.lower().contains('запах') || 
                   F.message.body.text.lower().contains('утечк') || 
                   F.message.body.text == '104')
  .handle(async (event) => {
    await event.message.answer(
      `🚨 **ДЕЙСТВИЯ ПРИ ЗАПАХЕ ГАЗА:**\n\n` +
      `**НЕМЕДЛЕННО:**\n` +
      `1. 📞 **Позвоните 104** (аварийная газовая служба)\n` +
      `2. 🔥 **Не включайте** электроприборы\n` +
      `3. 🚭 **Не зажигайте** огонь\n` +
      `4. 🪟 **Откройте** окна для проветривания\n` +
      `5. 🚪 **Покиньте** помещение\n\n` +
      `**📞 Экстренные телефоны:**\n` +
      `• Газовая служба: 104\n` +
      `• Пожарная служба: 101\n` +
      `• ЕДДС: 112`,
      {
        format: 'markdown'
      }
    );
  });

// Показания счетчика
dp.message_created(F.message.body.text.lower().contains('показани') || 
                   F.message.body.text.lower().contains('счетчик'))
  .handle(async (event) => {
    await event.message.answer(
      `🔢 **Передача показаний счетчика:**\n\n` +
      `**Способы передачи:**\n` +
      `1. 📱 **Мобильное приложение** "Мой Газ"\n` +
      `2. 🌐 **Личный кабинет** на сайте\n` +
      `3. 📞 **Телефон:** 8 846 212-32-12\n\n` +
      `**📅 Сроки передачи:**\n` +
      `• С 15 по 25 число каждого месяца`,
      {
        format: 'markdown'
      }
    );
  });

// Любое другое текстовое сообщение
dp.message_created(F.message.body.text)
  .handle(async (event) => {
    const userName = event.from_user?.first_name || 'друг';
    const text = event.message.body.text;
    
    const builder = new InlineKeyboardBuilder();
    
    builder.row(
      CallbackButton(
        text: '📞 Контакты',
        payload: 'show_contacts'
      ),
      CallbackButton(
        text: '💳 Оплата',
        payload: 'show_payment'
      )
    );
    
    await event.message.answer(
      `👋 Привет, ${userName}!\n\n` +
      `Вы написали: "${text}"\n\n` +
      `Для получения информации используйте команды:\n` +
      `/start - главное меню\n` +
      `/contacts - контакты\n` +
      `/pay - оплата\n` +
      `/help - помощь\n\n` +
      `Или выберите нужный раздел ниже:`,
      {
        attachments: [builder.as_markup()],
        format: 'markdown'
      }
    );
  });

// ==================== ОБРАБОТКА CALLBACK-КНОПОК ====================

dp.message_callback()
  .handle(async (event) => {
    const payload = event.callback.payload;
    
    switch (payload) {
      case 'show_contacts':
        const contactsBuilder = new InlineKeyboardBuilder();
        contactsBuilder.row(
          CallbackButton(
            text: '💳 Оплата',
            payload: 'show_payment'
          ),
          CallbackButton(
            text: '📊 Тарифы',
            payload: 'show_tariffs'
          )
        );
        contactsBuilder.row(
          CallbackButton(
            text: '🔙 Назад в меню',
            payload: 'back_to_menu'
          )
        );
        
        await event.answer(
          `📞 **Контакты:**\n\n` +
          `• Телефон: 8 846 212-32-12\n` +
          `• Горячая линия: 8 800 201-04-04\n` +
          `• Адрес: ул. Ново-Садовая, 307А\n` +
          `• Email: srg@samgas.ru`,
          {
            attachments: [contactsBuilder.as_markup()],
            format: 'markdown'
          }
        );
        break;
        
      case 'show_payment':
        const paymentBuilder = new InlineKeyboardBuilder();
        paymentBuilder.row(
          LinkButton(
            text: '💳 Оплатить онлайн',
            url: 'https://samararegiongaz.ru/consumer/online/'
          )
        );
        paymentBuilder.row(
          CallbackButton(
            text: '📞 Контакты',
            payload: 'show_contacts'
          ),
          CallbackButton(
            text: '🔙 Назад',
            payload: 'back_to_menu'
          )
        );
        
        await event.answer(
          `💳 **Оплата за газ:**\n\n` +
          `Для оплаты услуг перейдите по ссылке:\n` +
          `https://samararegiongaz.ru/consumer/online/\n\n` +
          `📱 **Мобильные приложения:**\n` +
          `• Сбербанк Онлайн\n` +
          `• Тинькофф\n` +
          `• Госуслуги`,
          {
            attachments: [paymentBuilder.as_markup()],
            format: 'markdown'
          }
        );
        break;
        
      case 'show_tariffs':
        const tariffsBuilder = new InlineKeyboardBuilder();
        tariffsBuilder.row(
          LinkButton(
            text: '📄 Подробнее о тарифах',
            url: 'https://samararegiongaz.ru/consumer/tariffs/'
          )
        );
        tariffsBuilder.row(
          CallbackButton(
            text: '💳 Оплатить',
            payload: 'show_payment'
          ),
          CallbackButton(
            text: '🔙 Назад',
            payload: 'back_to_menu'
          )
        );
        
        await event.answer(
          `📊 **Тарифы на газ:**\n\n` +
          `**Самарская область:**\n` +
          `• С газовой плитой: 8,30 ₽/м³\n` +
          `• Отопление газом: 6,67 ₽/м³\n\n` +
          `**💡 Примечание:**\n` +
          `• Тарифы устанавливаются РСО\n` +
          `• Актуальные тарифы на сайте`,
          {
            attachments: [tariffsBuilder.as_markup()],
            format: 'markdown'
          }
        );
        break;
        
      case 'show_help':
        const helpBuilder = new InlineKeyboardBuilder();
        helpBuilder.row(
          CallbackButton(
            text: '📞 Контакты',
            payload: 'show_contacts'
          ),
          CallbackButton(
            text: '💳 Оплата',
            payload: 'show_payment'
          )
        );
        helpBuilder.row(
          CallbackButton(
            text: '📊 Тарифы',
            payload: 'show_tariffs'
          ),
          LinkButton(
            text: '❓ Частые вопросы',
            url: 'https://samararegiongaz.ru/consumer/faq/'
          )
        );
        
        await event.answer(
          `🆘 **Помощь:**\n\n` +
          `Используйте команды:\n` +
          `/start - меню\n` +
          `/contacts - контакты\n` +
          `/pay - оплата\n` +
          `/help - справка\n\n` +
          `Или кнопки ниже:`,
          {
            attachments: [helpBuilder.as_markup()],
            format: 'markdown'
          }
        );
        break;
        
      case 'back_to_menu':
        const menuBuilder = new InlineKeyboardBuilder();
        menuBuilder.row(
          CallbackButton(
            text: '📞 Контакты',
            payload: 'show_contacts'
          ),
          CallbackButton(
            text: '💳 Оплата',
            payload: 'show_payment'
          )
        );
        menuBuilder.row(
          CallbackButton(
            text: '📊 Тарифы',
            payload: 'show_tariffs'
          ),
          CallbackButton(
            text: '📱 Помощь',
            payload: 'show_help'
          )
        );
        
        await event.answer(
          `🏠 **Главное меню**\n\n` +
          `ООО "Газпром межрегионгаз Самара"\n` +
          `Выберите раздел:`,
          {
            attachments: [menuBuilder.as_markup()],
            format: 'markdown'
          }
        );
        break;
        
      default:
        await event.answer(
          `Команда не распознана. Используйте меню:`,
          {
            format: 'markdown'
          }
        );
    }
  });

// ==================== ОБРАБОТКА ДРУГИХ СОБЫТИЙ ====================

// Бот добавлен в чат
dp.bot_added()
  .handle(async (event) => {
    console.log('🤖 Бот добавлен в чат:', event.chat_id);
    await bot.send_message(
      event.chat_id,
      `👋 Здравствуйте! Я бот ООО "Газпром межрегионгаз Самара".\n\n` +
      `Я помогу вам с:\n` +
      `• Контактной информацией\n` +
      `• Оплатой услуг\n` +
      `• Тарифами на газ\n` +
      `• Ответами на вопросы\n\n` +
      `Используйте /start для начала работы.`,
      {
        format: 'markdown'
      }
    );
  });

// Бот запущен пользователем
dp.bot_started()
  .handle(async (event) => {
    console.log('🚀 Бот запущен пользователем:', event.user_id);
    await bot.send_message(
      event.chat_id,
      `👋 Привет! Я бот ООО "Газпром межрегионгаз Самара".\n` +
      `Отправь мне /start для начала работы.`,
      {
        format: 'markdown'
      }
    );
  });

// ==================== ЗАПУСК БОТА ====================

async function main() {
  console.log('🚀 Запускаем бота для Газпром межрегионгаз Самара...');
  console.log('📡 Используем long polling (вебхук не требуется)');
  
  try {
    // Запускаем long polling
    await dp.start_polling(bot);
    console.log('✅ Бот успешно запущен и ожидает сообщений...');
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
}

// Обработка завершения работы
process.on('SIGTERM', () => {
  console.log('\n🛑 Получен SIGTERM, завершаем работу...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Получен SIGINT, завершаем работу...');
  process.exit(0);
});

// Запускаем бота
if (require.main === module) {
  main();
}

module.exports = { bot, dp };
