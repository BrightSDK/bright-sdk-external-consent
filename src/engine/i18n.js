/**
 * Simple runtime i18n system for consent module
 */

import translations from './translations.js';

class ConsentI18n {
    constructor(defaultLanguage = 'en') {
        this.currentLanguage = defaultLanguage;
        this.translations = translations;
        this.reverseCache = null;
        this.buildReverseCache();
    }

    /**
     * Build reverse lookup cache from English translations
     * Maps cleaned English text to translation keys
     */
    buildReverseCache() {
        this.reverseCache = new Map();
        const englishTranslations = this.translations.en || {};

        Object.keys(englishTranslations).forEach(key => {
            const text = englishTranslations[key];
            if (typeof text === 'string') {
                // Clean the text by removing all markup tags
                const cleanedText = this.cleanText(text);
                this.reverseCache.set(cleanedText.toLowerCase(), key);
            }
        });
    }

    /**
     * Clean text by removing all markup tags and placeholders
     * @param {string} text - Text to clean
     * @returns {string} - Cleaned text
     */
    cleanText(text) {
        if (typeof text !== 'string') return text;

        return text
            // Remove {url} and {/url} tags
            .replace(/\{url\}/g, '')
            .replace(/\{\/url\}/g, '')
            // Remove {tooltip:...} and {/tooltip} tags
            .replace(/\{tooltip:\w+\}/g, '')
            .replace(/\{\/tooltip\}/g, '')
            // Remove placeholder tags
            .replace(/\{placeholder:\w+\/\}/g, '')
            // Trim whitespace
            .trim();
    }

    /**
     * Find translation key for a given text value
     * @param {string} text - Text to find key for
     * @returns {string|null} - Translation key or null if not found
     */
    findKeyForText(text) {
        if (!text || typeof text !== 'string') return null;

        const cleanedText = this.cleanText(text).toLowerCase();
        return this.reverseCache.get(cleanedText) || null;
    }

    /**
     * Set current language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
        } else {
            console.warn(`Language '${language}' not found, using ${this.currentLanguage}`);
        }
    }

    /**
     * Get translated text
     * @param {string} keyOrText - Translation key or English text to translate
     * @param {Object} variables - Variables for interpolation
     * @returns {string} - Translated text
     */
    t(keyOrText, variables = {}) {
        const currentTranslations = this.translations[this.currentLanguage] || this.translations.en || {};

        let actualKey = keyOrText;
        let text;

        // First, try to use it as a direct key
        if (currentTranslations[keyOrText]) {
            text = currentTranslations[keyOrText];
        } else {
            // If not found as key, try reverse lookup to find the key for this text
            const foundKey = this.findKeyForText(keyOrText);
            if (foundKey && currentTranslations[foundKey]) {
                actualKey = foundKey;
                text = currentTranslations[foundKey];
            } else {
                // Fallback to the original input
                text = keyOrText;
            }
        }

        // Simple variable interpolation for placeholders like {placeholder:app_name/}
        if (variables && typeof text === 'string') {
            text = text.replace(/\{placeholder:(\w+)\/\}/g, (match, varName) => {
                return variables[varName] !== undefined ? variables[varName] : match;
            });

            // Handle simple {{variable}} style placeholders
            text = text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
                return variables[varName] !== undefined ? variables[varName] : match;
            });
        }

        // Remove {url} and {/url} tags
        if (typeof text === 'string') {
            text = text.replace(/\{url\}/g, '');
            text = text.replace(/\{\/url\}/g, '');

            // Remove {tooltip:...} and {/tooltip} tags
            text = text.replace(/\{tooltip:\w+\}/g, '');
            text = text.replace(/\{\/tooltip\}/g, '');
        }

        return text;
    }

    /**
     * Get all available languages
     * @returns {Array} - Array of language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Get current language
     * @returns {string} - Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

}

export { ConsentI18n };
