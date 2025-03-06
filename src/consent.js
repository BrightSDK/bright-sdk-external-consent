import "./styles.css";
import qrBase64 from "./qr.png";

/**
 * Creates and manages the consent module for the application.
 *
 * @param {string} targetId - The ID of the DOM element where the consent module will be appended.
 * @param {Object} [options={}] - Custom options for the consent module.
 * @returns {Object} - An object with `show` and `hide` methods to control the visibility of the consent module.
 */
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

    /**
     * Creates the consent module's DOM structure.
     *
     * @returns {Object} - Contains `show` and `hide` methods for managing the visibility of the consent module.
     */
    function create() {
        if (container) return; // Prevent multiple instances

        var parent = document.getElementById(targetId);
        parent.style.display = 'none';

        let qrCode = `<img class="qr-code" src="${settings.qrCode || qrBase64}" alt="QR Code">`;
        let acceptButton = settings.acceptButton
            ? `<img src="${settings.acceptButton}" class="button accept" alt="Accept Button">`
            : `<button class="button accept">${settings.acceptButtonText}</button>`;

        let declineButton = settings.declineButton
            ? `<img src="${settings.declineButton}" class="button decline" alt="Decline Button">`
            : `<button class="button decline">${settings.declineButtonText}</button>`;

        container = document.createElement("div");
        container.className = "external-consent-container";
        container.tabIndex = -1; // Allows keyboard focus

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
                <div class="title"></div>
            </div>
            <div class="body">
                <p class="text">
                    In order to enjoy 4k resolution videos, please allow
                    <a href="#">Bright Data</a> to use your device’s free resources
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

        // Set the title of the consent module
        container.querySelector(".title").innerHTML = settings.title;

        const buttons = container.querySelectorAll(".button");

        /**
         * Updates the focus of buttons based on the currently focused index.
         */
        function updateFocus() {
            buttons.forEach((btn, index) => {
                btn.classList.toggle("selected", index === focusedIndex);
                if (index === focusedIndex) btn.focus();
            });
        }

        /**
         * Removes the consent module from the DOM and hides the parent element.
         */
        function hide() {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            parent.style.display = 'none';
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

                // Add event listeners for button clicks (if not in preview mode)
                if (!settings.preview) {
                    buttons[0].addEventListener("click", () => {
                        settings.onDecline();
                        settings.onClose();
                        cleanup();
                    });

                    buttons[1].addEventListener("click", () => {
                        settings.onAccept();
                        settings.onClose();
                        cleanup();
                    });
                }

                /**
                 * Handles keyboard interactions for navigation and selection.
                 *
                 * @param {KeyboardEvent} event - The keyboard event.
                 */
                function handleKeydown(event) {
                    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                        focusedIndex = event.key === "ArrowRight" ? 1 : 0;
                        updateFocus();
                    } else if (event.key === "Enter") {
                        buttons[focusedIndex].click();
                    } else if (event.key === "Escape") {
                        cleanup();
                    }
                }

                if (!container.parentNode) {
                    parent.appendChild(container);
                    parent.style.display = 'flex';
                    if (!settings.preview) {
                        document.addEventListener("keydown", handleKeydown);
                        container.setAttribute("tabindex", "-1");
                        container.focus();
                        const acceptButton = container.querySelector(".accept");
                        if (acceptButton) {
                            acceptButton.focus();
                            focusedIndex = 1;
                        }
                        updateFocus();
                    }
                }
                settings.onShow();
            }),

            /**
             * Hides the consent module.
             */
            hide
        };
    }

    return create();
}

/**
 * Exposes the createConsentModule function globally if in a browser environment.
 */
if (typeof window !== "undefined") {
    window.ConsentModule = { create: createConsentModule };
}

export default { create: createConsentModule };
