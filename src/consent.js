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
        benefitText: 'To use the app for free',
        accentColor: "#D36B2E",
        acceptTextColor: "#FFF",
        acceptButton: '',
        declineButton: '',
        declineTextColor: "#9D9B9B",
        borderColor: "#AA99EC",
        outlineColor: "#9DA9E8",
        textColor: "#171717",
        footerTextColor: "#777",
        declineButtonText: "Decline",
        acceptButtonText: "Accept",
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
            benefitText: templateManager.i18n.t(settings.benefitText),
            simpleOptOut: settings.simpleOptOut,
            status: 'disabled', // Default status for simple opt-out
            acceptButton: settings.acceptButton,
            declineButton: settings.declineButton,
            acceptButtonText: templateManager.i18n.t(settings.acceptButtonText),
            declineButtonText: templateManager.i18n.t(settings.declineButtonText),
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
                function cleanup() {
                    settings.onClose();
                    hide();
                    resolve();
                }

                if (optOutNotification)
                    optOutNotification.cleanup();

                setupContainer();

                if (settings.simpleOptOut && status) {
                    const statusElement = container.querySelector('.status');
                    if (statusElement) {
                        statusElement.textContent = status;
                    }
                }

                parent.style.display = 'none';
                parent.appendChild(container);
                parent.style.display = 'flex';

                document.activeElement.blur();
                container.focus();

                if (!settings.preview) {
                    buttons = container.querySelectorAll(".button");

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