# LMSA - LM Studio Android Front-End

# Table of Contents

- [Overview](#overview)
- [Quick Tutorial Video](#quick-tutorial-video)
- [Latest Improvements](#latest-improvements)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

<div style="display: flex; justify-content: space-between; gap: 10px;"> <img src="https://github.com/user-attachments/assets/b3640a20-a180-4a37-94ae-53c6020ca03b" alt="Google Pixel 4 XL Screenshot 0" style="width: 22%; height: auto;"> <img src="https://github.com/user-attachments/assets/dd665c56-4639-440d-8826-eb0813117304" alt="Google Pixel 4 XL Screenshot 2" style="width: 22%; height: auto;"> <img src="https://github.com/user-attachments/assets/23b6236b-980e-443c-afc9-b974029bcc8a" alt="Google Pixel 4 XL Screenshot 3" style="width: 22%; height: auto;"> <img src="https://github.com/user-attachments/assets/85e275f3-62fa-4143-9fa2-1cade83031c5" alt="Google Pixel 4 XL Screenshot 1" style="width: 22%; height: auto;"> </div>

## Now Available in the Google Play Store!

| | |
|:---:|:---|
| [<img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" style="width: 200px; height: auto;">](https://play.google.com/store/apps/details?id=com.lmsa.app) | LMSA is now available for download on the Google Play Store with exciting new features |

## Latest Improvements

- **Improved Reasoning Model Integration**: Enhanced interaction with various reasoning models
- **File Upload Support**: Chat with your documents right from your Android device!  
- **Refreshed User Interface**: Completely revamped UI for better usability  
- **Instructional Video Guide**: New helpful video tutorial for getting started  
- **Model Information Toggle**: Added ability to show/hide loaded model information  
- **App Refresh Capability**: Easily refresh the entire app to load a different model after changes on the computer  
- **Enhanced Sidebar**: Upgraded side bar UI for improved navigation  
- **Tablet Support**: Optimized interface for tablet devices  
- **Improved Reasoning Model Integration**: Enhanced interaction with various reasoning models  
- **Refreshed User Interface**: Completely revamped UI for better usability  
- **Instructional Video Guide**: New helpful video tutorial for getting started  
- **Model Information Toggle**: Added ability to show/hide loaded model information  
- **App Refresh Capability**: Easily refresh the entire app to load a different model after changes on the computer  
- **Enhanced Sidebar**: Upgraded side bar UI for improved navigation  
- **Tablet Support**: Optimized interface for tablet devices

---

## Overview

LMSA (LM Studio Assistant) is an open-source Android front-end application for LM Studio. It provides a clean, user-friendly interface to interact with language models on your Android device. LMSA is designed with privacy in mind, offering a tracking-free and ad-free experience for users who want to leverage the power of large language models on their mobile devices.

## Quick Tutorial Video

[![Watch the video](https://img.youtube.com/vi/qoXfa6In5BM/0.jpg)](https://www.youtube.com/watch?v=qoXfa6In5BM)

---

## Features

### 🔒 Privacy-Focused

- **No Tracking**: Your data and interactions remain private.  
- **Ad-Free**: Enjoy a clean, distraction-free experience.  

### 💬 Customizable Interactions

- **System Prompt**: Set and modify the system prompt to guide your AI interactions.  
- **Adjustable Temperature**: Fine-tune the LLM's creativity directly from your device.  

### 📱 User-Friendly Interface

- **Clean Design**: Intuitive and minimalistic UI for effortless navigation.  
- **Model Display**: Easily view the currently loaded language model on your device.  

### 🛠 Technical Highlights

- **Open Source**: Transparent codebase, open for community contributions and audits.  
- **LM Studio Integration**: Seamless connection with LM Studio's powerful language model capabilities.

---

## Requirements

Before using LMSA, ensure that the following requirements are met:

- **Android Device**: You must have a device running Android 7.0 (Nougat) or higher.  
- **LM Studio**: LM Studio must be installed and running on a network-accessible computer.  
- **Network Configuration**:  
  - CORS (Cross-Origin Resource Sharing) must be enabled in LM Studio settings to allow cross-origin requests from LMSA.

---

## Installation

To set up the LMSA application on your development environment:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/techcow2/lmsa.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd lmsa
   ```

3. **Set up the web application**:
   - The project consists of HTML, CSS, and JavaScript files
   - Main files include:
     - `index.html` - The main application interface
     - `styles.css` - Styling for the application
     - `app.js` - Core application logic
     - `reasoning.js` - AI interaction handling
     - `delete-all-chats.js` - Chat management functionality
     - `empty-message-modal.js` - UI components
     - `help.js` - Help documentation
     - `about.js` - About page information

4. **Testing locally**:
   - Open `index.html` in a web browser to test the application
   - Alternatively, use a local web server:
     ```bash
     # Using Python's built-in HTTP server
     python -m http.server
     ```

5. **Building for Android**:
   - Use a WebView wrapper or framework like Cordova/PhoneGap to package the web application for Android
   - Follow the framework's documentation for specific build instructions

## Google Play Store Availability

Now available on the Google Play Store for easy installation on Android devices.

[<img src="https://i.ibb.co/qH7rhGz/google-play-icon-transparent-5.png" alt="Get it on Google Play" style="width: 200px; height: auto; display: block; margin: 0 auto;">](https://play.google.com/store/apps/details?id=com.lmsa.app)

- **Supported Devices**: Android 6.0 and higher
- **Features**: The Google Play version includes all functionality of the web application plus additional mobile-optimized features
- **Updates**: The app will receive regular updates through the Play Store

---

## Usage

1. **Run LM Studio**: Start LM Studio on your computer.  
2. **Enable Server**: Run the server within LM Studio.  
3. **Load Model**: Load the model of your choice in LM Studio.  
4. **Network Configuration**:  
   - Ensure CORS and network sharing are enabled in LM Studio settings.  
5. **Copy IP Address**: Find and copy the IP address of your computer.  
6. **Connect LMSA to LM Studio**:  
   - Launch the LMSA app on your Android device.  
   - Navigate to the Settings menu in LMSA.  
   - Enter the copied IP address in the designated field.  
   - Tap 'Close' to save the settings.  
7. **Interact with the Model**: Start interacting with the AI model through LMSA's clean interface.

---

## Configuration

### Setting the System Prompt

1. Navigate to the Settings menu.  
2. Find the "System Prompt" section.  
3. Enter your desired system prompt to guide the AI's behavior.

### Adjusting LLM Temperature

1. During a conversation, locate the temperature slider.  
2. Adjust the slider to increase (more creative) or decrease (more focused) the temperature.

### Viewing Loaded Model

The currently loaded model will be displayed at the top of the main interface.

---

## Contributing

We welcome contributions to LMSA! If you'd like to contribute, please follow these steps:

1. Fork the repository.  
2. Create a new branch for your feature or bug fix.  
3. Make your changes and commit them with clear, descriptive messages.  
4. Push your changes to your fork.  
5. Submit a pull request to the main repository.

---

## Disclaimer

LMSA is a third-party application and is not affiliated with LM Studio or its developers. This app is independently developed to provide an Android front-end interface for interacting with LM Studio. Use of this app is at your own discretion, and the developers of LMSA are not responsible for any issues arising from its use.

---

## License

LMSA is released under the [MIT License](LICENSE.md). Feel free to use, modify, and distribute the code as per the license terms
