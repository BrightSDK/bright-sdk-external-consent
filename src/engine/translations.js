// Import all available JSON language files
const ar_SA = require('../locales/ar_SA.json');
const de_DE = require('../locales/de_DE.json');
const en_US = require('../locales/en_US.json');
const es_ES = require('../locales/es_ES.json');
const fr_FR = require('../locales/fr_FR.json');
const hi_IN = require('../locales/hi_IN.json');
const it_IT = require('../locales/it_IT.json');
const ja_JP = require('../locales/ja_JP.json');
const nl_NL = require('../locales/nl_NL.json');
const pt_PT = require('../locales/pt_PT.json');
const ru_RU = require('../locales/ru_RU.json');
const tr_TR = require('../locales/tr_TR.json');
const zh_Hans_CN = require('../locales/zh_Hans_CN.json');

export const translations = {
  // English variants
  en: en_US,
  'en-US': en_US,

  // Arabic
  ar: ar_SA,
  'ar-SA': ar_SA,

  // German
  de: de_DE,
  'de-DE': de_DE,

  // Spanish
  es: es_ES,
  'es-ES': es_ES,

  // French
  fr: fr_FR,
  'fr-FR': fr_FR,

  // Hindi
  hi: hi_IN,
  'hi-IN': hi_IN,

  // Italian
  it: it_IT,
  'it-IT': it_IT,

  // Japanese
  ja: ja_JP,
  'ja-JP': ja_JP,

  // Dutch
  nl: nl_NL,
  'nl-NL': nl_NL,

  // Portuguese
  pt: pt_PT,
  'pt-PT': pt_PT,

  // Russian
  ru: ru_RU,
  'ru-RU': ru_RU,

  // Turkish
  tr: tr_TR,
  'tr-TR': tr_TR,

  // Chinese Simplified
  zh: zh_Hans_CN,
  'zh-CN': zh_Hans_CN,
  'zh-Hans-CN': zh_Hans_CN,
};

export default translations;
