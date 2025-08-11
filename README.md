# External Consent for BrightSDK Apps

## Overview
**External Consent for BrightSDK Apps** is a JavaScript module that provides a customizable, internationalized consent dialog for applications integrating with BrightSDK. It features a modern template engine with Handlebars, comprehensive i18n support for 13 languages, and reverse lookup capabilities for dynamic text translation.

## Features
- 🌐 **13 Language Support**: Arabic, German, English, Spanish, French, Hindi, Italian, Japanese, Dutch, Portuguese, Russian, Turkish, and Chinese Simplified
- 🔄 **Reverse Lookup Translation**: Automatically finds translation keys for English text values
- 🎨 **Handlebars Template Engine**: Modular template system with runtime i18n processing
- 🎯 **Smart Text Processing**: Handles placeholders, URL tags, and tooltip markup automatically
- ⌨️ **Keyboard Navigation**: Full keyboard support for accessibility
- 📱 **Responsive Design**: Works across different screen sizes and devices
- 🎨 **Customizable Styling**: CSS custom properties for easy theming

## Installation
Include the module in your project:
```javascript
import ConsentModule from 'bright-sdk-external-consent';
```

## Usage

### Basic Usage
```javascript
const consent = ConsentModule.create('consent-container', {
    language: 'en',
    benefitText: 'To use the app for free',
    onAccept: () => console.log('User accepted consent'),
    onDecline: () => console.log('User declined consent')
});

consent.show();
```

### Multi-language Support
```javascript
const consent = ConsentModule.create('consent-container', {
    language: 'es', // Spanish
    benefitText: 'Para usar la aplicación gratis',
    acceptButtonText: 'Aceptar',
    declineButtonText: 'Rechazar'
});

consent.show();
```

### Reverse Lookup Translation
The system automatically handles both translation keys and English text:
```javascript
const consent = ConsentModule.create('consent-container', {
    language: 'fr',
    benefitText: 'To use the app for free', // Automatically finds and translates
    acceptButtonText: 'Accept', // Automatically translates to French
});
```

## API Reference

### `ConsentModule.create(targetId, options)`
Creates a new consent dialog instance with full i18n support.

#### Parameters
- `targetId` (string, required) - ID of the DOM element where the dialog will be placed.
- `options` (object, optional) - Customization options for the consent dialog.

#### Options

##### Basic Options
- `language` (string) - Language code (e.g., 'en', 'es', 'fr', 'de'). Default: 'en'
- `benefitText` (string) - Benefit text shown to user. Default: 'To use the app for free'
- `acceptButtonText` (string) - Text for the accept button. Default: 'Accept'
- `declineButtonText` (string) - Text for the decline button. Default: 'Decline'

##### Visual Customization
- `logo` (string) - URL of the logo image. Default: 'img/logo.png'
- `qrCode` (string) - URL of a QR code image
- `title` (string) - Title text of the dialog (supports HTML). Default: 'Bright SDK Consent'
- `backgroundColor` (string) - Background color. Default: '#FBEFCF'
- `accentColor` (string) - Accent color for buttons. Default: '#D36B2E'
- `acceptTextColor` (string) - Accept button text color. Default: '#FFF'
- `declineTextColor` (string) - Decline button text color. Default: '#9D9B9B'
- `borderColor` (string) - Border color. Default: '#AA99EC'
- `outlineColor` (string) - Outline color. Default: '#9DA9E8'
- `textColor` (string) - Main text color. Default: '#171717'
- `footerTextColor` (string) - Footer text color. Default: '#777'

##### Button Images
- `acceptButton` (string) - URL for custom accept button image
- `declineButton` (string) - URL for custom decline button image

##### Behavior Options
- `preview` (boolean) - Preview mode (no interactions). Default: false
- `simpleOptOut` (boolean) - Show simple opt-out notification. Default: false

##### Callbacks
- `onShow` (function) - Callback when the dialog is shown
- `onAccept` (function) - Callback when the user accepts consent
- `onDecline` (function) - Callback when the user declines consent
- `onClose` (function) - Callback when the dialog is closed

### Methods

#### `show(status)`
Displays the consent dialog and returns a promise that resolves when the dialog is closed.
```javascript
consent.show().then(() => console.log('Consent dialog closed'));

// For simple opt-out mode
consent.show('enabled').then(() => console.log('Opt-out dialog closed'));
```

#### `hide()`
Manually hides the consent dialog.
```javascript
consent.hide();
```

#### `showNotification(ms)`
Shows a simple opt-out notification (only available when `simpleOptOut` is enabled).
```javascript
consent.showNotification(5000); // Show for 5 seconds
```

## Supported Languages

The module supports 13 languages with both short and full locale codes:

| Language | Short Code | Full Code | File |
|----------|------------|-----------|------|
| English | `en` | `en-US` | `en_US.json` |
| Spanish | `es` | `es-ES` | `es_ES.json` |
| French | `fr` | `fr-FR` | `fr_FR.json` |
| German | `de` | `de-DE` | `de_DE.json` |
| Italian | `it` | `it-IT` | `it_IT.json` |
| Portuguese | `pt` | `pt-PT` | `pt_PT.json` |
| Russian | `ru` | `ru-RU` | `ru_RU.json` |
| Arabic | `ar` | `ar-SA` | `ar_SA.json` |
| Hindi | `hi` | `hi-IN` | `hi_IN.json` |
| Japanese | `ja` | `ja-JP` | `ja_JP.json` |
| Dutch | `nl` | `nl-NL` | `nl_NL.json` |
| Turkish | `tr` | `tr-TR` | `tr_TR.json` |
| Chinese (Simplified) | `zh` | `zh-CN`, `zh-Hans-CN` | `zh_Hans_CN.json` |

## Advanced Features

### Reverse Lookup Translation
The system automatically detects if you're passing English text or translation keys:

```javascript
// Both of these work the same way:
benefitText: 'To use the app for free'  // English text - auto-translated
benefitText: 'desc_benefit_free'        // Translation key - directly used
```

### Template Customization
The module uses Handlebars templates organized in `src/templates/`:
- `main.handlebars` - Main container template
- `consent-body.handlebars` - Main consent text
- `buttons.handlebars` - Accept/Decline buttons
- `footer.handlebars` - Footer with QR code
- `simple-opt-out.handlebars` - Simple opt-out notification

### Keyboard Navigation
- **Left/Right Arrows**: Navigate between buttons
- **Enter**: Activate focused button
- **Back/Escape**: Close dialog

## Live Examples

Click the links below to see the consent dialog in action with different themes and configurations:

### Game Applications
- **[African Safari Screensaver](https://brightsdk.github.io/bright-sdk-external-consent/africa.html)** - Nature theme with warm colors
  - Custom logo and African safari branding
  - Benefit text: "To get the most of this app"
  - Warm color palette (#FBEFCF background, #D36B2E accent)

- **[BlackJack Game](https://brightsdk.github.io/bright-sdk-external-consent/blackjack.html)** - Casino game theme
  - Green casino-style background (#0D9A12)
  - White text for contrast
  - Benefit text: "In order to remove all the ads"

- **[Master Checkers](https://brightsdk.github.io/bright-sdk-external-consent/master-checkers.html)** - Classic board game
  - Traditional checkers game styling
  - Board game aesthetic

- **[Epic Play Central](https://brightsdk.github.io/bright-sdk-external-consent/epicplaycentral.html)** - Gaming portal theme
  - Gaming hub branding
  - Multi-game platform styling

### Basic Demo
- **[Default Example](https://brightsdk.github.io/bright-sdk-external-consent/index.html)** - Standard implementation
  - Default styling and configuration
  - Basic consent flow demonstration

Each example demonstrates different styling options, branding approaches, and use cases for the consent module. Simply click any link above to interact with a live demo!

## Examples

### Multi-language with Custom Styling
```javascript
const consent = ConsentModule.create('consent-container', {
    language: 'de',
    benefitText: 'To use the app for free',
    backgroundColor: '#F0F8FF',
    accentColor: '#4169E1',
    acceptTextColor: '#FFFFFF',
    onAccept: () => {
        console.log('User accepted in German');
        // Save consent preference
    },
    onDecline: () => {
        console.log('User declined');
        // Handle decline
    }
});

consent.show();
```

### HTML Title with Custom Styling
```javascript
const consent = ConsentModule.create('consent-container', {
    title: '<span style="color: #C172F5">Epic</span><span style="color: #9746C8">Play</span> <span style="color: #614483">Central</span>',
    benefitText: 'To unlock all videos',
    backgroundColor: '#EAE6F6',
    borderColor: '#AA99EC',
    acceptTextColor: '#000000',
    declineTextColor: '#000000',
    onAccept: () => {
        console.log('User accepted with styled title');
    }
});

consent.show();
```

### Simple Opt-out Mode
```javascript
const consent = ConsentModule.create('consent-container', {
    language: 'fr',
    simpleOptOut: true,
    onAccept: () => console.log('Opt-in selected'),
    onDecline: () => console.log('Opt-out selected')
});

// Show with current status
consent.show('enabled');

// Show notification
consent.showNotification(10000);
```

### Custom Button Images
```javascript
const consent = ConsentModule.create('consent-container', {
    acceptButton: 'img/custom-accept.png',
    declineButton: 'img/custom-decline.png',
    acceptButtonText: 'Yes, I Agree',  // Used as alt text for images
    declineButtonText: 'No Thanks'     // Used as alt text for images
});
```

## Architecture

### File Structure
```
src/
├── engine/
│   ├── index.js          # Template manager (main export)
│   ├── i18n.js          # Internationalization system
│   └── translations.js   # Language imports and mapping
├── templates/
│   ├── main.handlebars
│   ├── consent-body.handlebars
│   ├── buttons.handlebars
│   ├── footer.handlebars
│   └── simple-opt-out.handlebars
├── locales/
│   ├── en_US.json
│   ├── es_ES.json
│   └── ... (13 languages total)
├── css/
│   └── styles.css
├── img/
│   └── qr.png
└── consent.js           # Main consent module
```

### Key Components
1. **Template Manager**: Handles Handlebars template compilation and rendering
2. **i18n System**: Manages translations with reverse lookup capabilities
3. **Consent Module**: Main interface for creating and managing consent dialogs

## Browser Support
- Modern browsers with ES6+ support
- Keyboard navigation compatible with TV platforms
- Touch and click interactions for mobile/desktop

## License
This module is licensed under [MIT License](https://opensource.org/licenses/MIT).

