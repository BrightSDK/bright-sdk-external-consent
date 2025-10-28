import KeyCodeParser from "bright-sdk-keycode-parser";
import "./css/styles.css";
import TemplateManager from "./engine";
import qrBase64 from "./img/qr.png";

class OptOutNotification {
    constructor(i18n) {
        this.element = null;
        this.timeout = null;
        this.i18n = i18n;
    }

    show(ms = 10000) {
        // Create notification element
        this.element = document.createElement('div');
        this.element.className = 'external-consent-simple-opt-out external-consent-simple-opt-out-enter';
        this.element.textContent = 'For settings, press [5] anytime'; // Could be i18n later
        document.body.appendChild(this.element);

        // Handle animation states
        requestAnimationFrame(() => {
            this.element.classList.add('external-consent-simple-opt-out-enter-active');

            // Add exit classes after delay
            this.timeout = setTimeout(() => {
                this.element.classList.add('external-consent-simple-opt-out-exit');
                this.element.classList.add('external-consent-simple-opt-out-exit-active');

                // Remove element after animation
                setTimeout(() => this.hide(), 100); // Match CSS transition duration
            }, ms);
        });
    }

    hide() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    cleanup() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.hide();
    }
}

function createConsentModule(targetId, options = {}) {
    const defaultOptions = {
        logo: "img/logo.png",
        qrCode: "",
        title: "Bright SDK Consent",
        backgroundColor: "#FBEFCF",
        accentColor: "#D36B2E",
        acceptTextColor: "#FFF",
        acceptButton: '',
        declineButton: '',
        declineTextColor: "#9D9B9B",
        borderColor: "#AA99EC",
        outlineColor: "#9DA9E8",
        textColor: "#171717",
        footerTextColor: "#777",
        // use translation keys by default (fall back to literal text if key not found)
        benefitText: 'desc_benefit_free',
        declineButtonText: "i_disagree",
        acceptButtonText: "i_agree",
        preview: false,
        simpleOptOut: false,
        language: 'en', // Default language
        onShow: () => console.log("Consent Shown"),
        onAccept: () => console.log("Consent Accepted"),
        onDecline: () => console.log("Consent Declined"),
        onClose: () => console.log("Consent closed"),
    };

    // Merge user-provided options with default options
    const settings = { ...defaultOptions, ...options };

    // Initialize template manager
    const templateManager = new TemplateManager();
    templateManager.setLanguage(settings.language);

    // small translator helper: try to translate a key, fall back to the original string
    const tr = (key) => {
        try {
            // templateManager.i18n.t may return the key itself when not found; keep that behavior
            return templateManager.i18n && typeof templateManager.i18n.t === 'function'
                ? templateManager.i18n.t(key)
                : key;
        } catch (e) {
            return key;
        }
    };

    let container = null;
    let focusedIndex = 0;
    let keydownHandler = null;
    let parent = null;
    let buttons = null;
    let optOutNotification;

    if (settings.simpleOptOut)
        optOutNotification = new OptOutNotification(templateManager.i18n);

    function updateFocus() {
        if (!buttons) return;
        buttons.forEach((btn, index) => {
            btn.classList.toggle("selected", index === focusedIndex);
            if (index === focusedIndex) btn.focus();
        });
    }

    function setInitialFocus() {
        if (!buttons) return;
        focusedIndex = 1; // Default to Accept button
        updateFocus();
    }

    /**
     * Hides the consent module.
    */
    function hide() {
        if (keydownHandler) {
            document.removeEventListener("keydown", keydownHandler, true);
            document.removeEventListener("keyup", keydownHandler, true);
            keydownHandler = null;
        }

        if (buttons) {
            buttons.forEach(button => {
                button.removeEventListener("click", button.clickHandler);
            });
            buttons = null;
        }

        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
            container = null;
        }

        if (parent) {
            parent.style.display = 'none';
        }

        focusedIndex = 0;
    }

    function setupContainer() {

        if (container)
            hide();

        container = document.createElement("div");
        container.className = "external-consent-container";
        container.tabIndex = -1;

        // Apply language-specific class (e.g. 'lang-ru') to allow CSS tweaks per-language
        try {
            const curLang = (templateManager && templateManager.i18n && typeof templateManager.i18n.getCurrentLanguage === 'function')
                ? templateManager.i18n.getCurrentLanguage()
                : settings.language;
            if (curLang && String(curLang).toLowerCase().startsWith('ru')) {
                container.classList.add('lang-ru');
            }
        } catch (e) {
            // ignore
        }

        // If simpleOptOut is enabled, add a class so CSS can position elements (buttons) appropriately
        if (settings.simpleOptOut) {
            container.classList.add('simple-opt-out-enabled');
        }

        let qrCode = `<img class="qr-code" src="${settings.qrCode || qrBase64}" alt="QR Code">`;

        // Set CSS custom properties
        container.style.setProperty("--background-color", settings.backgroundColor);
        container.style.setProperty("--accent-color", settings.accentColor);
        container.style.setProperty("--text-color", settings.textColor);
        container.style.setProperty("--button-color", settings.accentColor);
        container.style.setProperty("--accept-text-color", settings.acceptTextColor);
        container.style.setProperty("--decline-text-color", settings.declineTextColor);
        container.style.setProperty("--border-color", settings.borderColor);
        container.style.setProperty("--outline-color", settings.outlineColor);
        container.style.setProperty("--footer-text-color", settings.footerTextColor);

        // Render the main template with context
        const templateContext = {
            logo: settings.logo,
            title: settings.title,
            benefitText: tr(settings.benefitText),
            simpleOptOut: settings.simpleOptOut,
            status: 'disabled', // Default status for simple opt-out
            acceptButton: settings.acceptButton,
            declineButton: settings.declineButton,
            acceptButtonText: tr(settings.acceptButtonText),
            declineButtonText: tr(settings.declineButtonText),
            qrCode: settings.qrCode || qrBase64
        };

        container.innerHTML = templateManager.render('main', templateContext);

        // Post-process title to support HTML rendering
        const titleElement = container.querySelector('.title');
        if (titleElement && settings.title) {
            titleElement.innerHTML = settings.title;
        }
    }

    /**
     * Creates the consent module's DOM structure.
     *
     * @returns {Object} - Contains `show` and `hide` methods for managing the visibility of the consent module.
     */
    function create() {
        parent = document.getElementById(targetId);
        if (!parent) {
            console.error(`Element with id ${targetId} not found`);
            return null;
        }

        return {
            /**
             * Shows the consent module and triggers callbacks.
             *
             * @returns {Promise} - Resolves when the consent module is closed.
             */
            show: status => new Promise((resolve) => {
                // Log immediate entry to show() so we can detect whether show() is called
                // even when the later simpleOptOut branch is not reached.
                try {
                    console.log('[consent] show() called', { status, simpleOptOut: settings.simpleOptOut });
                } catch (e) {
                    // ignore environments where console isn't available
                }
                function cleanup() {
                    settings.onClose();
                    hide();
                    resolve();
                }

                if (optOutNotification)
                    optOutNotification.cleanup();

                setupContainer();

                // Handle simple opt-out status rendering. Accept an explicit `status` argument
                // but also gracefully handle cases where `status` is undefined by reading
                // any existing inline .status text from the rendered template or using a default.
                if (settings.simpleOptOut) {
                    // Always use the single web_indexing_status key and inject a localized status value into the
                    // {{status}} placeholder while preserving the inline <span class="status"> element.
                    // Prefer the status <span> inside the simple-opt-out block so we don't accidentally
                    // overwrite the top-level benefit paragraph. Templates are already translated
                    // at this point and data-i18n-key attributes may have been removed, so select
                    // by the rendered .status element if present.
                    let statusPara = null;
                    const statusSpan = container.querySelector('.simple-opt-out .status');
                    if (statusSpan) {
                        // Use the containing paragraph for full replacement
                        statusPara = statusSpan.closest('p') || statusSpan.parentElement;
                    } else {
                        // Fallback: look for the simple-opt-out paragraph first, then any .text
                        statusPara = container.querySelector('.simple-opt-out .text') || container.querySelector('.text');
                    }

                    if (statusPara) {
                        // find span if present within the chosen paragraph
                        const innerStatusSpan = statusPara.querySelector('.status');

                        // Resolve the effective status: prefer the explicit `status` argument,
                        // fall back to the existing .status text in the template, then to 'disabled'.
                        let resolvedStatus = (status !== undefined && status !== null) ? status : undefined;
                        if (resolvedStatus === undefined || resolvedStatus === null) {
                            if (statusSpan && statusSpan.textContent) {
                                resolvedStatus = statusSpan.textContent.trim();
                            } else {
                                // Default fallback when nothing provided
                                resolvedStatus = 'disabled';
                            }
                        }

                        const statusRaw = String(resolvedStatus);

                        // Normalize the status token to a predictable key before translating.
                        // Some callers pass values like 'Enabled'/'Disabled' (capitalized) or
                        // boolean/other types — normalize to lowercase trimmed keys so
                        // locale files like "enabled"/"disabled" are matched reliably.
                        let statusKey = String(statusRaw).trim().toLowerCase();

                        // Map common boolean-like or numeric indicators to semantic keys so
                        // translations like "enabled"/"disabled" are matched.
                        if (statusKey === 'true' || statusKey === '1') {
                            statusKey = 'enabled';
                        } else if (statusKey === 'false' || statusKey === '0') {
                            statusKey = 'disabled';
                        }

                        // Try to translate the normalized status token (falls back to the original token)
                        const statusTranslated = tr(statusKey) || tr(statusRaw);

                        // Also log the computed values for easier inspection in the console.
                        try {
                            console.log('[consent] statusRaw:', statusRaw, 'statusKey:', statusKey, 'statusTranslated:', statusTranslated);
                        } catch (e) {
                            /* ignore logging errors in restricted environments */
                        }

                        // Prepare status HTML; preserve existing span attributes/styles but replace inner text
                        let statusHtml;
                        if (innerStatusSpan) {
                            try {
                                // replace inner text of the existing span outerHTML with translated text
                                statusHtml = innerStatusSpan.outerHTML.replace(/>([\s\S]*?)</, `>${statusTranslated}<`);
                            } catch (e) {
                                statusHtml = `<span class="status">${statusTranslated}</span>`;
                            }
                        } else {
                            statusHtml = `<span class="status">${statusTranslated}</span>`;
                        }

                        try {
                            // Some i18n backends may escape HTML when replacing variables.
                            // To ensure the prepared <span class="status"> HTML is preserved,
                            // fetch the translated template and perform a safe string replace
                            // of the {{status}} placeholder with our pre-built HTML.
                            const translatedTemplate = templateManager.i18n.t('web_indexing_status');
                            if (typeof translatedTemplate === 'string') {
                                const final = String(translatedTemplate).replace(/\{\{\s*status\s*\}\}/g, statusHtml);
                                try {
                                    // Log the translated template and the final HTML we will insert
                                    console.debug('[consent] translatedTemplate:', translatedTemplate, 'finalHtml:', final);
                                } catch (e) {}
                                statusPara.innerHTML = final;

                                try {
                                    // Confirm what ended up in the DOM immediately after assignment
                                    console.debug('[consent] statusPara.innerHTML (after set):', statusPara.innerHTML);
                                    console.debug('[consent] container.innerHTML (snippet):', container.innerHTML.slice(0, 500));
                                } catch (e) {}
                            } else {
                                // Fallback to using the translated token only
                                statusPara.textContent = templateManager.i18n.t('web_indexing_status', { status: statusTranslated });
                            }
                        } catch (e) {
                            // Fallback: plain text with translated token
                            statusPara.textContent = templateManager.i18n.t('web_indexing_status', { status: statusTranslated });
                        }
                    }
                }

                parent.style.display = 'none';
                parent.appendChild(container);
                parent.style.display = 'flex';

                document.activeElement.blur();
                container.focus();

                if (!settings.preview) {

                    buttons = container.querySelectorAll(".button");

                    // Ensure button labels are translated/updated in case the template used raw keys
                    if (buttons && buttons.length >= 2) {
                        try {
                            // left button is Decline, right button is Accept per existing code
                            // Translate the provided strings/keys similarly to benefitText translation
                            // `declineButtonTextText` was a leftover typo — use the single `declineButtonText` option only
                            // Debug: show the raw settings for button text before translation
                            try { console.log('[consent] button settings (raw): declineButtonText=', settings.declineButtonText, 'acceptButtonText=', settings.acceptButtonText); } catch (e) {}

                            // Allow passing literal strings (e.g. "Decline") and try to resolve them
                            // to translation keys the same way benefitText is handled. First try
                            // a normal translation; if that returns the original string, attempt
                            // a reverse-lookup on the English text to find the key and translate that.
                            const rawDecline = settings.declineButtonText || '';
                            const rawAccept = settings.acceptButtonText || '';

                            let translatedDecline = tr(rawDecline);
                            let translatedAccept = tr(rawAccept);

                            try {
                                // If translation returned the same literal (no mapping), try reverse lookup
                                if (translatedDecline === rawDecline && templateManager && templateManager.i18n && typeof templateManager.i18n.findKeyForText === 'function') {
                                    const foundKey = templateManager.i18n.findKeyForText(rawDecline);
                                    if (foundKey) translatedDecline = templateManager.i18n.t(foundKey);
                                }
                                if (translatedAccept === rawAccept && templateManager && templateManager.i18n && typeof templateManager.i18n.findKeyForText === 'function') {
                                    const foundKey = templateManager.i18n.findKeyForText(rawAccept);
                                    if (foundKey) translatedAccept = templateManager.i18n.t(foundKey);
                                }
                            } catch (e) {
                                // ignore lookup errors and fall back to earlier values
                            }

                            // Debug: show translated button labels before assignment
                            try { console.log('[consent] translated button labels: decline=', translatedDecline, 'accept=', translatedAccept); } catch (e) {}

                            // Use textContent to avoid inserting HTML into buttons. Fall back to original value if translation is empty.
                            buttons[0].textContent = (translatedDecline && typeof translatedDecline === 'string') ? translatedDecline : rawDecline;
                            buttons[1].textContent = (translatedAccept && typeof translatedAccept === 'string') ? translatedAccept : rawAccept;
                            try { console.log('[consent] buttons after assignment: left=', buttons[0].textContent, 'right=', buttons[1].textContent); } catch (e) {}
                        } catch (e) {
                            // ignore and keep existing labels
                        }
                    }

                     // Store click handlers for cleanup
                    buttons[0].clickHandler = () => {
                        settings.onDecline();
                        cleanup();
                    };
                    buttons[1].clickHandler = () => {
                        settings.onAccept();
                        cleanup();
                    };

                    buttons[0].addEventListener("click", buttons[0].clickHandler);
                    buttons[1].addEventListener("click", buttons[1].clickHandler);

                    /**
                     * Handles keyboard interactions for navigation and selection.
                     *
                     * @param {KeyboardEvent} event - The keyboard event.
                     */
                    keydownHandler = (event) => {
                        if (window.debugExternalConsentKeydownHandler)
                            debugger;
                        if (window.logExternalConsentKeydownHandler)
                            console.log('externalConsent keydownHandler', event);
                        const key = KeyCodeParser.parseEvent(event);
                        const {
                            RIGHT: isRight,
                            LEFT: isLeft,
                            ENTER: isEnter,
                            BACK: isBack,
                        } = key;

                        // Handle navigation
                        if (isRight || isLeft) {
                            focusedIndex = isRight ? 1 : 0;
                            updateFocus();
                            event.preventDefault();
                            event.stopPropagation();
                        } else if (isEnter) {
                            buttons[focusedIndex].click();
                            event.preventDefault();
                            event.stopPropagation();
                        } else if (isBack) {
                            cleanup();
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    };

                    requestAnimationFrame(() => {
                        setInitialFocus();
                    });

                    setTimeout(() => {
                        // Add both keydown and keyup handlers for better platform compatibility
                        document.addEventListener("keydown", keydownHandler, true);
                        document.addEventListener("keyup", keydownHandler, true);
                    }, 200); // use slight delay to avoid catching the initial keydown event
                } else {
                    // set zindex for preview to support implementation steps overlay
                    container.style.zIndex = 999;
                }

                settings.onShow();
            }),
            hide,
            showNotification: (ms) => {
                if (optOutNotification)
                    optOutNotification.show(ms);
            },
        };
    }

    return create();
}

if (typeof window !== "undefined") {
    window.ConsentModule = { create: createConsentModule };
}

export default { create: createConsentModule };