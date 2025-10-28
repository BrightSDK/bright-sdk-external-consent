// Configuration file for consent dialog examples
// Each configuration represents a different app/game theme

const consentConfigurations = {
    africa: {
        name: "🌍 African Safari",
        description: "Wildlife screensaver theme",
        config: {
            logo: "img/africa.png",
            benefitText: "To enjoy this game without ads",
            title: "African Safari Screensaver",
            declineButtonText: "I Don't Agree",
            backgroundColor: "#FBEFCF",
            buttonColor: "#D36B2E",
            buttonTextColor: "#FFF",
            borderColor: "gray",
            outlineColor: "#9DA9E8"
        }
    },

    blackjack: {
        name: "♠️ BlackJack Casino",
        description: "Casino gaming theme with Simple Opt Out",
        config: {
            benefitText: 'To enjoy this game without ads',
            title: '$$$ BlackJack',
            logo: 'img/blackjack.png',
            backgroundColor: '#0D9A12',
            textColor: 'white',
            accentColor: '#E8EA12',
            borderColor: '#D09E72',
            footerTextColor: 'white',
            declineTextColor: 'black',
            outlineColor: '#9DA9E8',
            simpleOptOut: true
        }
    },

    masterCheckers: {
        name: "🔴 Master Checkers",
        description: "Classic board game with Simple Opt Out",
        config: {
            title: 'Master Checkers',
            logo: 'img/master-checkers.jpeg',
            backgroundColor: '#632501',
            textColor: 'white',
            accentColor: '#C79C55',
            borderColor: '#EBBC00',
            footerTextColor: 'white',
            declineTextColor: '#EBBC00',
            simpleOptOut: true
        }
    },

    epicPlayCentral: {
        name: "🎮 EpicPlay Central",
        description: "Gaming platform with HTML title support",
        config: {
            title: '<span style="color: #C172F5">Epic</span><span style="color: #9746C8">Play</span> <span style="color: #614483">Central</span>',
            logo: 'img/epicplaycentral-icon.png',
            benefitText: 'To unlock all videos',
            backgroundColor: '#EAE6F6',
            borderColor: '#AA99EC',
            outlineColor: '#9DA9E8',
            acceptTextColor: '#000000',
            declineTextColor: '#000000',
            acceptButton: 'img/epicplaycentral-accept.png'
        }
    },

    // Additional demo configurations
    minimal: {
        name: "📄 Minimal Default",
        description: "Basic consent dialog with default styling",
        config: {
            title: "App Consent",
            benefitText: "To provide you with the best experience"
        }
    },

    darkMode: {
        name: "🌙 Dark Theme",
        description: "Modern dark theme design",
        config: {
            title: "Premium Features",
            benefitText: "To unlock premium content and features",
            backgroundColor: "#2C2C2C",
            textColor: "#FFFFFF",
            accentColor: "#BB86FC",
            borderColor: "#6200EE",
            footerTextColor: "#CCCCCC"
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = consentConfigurations;
} else {
    window.consentConfigurations = consentConfigurations;
}
