# 🗡️ SkillCheck

SkillCheck is a gamified learning platform designed to teach programming languages through interactive, RPG-style "boss battles." Test your knowledge, drain enemy HP with correct answers, and level up your coding skills!

---

## 📋 System Requirements
To run this project locally, ensure the host machine has the following installed:
1. **[Node.js](https://nodejs.org/)** (LTS version recommended)
2. **Wi-Fi Connection** (The host PC and mobile device must be on the same network)
3. **Expo Go App** installed on your mobile testing device:
   * [Expo Go for iOS](https://apps.apple.com/us/app/expo-go/id982107779)
   * [Expo Go for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🚀 How to Play

There are two ways to experience SkillCheck. For the absolute best performance, animations, and native feel, **Self-Hosting via Expo Go is highly recommended.**

### Option A: Self-Hosting (Recommended)
Running the app locally on your own device ensures smooth 60fps animations and a true mobile experience. We have included an automated script to make this entirely painless.

**Setup Instructions:**
1. Ensure the `start_skillcheck.bat` file is located in the same folder.
2. Double-click `start_skillcheck.bat`. 
   > *This script will automatically install all necessary dependencies, ensure Expo package compatibility, and boot up the local server.*
3. Once the server starts, a large QR code will appear in your terminal.
4. Open the **Expo Go** app on your phone (or use your iOS Camera) and scan the QR code to jump straight into the battle!

### Option B: Web Hosted (Alternative)
If you don't want to install anything and just want a quick look at the app, you can view the web-compiled version here:

🌐 **[skillcheck-smoky.vercel.app](https://skillcheck-smoky.vercel.app)**

*Note: Because SkillCheck is built natively for mobile devices, the web version may have slight layout differences or less fluid animations compared to the Expo Go experience.*

---

## 🛠️ Tech Stack
* **Frontend:** React Native, Expo
* **Styling:** Custom CSS/StyleSheets with immersive fantasy UI
* **Backend/Auth:** Supabase
* **AI Integration:** Google Gemini (for dynamic quiz generation)

---

## 📝 Notes for Developers
If you are manually setting up the environment without the `.bat` file:
1. Navigate into the project directory: `cd skillcheck`
2. Install dependencies: `npm install`
3. Align Expo packages: `npx expo install --fix`
4. Start the server: `npx expo start`
