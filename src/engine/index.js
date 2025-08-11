/**
 * Template manager for handling Handlebars templates with runtime i18n
 */

import Handlebars from 'handlebars/runtime';
import { ConsentI18n } from './i18n.js';

// Import all template files
import buttonsTemplate from '../templates/buttons.handlebars';
import consentBodyTemplate from '../templates/consent-body.handlebars';
import footerTemplate from '../templates/footer.handlebars';
import mainTemplate from '../templates/main.handlebars';
import simpleOptOutTemplate from '../templates/simple-opt-out.handlebars';

class TemplateManager {
    constructor() {
        this.i18n = new ConsentI18n();
        this.templates = {};
        this.loadTemplates();
    }

    /**
     * Load and register all templates and partials
     */
    loadTemplates() {
        // Register partials
        Handlebars.registerPartial('consent-body', consentBodyTemplate);
        Handlebars.registerPartial('simple-opt-out', simpleOptOutTemplate);
        Handlebars.registerPartial('buttons', buttonsTemplate);
        Handlebars.registerPartial('footer', footerTemplate);

        // Store main templates
        this.templates.main = mainTemplate;
    }

    /**
     * Process data-i18n attributes to perform runtime translation
     * @param {string} html - HTML string to process
     * @returns {string} - Translated HTML
     */
    translateElement(html) {
        // Create a temporary DOM element to process translations
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Process data-i18n-key attributes
        const elementsWithI18nKey = tempDiv.querySelectorAll('[data-i18n-key]');
        elementsWithI18nKey.forEach(element => {
            const key = element.getAttribute('data-i18n-key');
            let variables = {};

            // Check for data-variables attribute
            const dataVariables = element.getAttribute('data-variables');
            if (dataVariables) {
                try {
                    variables = JSON.parse(dataVariables);
                } catch (e) {
                    console.warn('Failed to parse data-variables:', dataVariables);
                }
            }

            const translation = this.i18n.t(key, variables);
            element.textContent = translation;
            element.removeAttribute('data-i18n-key');
            element.removeAttribute('data-variables');
        });

        // Process data-i18n-alt attributes (for alt text)
        const elementsWithI18nAlt = tempDiv.querySelectorAll('[data-i18n-alt]');
        elementsWithI18nAlt.forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const translation = this.i18n.t(key);
            element.setAttribute('alt', translation);
            element.removeAttribute('data-i18n-alt');
        });

        return tempDiv.innerHTML;
    }

    /**
     * Render a template with context
     * @param {string} templateName - Name of template to render
     * @param {Object} context - Context data for template
     * @returns {string} - Rendered HTML with translations
     */
    render(templateName, context = {}) {
        const template = this.templates[templateName];
        if (!template) {
            console.error(`Template '${templateName}' not found`);
            return '';
        }

        try {
            const html = template(context);
            return this.translateElement(html);
        } catch (error) {
            console.error(`Error rendering template '${templateName}':`, error);
            return '';
        }
    }

    /**
     * Update language for translations
     * @param {string} language - Language code
     */
    setLanguage(language) {
        this.i18n.setLanguage(language);
    }

    /**
     * Get available templates
     * @returns {Array} - Array of template names
     */
    getAvailableTemplates() {
        return Object.keys(this.templates);
    }
}

export default TemplateManager;
