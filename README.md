# **BAMX Mobile Application**
> *Streamline Guadalajara Food Bank's inventory management and operations.*

## **Introduction**
The BAMX Mobile Application assists Banco de Alimentos Guadalajara (BAMX) with efficient inventory management and real-time updates. This app reduces human error in tracking resources, enabling faster and more accurate food distribution to communities in need.

## **Project Description**
- **Main Functionality:** Manage inventory through real-time product tracking, entry/exit recording, and alerts for low stock.
- **Technologies Used:** React Native, Firebase, Expo, Jest (testing), Figma (UI/UX).
- **Challenges:** Handling large volumes of data, integrating real-time updates, and balancing an accessible user interface for staff, volunteers, and administrators.
- **Future Improvements:** Incorporate analytics, additional user management, and push notifications for alerts.

## **Table of Contents**
1. [Introduction](#introduction)
2. [Project Description](#project-description)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Additional Documentation](#additional-documentation)
6. [License](#license)

## **Installation**
1. **Prerequisites**:
   - **Node.js** - [Download Node.js](https://nodejs.org/)
   - **Expo CLI** - Install via `npm install -g expo-cli`
   - **Android Studio** - [Download Android Studio](https://developer.android.com/studio) (optional for using an Android Virtual Device)
   - **Firebase Account** - [Firebase Setup](https://firebase.google.com/)

2. **Clone the repository:**
   ```bash
   git clone https://github.com/ivmg5/BAMX-Mobile-App.git
   cd BAMX-Mobile-App
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the app:**
   - **With Physical Device**: Run the app on your mobile device with the Expo Go app:
     ```bash
     expo start
     ```
   - **With Android Virtual Device (AVD)**:
     - Open **Android Studio**, go to **AVD Manager**, and start a virtual device.
     - In your project directory, use:
       ```bash
       expo start --android
       ```
     This will launch the app on the Android emulator.

### **Configuration Options**
- Set environment variables in a `.env` file for Firebase configuration, API URLs, and debug options.

## **Usage**
1. **User Authentication:**
   - Log in or create an account via the authentication screen.
2. **Inventory Management:**
   - Register product entries and exits, and view current inventory levels by category.
3. **Report Generation:**
   - Generate reports for a selected date range and download as text files.

**Example code usage:**
```javascript
// Example of recording a product entry
recordProductEntry({ productId: '123', quantity: 10, donorId: 'xyz' });
```

## **Additional Documentation**
Refer to `Documentation.pdf` in the repository for an in-depth view of all features, architecture, and configurations.

## **License**
This project is licensed under the MIT License.

---

### **Status Badges**
[![Build Status](https://img.shields.io/badge/status-active-brightgreen)](#)
[![Code Coverage](https://img.shields.io/badge/coverage-80%25-yellowgreen)](#)
