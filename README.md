# External Consent for BrightSDK Apps

## Overview
**External Consent for BrightSDK Apps** is a JavaScript module that provides a customizable consent dialog for applications integrating with BrightSDK. It allows users to grant or deny consent through a user-friendly interface.

## Installation
Include the module in your project:
```javascript
import ConsentModule from 'path-to-module';
```

## Usage
To create and display the consent dialog:
```javascript
const consent = ConsentModule.create('target-element-id', {
    logo: 'img/custom-logo.png',
    backgroundColor: '#FFFFFF',
    acceptButtonText: 'Agree',
    declineButtonText: 'No Thanks',
    onAccept: () => console.log('User accepted consent'),
    onDecline: () => console.log('User declined consent')
});

consent.show();
```

## API Reference

### `ConsentModule.create(targetId, options)`
Creates a new consent dialog instance.

#### Parameters
- `targetId` (string, required) - ID of the DOM element where the dialog will be placed.
- `options` (object, optional) - Customization options for the consent dialog.

#### Options
- `logo` (string) - URL of the logo image.
- `qrCode` (string) - URL of a QR code image.
- `title` (string) - Title text of the dialog.
- `backgroundColor` (string) - Background color of the dialog.
- `accentColor` (string) - Accent color for buttons and highlights.
- `acceptButtonText` (string) - Text for the accept button.
- `declineButtonText` (string) - Text for the decline button.
- `onShow` (function) - Callback when the dialog is shown.
- `onAccept` (function) - Callback when the user accepts consent.
- `onDecline` (function) - Callback when the user declines consent.
- `onClose` (function) - Callback when the dialog is closed.

### Methods

#### `show()`
Displays the consent dialog and returns a promise that resolves when the dialog is closed.
```javascript
consent.show().then(() => console.log('Consent dialog closed'));
```

#### `hide()`
Manually hides the consent dialog.
```javascript
consent.hide();
```

## Events
- `onShow`: Triggered when the dialog appears.
- `onAccept`: Triggered when the user accepts.
- `onDecline`: Triggered when the user declines.
- `onClose`: Triggered when the dialog is closed.

## Example
```javascript
const consent = ConsentModule.create('consent-container', {
    title: 'User Agreement',
    backgroundColor: '#EEE',
    onAccept: () => alert('Thank you for accepting!'),
    onDecline: () => alert('You declined the consent.')
});

consent.show();
```

## License
This module is licensed under [MIT License](https://opensource.org/licenses/MIT).

