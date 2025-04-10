# LMSWA - LM Studio Web Front-End for mobile devices

## Disclaimer

This is a fork and 99.9% of all work was done by [techcow2](https://github.com/techcow2). I was in need of talking to my local LM Studio via my phone and found [the original repository](https://github.com/techcow2/lmsa) which I've expanded by essentially wrapping a webserver around the source code to serve it via HTTP to make it available in my iPhone's web browser.

## Table of Contents

- [Overview](#overview)  
- [Quick Tutorial Video](#quick-tutorial-video)  
- [Updates](#updates)  
- [Features](#features)  
- [Requirements](#requirements)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Configuration](#configuration)  
- [Contributing](#contributing)  
- [Disclaimer](#disclaimer)  
- [License](#license)  

<div style="display: flex; justify-content: space-between; gap: 10px;">  
    <img src="https://github.com/user-attachments/assets/b3640a20-a180-4a37-94ae-53c6020ca03b" alt="Google Pixel 4 XL Screenshot 0" style="width: 22%; height: auto;">  
    <img src="https://github.com/user-attachments/assets/dd665c56-4639-440d-8826-eb0813117304" alt="Google Pixel 4 XL Screenshot 2" style="width: 22%; height: auto;">  
    <img src="https://github.com/user-attachments/assets/23b6236b-980e-443c-afc9-b974029bcc8a" alt="Google Pixel 4 XL Screenshot 3" style="width: 22%; height: auto;">  
    <img src="https://github.com/user-attachments/assets/85e275f3-62fa-4143-9fa2-1cade83031c5" alt="Google Pixel 4 XL Screenshot 1" style="width: 22%; height: auto;">  
</div>  

## Overview

LMSWA (LM Studio Web Assistant) is an open-source web front-end application for LM Studio. It provides a clean, user-friendly interface to interact with language models on your Android device. LMWSA is designed with privacy in mind, offering a tracking-free and ad-free experience for users who want to leverage the power of large language models on their mobile devices.

## Quick Tutorial Video

For a step-by-step guide on how to set up and use LMWSA with LM Studio, check out this quick tutorial on YouTube: 
[![Watch the video](https://img.youtube.com/vi/qoXfa6In5BM/0.jpg)](https://youtu.be/qoXfa6In5BM)

(It shows the usage of the original Android app, however apart from the initial setup, the usage is identical to the web app)

## Updates

### 🚀 Latest Features & Improvements

- **Enhanced Server Settings Input**: IP and port fields are now separated for easier configuration.  
- **Help Menu Added**: Quickly access guidance and support directly within the app.  
- **DeepSeek Integration**: Support for DeepSeek models is now included.  
- **Clear All Chats Button**: Easily reset conversations with a single tap.  
- **Improved Slide Menu**: Smoother navigation and enhanced usability.  
- **New About Menu**: Get detailed app information conveniently in one place.  

Stay tuned for more updates and improvements!

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

## Requirements

Before using LMWSA, ensure that the following requirements are met:

- **NodeJS**: You'll need to install a recent version of NodeJS on the computer you want to serve this from
- **LM Studio**: LM Studio must be installed and running on a network-accessible computer.  
- **Network Configuration**:  
  - CORS (Cross-Origin Resource Sharing) must be enabled in LM Studio settings to allow cross-origin requests from LMSA.

## Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/CodeF0x/lmwsa.git
   ```
2. Install dependencies: `npm install`


## Usage

1. **Run LM Studio**: Start LM Studio on your computer.  
2. **Enable Server**: Run the server within LM Studio.  
3. **Load Model**: Load the model of your choice in LM Studio.  
4. **Network Configuration**:  
   - Ensure CORS and network sharing are enabled in LM Studio settings.  
5. **Copy IP Address**: Find and copy the IP address of your computer.  
6. **Connect LMWSA to LM Studio**:  
   - Open your phone's web browser.
   - In the URL bar, type `http://<your computer's ip>:3000` and then submit
   - Navigate to the Settings menu in LMWSA.  
   - Enter the copied IP address in the designated field.  
   - Tap 'Close' to save the settings.  
7. **Interact with the Model**: Start interacting with the AI model through LMWSA's clean interface.

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

## Contributing

We welcome contributions to LMWSA! If you'd like to contribute, please follow these steps:

1. Fork the repository.  
2. Create a new branch for your feature or bug fix.  
3. Make your changes and commit them with clear, descriptive messages.  
4. Push your changes to your fork.  
5. Submit a pull request to the main repository.

## Disclaimer

LMWSA is a third-party application and is not affiliated with LM Studio or its developers. This app is independently developed to provide a web front-end interface for interacting with LM Studio. Use of this app is at your own discretion, and the developers of LMSWA are not responsible for any issues arising from its use.

## License

LMWSA is released under the [MIT License](LICENSE.md). Feel free to use, modify, and distribute the code as per the license terms.
