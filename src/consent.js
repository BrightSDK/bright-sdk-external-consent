import "./styles.css";
import qrBase64 from "./qr.png";
import KeyCodeParser from "bright-sdk-keycode-parser";

class OptOutNotification {
    constructor() {
        this.element = null;
        this.timeout = null;
    }

    show(ms = 10000) {
        // Create notification element
        this.element = document.createElement('div');
        this.element.className = 'external-consent-simple-opt-out external-consent-simple-opt-out-enter';
        this.element.textContent = 'For settings, press [5] anytime';
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
        benefitText: 'To support the app',
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
        onShow: () => console.log("Consent Shown"),
        onAccept: () => console.log("Consent Accepted"),
        onDecline: () => console.log("Consent Declined"),
        onClose: () => console.log("Consent closed"),
    };

    // Merge user-provided options with default options
    const settings = { ...defaultOptions, ...options };
    let container = null;
    let focusedIndex = 0;
    let keydownHandler = null;
    let parent = null;
    let buttons = null;
    let optOutNotification;

    if (settings.simpleOptOut)
        optOutNotification = new OptOutNotification();

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
        let acceptButton = settings.acceptButton
            ? `<img src="${settings.acceptButton}" class="button accept" alt="Accept Button">`
            : `<button class="button accept">${settings.acceptButtonText}</button>`;
        let declineButton = settings.declineButton
            ? `<img src="${settings.declineButton}" class="button decline" alt="Decline Button">`
            : `<button class="button decline">${settings.declineButtonText}</button>`;

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

        let text = `
            <p class="text">
                ${settings.benefitText}, please allow Bright Data to use your device's free resources
                and IP address to download public web data from the Internet.
            </p>
            <p class="text">None of your personal information is collected, except your IP address. <br>
                Bright Data does not track you.
            </p>
        `;
        if (settings.simpleOptOut) {
            text += `
            <div class="simple-opt-out">
                <p class="text">Web indexing is <span class="status">disabled</span></p>
                <p class="text">You can opt out any time. Press 5 for settings.</p>
            </div>`;
        }

        container.innerHTML = `
            <div class="header">
                <img src="${settings.logo}" alt="App Logo">
                <div class="title">${settings.title}</div>
            </div>
            <div class="body">${text}</div>
            <div class="buttons">
                ${declineButton}
                ${acceptButton}
            </div>
            <div class="footer">
                <p class="footer-text">
                    Scan the QR code to learn more on Bright Data policy and ethical usage.
                </p>
                ${qrCode}
            </div>
        `;
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