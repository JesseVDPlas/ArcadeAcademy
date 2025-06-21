# 🕹️ ArcadeAcademy

Welcome to ArcadeAcademy, a retro-themed gamified learning application designed to make studying fun! This app turns standard quizzes into an engaging arcade experience, complete with XP, lives, and a pixel-art aesthetic.

## 🚀 About The Project

ArcadeAcademy is an [Expo](https://expo.dev) project that helps students practice their knowledge across various subjects. After a personalized onboarding process, users are greeted with a dashboard showing their progress and can jump straight into a quiz. The goal is to answer questions correctly, earn XP, and complete levels, all within a nostalgic, game-like environment.

### ✨ Key Features

- **Gamified Quizzes:** Answer questions to earn XP and track your high score.
- **Personalized Onboarding:** The app tailors content based on the user's name, grade, and preferred subjects.
- **Player Dashboard:** A central home screen displays a welcome message, current lives, and an XP progress bar.
- **Retro UI/UX:** A consistent arcade-style design, featuring the "Press Start 2P" pixel font and neon colors.
- **Persistent State:** User progress is saved locally on the device.

### 🛠️ Built With

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) & [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for animations.
- `AsyncStorage` for data persistence.

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm installed.
- An Android/iOS emulator or a physical device with the Expo Go app.

### Installation

1. Install NPM packages:
   ```bash
   npm install
   ```

### Running the App

1. Start the Metro bundler:
   ```bash
   npx expo start
   ```
2. Follow the instructions in the terminal to open the app on your preferred platform (iOS Simulator, Android Emulator, or Expo Go on your phone).

---

## 📂 Project Structure

The project follows a standard Expo Router structure:

```
.
├── app/              # All screens and navigation logic
│   ├── (tabs)/       # Layout and screens for the main tab navigator
│   └── onboarding/   # Screens for the initial user setup flow
├── assets/           # Fonts, images, and static data (e.g., quiz JSON)
├── components/       # Shared, reusable UI components (Buttons, Bars, etc.)
├── constants/        # Application-wide constants
├── contexts/         # Global state management (UserContext, QuizContext)
└── theme/            # Global styling (colors, fonts, spacing)
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```