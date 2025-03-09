import "./styles.css";
import qrBase64 from "./qr.png";

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
        declineButtonText: "Decline",
        acceptButtonText: "Accept",
        preview: false,
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

    function updateFocus() {
        if (!buttons) return;
        buttons.forEach((btn, index) => {
            btn.classList.toggle("selected", index === focusedIndex);
            if (index === focusedIndex) btn.focus();
        });
    }

    /**
     * Hides the consent module.
    */
    function hide() {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
            container = null;
        }
        if (parent) {
            parent.style.display = 'none';
        }
        if (keydownHandler) {
            document.removeEventListener("keydown", keydownHandler);
            keydownHandler = null;
        }
        buttons = null;
    }

    function setupContainer() {
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

        container.innerHTML = `
            <div class="header">
                <img src="${settings.logo}" alt="App Logo">
                <div class="title">${settings.title}</div>
            </div>
            <div class="body">
                <p class="text">
                    ${settings.benefitText}, please allow
                    <a href="#">Bright Data</a> to use your device's free resources
                    and IP address to download <a href="#">public web data</a> from the Internet.
                </p>
                <p class="text">None of your personal information is collected, except your IP address.</p>
                <p class="text">Your participation is totally optional and you may opt out at any time.</p>
            </div>
            <div class="buttons">
                ${declineButton}
                ${acceptButton}
            </div>
            <div class="footer">
                <p class="footer-text">
                    Bright Data runs in the background even after closing the application.
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
            show: () => new Promise((resolve) => {
                function cleanup() {
                    settings.onClose();
                    hide();
                    resolve();
                }

                if (container) {
                    hide(); // Clean up existing instance
                }

                setupContainer();
                parent.style.display = 'none';
                parent.appendChild(container);
                parent.style.display = 'flex';

                if (!settings.preview) {
                    buttons = container.querySelectorAll(".button");

                    buttons[0].addEventListener("click", () => {
                        settings.onDecline();
                        cleanup();
                    });

                    buttons[1].addEventListener("click", () => {
                        settings.onAccept();
                        cleanup();
                    });

                    /**
                     * Handles keyboard interactions for navigation and selection.
                     *
                     * @param {KeyboardEvent} event - The keyboard event.
                     */
                    keydownHandler = (event) => {
                        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                            focusedIndex = event.key === "ArrowRight" ? 1 : 0;
                            updateFocus();
                        } else if (event.key === "Enter") {
                            buttons[focusedIndex].click();
                        } else if (event.key === "Escape") {
                            cleanup();
                        }
                    };

                    document.addEventListener("keydown", keydownHandler);
                    container.focus();
                    const acceptButton = container.querySelector(".accept");
                    if (acceptButton) {
                        acceptButton.focus();
                        focusedIndex = 1;
                    }
                    updateFocus();
                }

                settings.onShow();
            }),
            hide
        };
    }

    return create();
}

if (typeof window !== "undefined") {
    window.ConsentModule = { create: createConsentModule };
}

export default { create: createConsentModule };