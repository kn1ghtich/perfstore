const { v4: uuidv4 }   = require('uuid');
const ChatSession      = require('../models/ChatSession');
const Product          = require('../models/Product');
const env              = require('../config/env');
const knowledgeService = require('../services/knowledge.service');

// ─── Occasion / style / mood → category mapping ──────────────────────────────
const OCCASION_MAP = [
  // Стиль
  { rx: /классич|элегант|изысканн|деловой костюм|formal/i,
    cats: ['woody', 'oriental'],
    label: 'классический и элегантный стиль' },
  { rx: /спортивн|активн|casual|повседнев|на каждый день/i,
    cats: ['fresh', 'aromatic'],
    label: 'повседневный и спортивный стиль' },
  { rx: /богемн|творческ|артист|необычн|яркий/i,
    cats: ['oriental', 'gourmand'],
    label: 'творческий и яркий образ' },
  { rx: /минимал|сдержанн|простой|нейтральн/i,
    cats: ['fresh', 'aromatic'],
    label: 'минималистичный стиль' },

  // Повод
  { rx: /свидан|романтич|влюблён|любовь/i,
    cats: ['floral', 'oriental'],
    label: 'романтическое свидание' },
  { rx: /офис|работ|деловая встреч|переговор|конференц/i,
    cats: ['fresh', 'aromatic'],
    label: 'офис и деловые встречи' },
  { rx: /вечер|праздни|банкет|торжеств|выпускн|свадьб/i,
    cats: ['oriental', 'woody'],
    label: 'вечернее мероприятие' },
  { rx: /вечеринк|клуб|тусовк|party/i,
    cats: ['oriental', 'gourmand'],
    label: 'вечеринка и клуб' },
  { rx: /подарок|подари|в подарок|gift/i,
    cats: ['floral', 'oriental'],
    label: 'подарок' },
  { rx: /спорт|трениров|фитнес|пробежк/i,
    cats: ['fresh', 'aromatic'],
    label: 'спорт и тренировки' },

  // Сезон
  { rx: /лето|летн|жарко|жара/i,
    cats: ['fresh'],
    label: 'лето' },
  { rx: /зима|зимн|холодно|мороз/i,
    cats: ['oriental', 'woody', 'gourmand'],
    label: 'зима' },
  { rx: /весна|весенн/i,
    cats: ['floral', 'fresh'],
    label: 'весна' },
  { rx: /осень|осенн/i,
    cats: ['woody', 'oriental'],
    label: 'осень' },

  // Настроение / характер
  { rx: /уверен|сильн|статусн|мощн|доминирующ/i,
    cats: ['woody', 'oriental'],
    label: 'уверенность и сила' },
  { rx: /нежн|мягк|воздушн|лёгк|невинн/i,
    cats: ['floral', 'fresh'],
    label: 'нежность и мягкость' },
  { rx: /загадочн|таинственн|чувственн|соблазн|сексуальн/i,
    cats: ['oriental'],
    label: 'загадочность и чувственность' },
  { rx: /свеж|чист|морск|природн/i,
    cats: ['fresh', 'aromatic'],
    label: 'свежесть и чистота' },
  { rx: /тепл|уют|домашн|расслаблен/i,
    cats: ['gourmand', 'woody'],
    label: 'тепло и уют' },
  { rx: /энергичн|бодр|позитивн|радостн/i,
    cats: ['fresh', 'aromatic'],
    label: 'энергия и позитив' },
];

// ─── Brand extraction (async, queries DB) ────────────────────────────────────
async function extractBrand(text) {
  try {
    const Brand = require('../models/Brand');
    const brands = await Brand.find({}).select('name _id').lean();
    const t = text.toLowerCase();
    for (const brand of brands) {
      if (t.includes(brand.name.toLowerCase())) {
        return brand._id;
      }
    }
  } catch (err) {
    console.error('[Chat] extractBrand error:', err.message);
  }
  return null;
}

// ─── Merge intent from recent message history ────────────────────────────────
function mergeWithHistory(currentIntent, messageHistory) {
  // Look back at the last 3 user messages (excluding the current one)
  const recentUserMessages = messageHistory
    .filter(m => m.role === 'user')
    .slice(-4, -1); // last 3 before current

  for (const msg of recentUserMessages) {
    const prev = extractIntent(msg.content);

    // Inherit gender if current message doesn't specify one
    if (!currentIntent.gender && prev.gender) {
      currentIntent.gender = prev.gender;
    }
    // Inherit price limits if not set in current message
    if (!currentIntent.maxPrice && prev.maxPrice) {
      currentIntent.maxPrice = prev.maxPrice;
    }
    if (!currentIntent.minPrice && prev.minPrice) {
      currentIntent.minPrice = prev.minPrice;
    }
    // Merge occasions/categories
    for (const cat of prev.categorySlugs) {
      if (!currentIntent.categorySlugs.includes(cat)) {
        currentIntent.categorySlugs.push(cat);
      }
    }
    for (const occ of prev.occasions) {
      if (!currentIntent.occasions.includes(occ)) {
        currentIntent.occasions.push(occ);
      }
    }
  }
  return currentIntent;
}

// ─── Intent extraction ───────────────────────────────────────────────────────
function extractIntent(text) {
  const t = text.toLowerCase();
  const intent = { categorySlugs: [], occasions: [] };

  // Gender
  if (/женск|для неё|для женщ|для девуш|ей в подарок|девочк/i.test(t))      intent.gender = 'female';
  else if (/мужск|для него|для мужч|для парн|ему в подарок|мальчик/i.test(t)) intent.gender = 'male';
  else if (/унисекс/i.test(t))                                                  intent.gender = 'unisex';

  // Price — digits or written-out round numbers (сто, двести, …, тысяч)
  const WORDS_NUM = {
    'десять': 10, 'двадцать': 20, 'тридцать': 30, 'сорок': 40,
    'пятьдесят': 50, 'шестьдесят': 60, 'семьдесят': 70, 'восемьдесят': 80, 'девяносто': 90,
    'сто': 100, 'двести': 200, 'триста': 300, 'четыреста': 400,
    'пятьсот': 500, 'шестьсот': 600, 'семьсот': 700, 'восемьсот': 800, 'девятьсот': 900,
    'тысяча': 1000, 'тысячи': 1000, 'тысяч': 1000,
  };
  function parsePrice(str) {
    const d = str.match(/\d+/);
    if (d) return parseFloat(d[0]);
    for (const [word, val] of Object.entries(WORDS_NUM)) {
      if (str.includes(word)) return val;
    }
    return null;
  }
  const maxMatch = t.match(/(?:до|меньше|не дороже|бюджет[^\d\w]*|не больше)\s*([\wа-яё\s]{1,20}?)(?:\s*долларов|\s*\$|[,\.!?]|$)/i);
  if (maxMatch) { const v = parsePrice(maxMatch[1]); if (v) intent.maxPrice = v; }
  const minMatch = t.match(/(?:от|дороже|не дешевле)\s*([\wа-яё\s]{1,20}?)(?:\s*долларов|\s*\$|[,\.!?]|$)/i);
  if (minMatch) { const v = parsePrice(minMatch[1]); if (v) intent.minPrice = v; }

  // Direct scent families mentioned explicitly
  const directCats = [
    { slug: 'floral',   rx: /цветоч|флорал|розовый|жасминов|пионов/i },
    { slug: 'woody',    rx: /древесн|деревянн|сандалов|кедров|пачули/i },
    { slug: 'oriental', rx: /восточн|амбров|мускусн|ванильн|с удом/i },
    { slug: 'fresh',    rx: /свеж|цитрусов|лимонн|бергамотов|морск|аквати/i },
    { slug: 'gourmand', rx: /гурман|сладк|шоколадн|карамельн|десертн/i },
    { slug: 'aromatic', rx: /травянист|лавандов|базиликов|розмаринов/i },
  ];
  for (const { slug, rx } of directCats) {
    if (rx.test(t) && !intent.categorySlugs.includes(slug)) {
      intent.categorySlugs.push(slug);
    }
  }

  // Occasion / style / mood → categories
  for (const entry of OCCASION_MAP) {
    if (entry.rx.test(t)) {
      intent.occasions.push(entry.label);
      for (const cat of entry.cats) {
        if (!intent.categorySlugs.includes(cat)) intent.categorySlugs.push(cat);
      }
    }
  }

  return intent;
}

// ─── Format products list for prompt ─────────────────────────────────────────
function formatProducts(products) {
  const GENDER_RU = { male: 'мужской', female: 'женский', unisex: 'унисекс' };
  return products.map((p) => {
    const cats  = (p.categories || []).map((c) => c.name).join(', ');
    const notes = [
      ...(p.notes?.top    || []),
      ...(p.notes?.middle || []),
      ...(p.notes?.base   || []),
    ].slice(0, 6).join(', ');
    const price = p.original_price && p.original_price > p.price
      ? `$${p.price} (скидка с $${p.original_price})`
      : `$${p.price}`;
    return [
      `• ${p.brand?.name || ''} — ${p.name}`,
      `  Цена: ${price}`,
      `  Пол: ${GENDER_RU[p.gender] || p.gender}`,
      p.concentration ? `  Концентрация: ${p.concentration}` : '',
      cats  ? `  Семейство: ${cats}`  : '',
      notes ? `  Ноты: ${notes}`      : '',
      `  Ссылка: /product/${p.slug}`,
    ].filter(Boolean).join('\n');
  }).join('\n\n');
}

// ─── Intent completeness check ───────────────────────────────────────────────
function isIntentComplete(intent) {
  // Enough to query: either gender is known OR at least one category/occasion is set
  return !!(intent.gender || intent.categorySlugs.length > 0 || intent.occasions.length > 0);
}

// ─── Guided elicitation question ─────────────────────────────────────────────
function buildClarifyingQuestion(userProfile) {
  if (!userProfile?.gender) {
    return 'Подскажите, аромат подбираем для мужчины или женщины? Это поможет мне найти лучшие варианты! 🌸';
  }
  if (!userProfile?.occasion) {
    return 'Для какого случая подбираем аромат? Например: на каждый день, для офиса, романтического свидания или особого вечера?';
  }
  return 'Есть ли предпочтения по семейству ароматов или бюджету? Например: цветочные, восточные, свежие; или укажите удобный ценовой диапазон.';
}

// ─── Detect intent type ───────────────────────────────────────────────────────
function isGreeting(text) {
  return /^(привет|здравствуй|добрый\s+\w+|хай|hello|hi|хэлло|добро пожаловать|privet)\b/i.test(text.trim());
}

function isProductQuery(text) {
  return /аромат|духи|парфюм|запах|порекоменд|посовет|подбери|что у вас|покажи|каталог|купить|подойдёт|подойдет/i.test(text);
}

// ─── Accumulate user profile from intent ─────────────────────────────────────
function updateUserProfile(session, intent) {
  const p = session.userProfile || {};
  if (intent.gender)   p.gender   = intent.gender;
  if (intent.maxPrice) p.maxPrice = intent.maxPrice;
  if (intent.minPrice) p.minPrice = intent.minPrice;
  if (intent.occasions.length > 0 && !p.occasion) p.occasion = intent.occasions[0];
  if (!Array.isArray(p.likedCategories)) p.likedCategories = [];
  for (const cat of intent.categorySlugs) {
    if (!p.likedCategories.includes(cat)) p.likedCategories.push(cat);
  }
  session.userProfile = p;
  session.markModified('userProfile');
}

// ─── Catalog context builder ─────────────────────────────────────────────────
async function buildCatalogContext(userMessage, messageHistory = [], userProfile = {}) {
  try {
    let intent = extractIntent(userMessage);
    // Inherit missing context from recent conversation history
    intent = mergeWithHistory(intent, messageHistory);

    // Seed from accumulated user profile (lowest priority — history and message override)
    if (!intent.gender && userProfile.gender)     intent.gender   = userProfile.gender;
    if (!intent.maxPrice && userProfile.maxPrice) intent.maxPrice = userProfile.maxPrice;
    if (!intent.minPrice && userProfile.minPrice) intent.minPrice = userProfile.minPrice;
    if (intent.categorySlugs.length === 0 && userProfile.likedCategories?.length > 0) {
      intent.categorySlugs = [...userProfile.likedCategories];
    }

    // Описание фильтров для ИИ (чтобы он знал что искали)
    const filterDesc = [];
    if (intent.gender)   filterDesc.push(`пол: ${{ male:'мужской', female:'женский', unisex:'унисекс' }[intent.gender]}`);
    if (intent.maxPrice) filterDesc.push(`цена до $${intent.maxPrice}`);
    if (intent.minPrice) filterDesc.push(`цена от $${intent.minPrice}`);
    if (intent.occasions.length) filterDesc.push(`повод: ${intent.occasions.join(', ')}`);

    // Brand recognition
    const brandId = await extractBrand(userMessage);
    if (brandId) filterDesc.push(`бренд: найден`);

    const baseMatch = { in_stock: true };
    if (intent.gender)   baseMatch.gender = intent.gender;
    if (intent.maxPrice) baseMatch.price  = { ...(baseMatch.price || {}), $lte: intent.maxPrice };
    if (intent.minPrice) baseMatch.price  = { ...(baseMatch.price || {}), $gte: intent.minPrice };
    if (brandId)         baseMatch.brand  = brandId;

    const SELECT = 'name brand price original_price gender concentration categories notes slug';

    // Попытка 1: все фильтры включая категории
    let products = [];
    if (intent.categorySlugs.length > 0) {
      const Category = require('../models/Category');
      const cats = await Category.find({ slug: { $in: intent.categorySlugs } }).select('_id').lean();
      const ids  = cats.map((c) => c._id);
      if (ids.length > 0) {
        products = await Product.find({ ...baseMatch, categories: { $in: ids } })
          .populate('brand', 'name').populate('categories', 'name slug')
          .select(SELECT).limit(8).lean();
      }
    }

    // Попытка 2: без категорий, но с ценой и полом
    if (products.length === 0) {
      products = await Product.find(baseMatch)
        .populate('brand', 'name').populate('categories', 'name slug')
        .select(SELECT).limit(8).lean();
    }

    const occasionHint = intent.occasions.length > 0
      ? `\nЗАПРОС КЛИЕНТА: ${intent.occasions.join(', ')}. Объясни почему каждый аромат подходит.\n`
      : '';

    // Ничего не найдено — сообщаем ИИ явно, не даём fallback
    if (products.length === 0) {
      const filterStr = filterDesc.length ? filterDesc.join(', ') : 'заданным критериям';
      return `\n\nКАТАЛОГ ПУСТ: В наличии нет товаров по запросу (${filterStr}).\nСКАЖИ КЛИЕНТУ что по этим критериям ничего не найдено и предложи расширить поиск — убрать ценовой лимит или изменить параметры. НЕ ПРИДУМЫВАЙ и НЕ НАЗЫВАЙ несуществующие ароматы.`;
    }

    const header = filterDesc.length
      ? `Найдено по запросу (${filterDesc.join(', ')}):`
      : 'Товары в наличии:';

    // Explicit allowlist — helps small models (llama3.2) stick to listed products
    const allowedNames = products.map(p => `"${p.brand?.name || ''} — ${p.name}"`).join(', ');
    const catalogBlock = `\n\n${occasionHint}АКТУАЛЬНЫЙ КАТАЛОГ PERFSTORE — ${header}\n${formatProducts(products)}\n\nСТРОГО ЗАПРЕЩЕНО: называть любые ароматы НЕ из списка выше.\nРАЗРЕШЕНО рекомендовать ТОЛЬКО: ${allowedNames}.\nЛюбой другой бренд или аромат — ОШИБКА.`;

    // Append relevant knowledge chunks for richer advice
    const relevantChunks = knowledgeService.findRelevantChunks(userMessage, 2);
    const knowledgeBlock = relevantChunks.length > 0
      ? `\n\nЭКСПЕРТНЫЕ ЗНАНИЯ (используй для совета, не цитируй дословно):\n${relevantChunks.join('\n\n')}`
      : '';

    return catalogBlock + knowledgeBlock;
  } catch (err) {
    console.error('[Chat] buildCatalogContext error:', err.message);
    return '';
  }
}

// Priority: Gemini (free) > OpenAI > Ollama (local)
function getAiService() {
  if (env.GEMINI_API_KEY) {
    console.log('[Chat] Using Gemini AI service');
    return require('../services/gemini.service');
  }
  if (env.OPENAI_API_KEY) {
    console.log('[Chat] Using OpenAI service');
    return require('../services/openai.service');
  }
  console.log('[Chat] Using Ollama (local) service');
  return require('../services/ollama.service');
}
const aiService = getAiService();

async function createSession(req, res, next) {
  try {
    const sessionId = uuidv4();
    const session = await ChatSession.create({
      sessionId,
      userId: req.user?.id || null,
      messages: [],
      metadata: { startedAt: new Date(), lastMessageAt: new Date() },
    });
    res.status(201).json({ sessionId: session.sessionId });
  } catch (err) {
    next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({
      sessionId: session.sessionId,
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const userContent = content.trim();

    // ── Guided elicitation: check intent before hitting the catalog ──────────
    if (isProductQuery(userContent) && !isGreeting(userContent)) {
      const quickIntent = extractIntent(userContent);
      mergeWithHistory(quickIntent, session.messages);
      // Also apply accumulated profile to the quick check
      if (!quickIntent.gender && session.userProfile?.gender)
        quickIntent.gender = session.userProfile.gender;
      if (quickIntent.categorySlugs.length === 0 && session.userProfile?.likedCategories?.length > 0)
        quickIntent.categorySlugs = [...session.userProfile.likedCategories];

      if (!isIntentComplete(quickIntent)) {
        const question = buildClarifyingQuestion(session.userProfile);

        // Set SSE headers before writing
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        res.write(`data: ${JSON.stringify({ token: question })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

        session.messages.push({ role: 'user',      content: userContent, timestamp: new Date() });
        session.messages.push({ role: 'assistant',  content: question,    timestamp: new Date() });
        session.metadata.lastMessageAt = new Date();
        await session.save();
        return;
      }
    }

    // Build catalog context using current message + conversation history + userProfile
    const catalogContext = await buildCatalogContext(
      userContent,
      session.messages,
      session.userProfile || {},
    );

    // Update accumulated user profile from current message intent
    const currentIntent = extractIntent(userContent);
    mergeWithHistory(currentIntent, session.messages);
    updateUserProfile(session, currentIntent);

    // Add user message
    session.messages.push({ role: 'user', content: userContent, timestamp: new Date() });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullResponse = '';

    // ── Guard: catalog empty → safe hardcoded reply, never call AI ──────────
    if (catalogContext.includes('КАТАЛОГ ПУСТ')) {
      const filterMatch = catalogContext.match(/по запросу \(([^)]+)\)/);
      const filterStr = filterMatch ? filterMatch[1] : 'заданным критериям';
      fullResponse =
        `К сожалению, в нашем каталоге сейчас нет ароматов по запросу: ${filterStr}.\n\n` +
        `Попробуйте:\n` +
        `• Убрать ценовой лимит — «покажи женские ароматы для свидания»\n` +
        `• Изменить категорию или пол\n` +
        `• Написать просто «что есть в наличии?»`;
      res.write(`data: ${JSON.stringify({ token: fullResponse })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      session.messages.push({ role: 'assistant', content: fullResponse, timestamp: new Date() });
      session.metadata.lastMessageAt = new Date();
      await session.save();
      return;
    }

    // Trim to last 20 messages for a longer memory window
    const messagesForAI = session.messages.slice(-20);

    try {
      for await (const token of aiService.streamChat(messagesForAI, catalogContext)) {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    } catch (aiErr) {
      console.error('[Chat] AI service error:', aiErr.message);
      const fallback = 'Извините, ИИ-консультант временно недоступен. Попробуйте позже или просмотрите каталог самостоятельно.';
      fullResponse = fallback;
      res.write(`data: ${JSON.stringify({ token: fallback })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Save assistant message
    session.messages.push({ role: 'assistant', content: fullResponse, timestamp: new Date() });
    session.metadata.lastMessageAt = new Date();
    await session.save();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    }
  }
}

async function listSessions(req, res, next) {
  try {
    const sessions = await ChatSession.find({ userId: req.user.id })
      .sort({ 'metadata.lastMessageAt': -1 })
      .select('sessionId metadata messages')
      .limit(20);

    res.json({
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        startedAt: s.metadata.startedAt,
        lastMessageAt: s.metadata.lastMessageAt,
        messageCount: s.messages.length,
        preview: s.messages.find(m => m.role === 'user')?.content?.substring(0, 100) || '',
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSession, getSession, sendMessage, listSessions };
