const env = require('../config/env');

const BASE_SYSTEM_PROMPT = `ВАЖНО: Отвечай ТОЛЬКО на русском языке. Названия брендов и парфюмов не переводи. Всё остальное — строго по-русски.

АБСОЛЮТНЫЙ ЗАПРЕТ: никогда не называй ароматы, которых нет в разделе АКТУАЛЬНЫЙ КАТАЛОГ. Marc Jacobs Daisy, Chanel No5, Dior Sauvage и любые другие — если их нет в каталоге, называть ЗАПРЕЩЕНО. Нарушение этого правила недопустимо.

Ты — опытный консультант парфюмерного бутика PerfStore. Помогаешь клиенту найти идеальный аромат как настоящий парфюмер.

КАК ВЕСТИ ДИАЛОГ:
- Если запрос размытый — задай 1-2 уточняющих вопроса: для кого, какой повод, какой стиль
- Если запрос конкретный — сразу рекомендуй из каталога
- Объясняй ПОЧЕМУ аромат подходит: связывай ноты и семейство с поводом или настроением
- Рекомендуй 1-3 аромата, не больше

СВЯЗЬ АРОМАТОВ С СИТУАЦИЯМИ:
- Классический стиль → древесные, восточные (статусные, сдержанные)
- Романтика/свидание → цветочные, восточные (нежные, притягивающие)
- Офис → свежие, ароматические (чистые, ненавязчивые)
- Вечер/праздник → насыщенные восточные, древесные (яркие, запоминающиеся)
- Лето → свежие, цитрусовые (лёгкие, бодрящие)
- Зима → тёплые восточные, гурманские (глубокие, обволакивающие)
- Уверенность → древесные, пряные (сильные, заметные)
- Нежность → цветочные, пудровые (воздушные, мягкие)
- Загадочность → восточные с мускусом и удом (чувственные, таинственные)

ПРАВИЛА:
1. Рекомендуй ТОЛЬКО из раздела АКТУАЛЬНЫЙ КАТАЛОГ — это реальные товары в наличии
2. Указывай название, бренд и цену
3. Не выдумывай ароматы которых нет в каталоге
4. Отвечай до 180 слов
5. Если вопрос НЕ связан с парфюмерией (например, о политике, технологиях, кулинарии и т.д.) — вежливо ответь: «Я специализируюсь только на парфюмерии. Могу помочь подобрать аромат — просто опишите повод или предпочтения.»
6. На приветствия (привет, здравствуйте и т.д.) — отвечай тепло и сразу предлагай помощь в выборе аромата`;

// ─── Post-processing: replace English words that slip through ────────────────
const EN_RU = [
  // Notes / ingredients
  [/\bbergamot\b/gi,      'бергамот'],
  [/\bpepper\b/gi,        'перец'],
  [/\blavender\b/gi,      'лаванда'],
  [/\bamber\b/gi,         'амбра'],
  [/\bmusk\b/gi,          'мускус'],
  [/\bvanilla\b/gi,       'ваниль'],
  [/\brose\b/gi,          'роза'],
  [/\bjasmine\b/gi,       'жасмин'],
  [/\bsandalwood\b/gi,    'сандал'],
  [/\bcedar\b/gi,         'кедр'],
  [/\bpatchouli\b/gi,     'пачули'],
  [/\bvetiver\b/gi,       'ветивер'],
  [/\boud\b/gi,           'уд'],
  [/\biris\b/gi,          'ирис'],
  [/\boakmoss\b/gi,       'дубовый мох'],
  [/\bcitrus\b/gi,        'цитрус'],
  [/\bwoody\b/gi,         'древесный'],
  [/\bfresh\b/gi,         'свежий'],
  [/\bfreshness\b/gi,     'свежесть'],
  [/\boriental\b/gi,      'восточный'],
  [/\bfloral\b/gi,        'цветочный'],
  [/\baromatic\b/gi,      'ароматический'],
  [/\bspicy\b/gi,         'пряный'],
  [/\bsweet\b/gi,         'сладкий'],
  [/\bwarm\b/gi,          'тёплый'],
  [/\blight\b/gi,         'лёгкий'],
  [/\bintense\b/gi,       'интенсивный'],
  [/\blong.lasting\b/gi,  'стойкий'],
  [/\bsillage\b/gi,       'шлейф'],
  // Common English words/phrases
  [/\bnotes\b/gi,         'ноты'],
  [/\benergy\b/gi,        'энергия'],
  [/\bfeel\b/gi,          'ощущение'],
  [/\bbold\b/gi,          'смелый'],
  [/\battractive\b/gi,    'привлекательный'],
  [/\bperfect\b/gi,       'идеальный'],
  [/\bexcellent\b/gi,     'отличный'],
  [/\bchoice\b/gi,        'выбор'],
  [/\bscent\b/gi,         'аромат'],
  [/\bfragrance\b/gi,     'аромат'],
  [/\bperfume\b/gi,       'парфюм'],
  [/\bpresence\b/gi,      'присутствие'],
  [/\bsensuality\b/gi,    'чувственность'],
  [/\bmodernity\b/gi,     'современность'],
  [/\bsensation\b/gi,     'ощущение'],
  [/\bdate\b/gi,          'свидание'],
  [/\boccasion\b/gi,      'повод'],
  [/\bseason\b/gi,        'сезон'],
  [/\bwould you like\b/gi,'хотите'],
  [/\bI recommend\b/gi,   'Рекомендую'],
  [/\bI would recommend\b/gi, 'Рекомендую'],
  [/\bThis scent\b/gi,    'Этот аромат'],
  [/\bThis perfume\b/gi,  'Этот парфюм'],
  [/\bHis notes\b/gi,     'Его ноты'],
  [/\bIts\b/gi,           'Его'],
  [/\bits\b/gi,           'его'],
];

function russify(text) {
  let result = text;
  for (const [pattern, replacement] of EN_RU) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

async function* streamChat(messages, catalogContext = '') {
  const systemPrompt = BASE_SYSTEM_PROMPT + (catalogContext || '');

  // Append language reminder to the last user message
  const preparedMessages = messages.map((m, i) => {
    if (m.role === 'user' && i === messages.length - 1) {
      return { role: 'user', content: m.content + '\n\n[Отвечай строго на русском языке]' };
    }
    return { role: m.role, content: m.content };
  });

  const response = await fetch(`${env.OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...preparedMessages,
      ],
      stream: true,
      options: {
        temperature: 0.3,
        num_predict: 350,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n').filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          yield russify(parsed.message.content);
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

async function checkHealth() {
  try {
    const response = await fetch(`${env.OLLAMA_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

module.exports = { streamChat, checkHealth, BASE_SYSTEM_PROMPT };
