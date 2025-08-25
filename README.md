# Holy Ghost Tracker

A React Native Expo app designed to help members of The Church of Jesus Christ of Latter-day Saints track and remember their spiritual impressions and experiences with the Holy Ghost.

## Features

### 🏠 Home/Dashboard

- View your last spiritual impression with date and time
- Real-time stopwatch showing time elapsed since your last impression
- Quick form to add new spiritual impressions with description and timestamp

### 🕊️ All Impressions

- Scrollable list of all recorded spiritual impressions
- Tap any impression to edit or delete it
- Beautifully designed cards with rounded corners for easy reading

### 👤 Profile

- User profile with dummy data (John Doe)
- Notification preferences with toggle on/off
- Customizable reminder intervals (1 day, 3 days, 1 week, 2 weeks, 1 month)
- Motivational notifications when you haven't recorded impressions

## Getting Started

### Prerequisites

- Node.js (14 or later)
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Clone or navigate to the project directory:

   ```bash
   cd holy-ghost-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Use the Expo Go app on your phone or run on simulator:
   - **iOS**: Press `i` to open iOS simulator
   - **Android**: Press `a` to open Android emulator
   - **Web**: Press `w` to open in web browser

## Technology Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for bottom tab navigation
- **AsyncStorage** for local data persistence
- **Expo Notifications** for reminder notifications

## Data Storage

The app uses AsyncStorage to store:

- Spiritual impressions with CRUD operations
- User profile and notification preferences
- All data is stored locally on the device

## Notification Features

- Customizable reminder intervals
- Motivational messages to encourage spiritual reflection
- Permission-based notifications (user must grant permission)
- Automatic scheduling based on user preferences

## Code Organization

```
src/
├── types/          # TypeScript type definitions
├── utils/          # Utility functions for storage, time, and notifications
├── screens/        # Main app screens (Home, All Impressions, Profile)
└── components/     # Reusable components (currently none, but ready for expansion)
```

## Features Implemented

✅ Bottom tab navigation with Home, All Impressions, and Profile tabs  
✅ Real-time stopwatch tracking time since last impression  
✅ CRUD operations for spiritual impressions  
✅ Aesthetic UI with rounded corners and clean design  
✅ Edit and delete functionality for impressions  
✅ Notification preferences with multiple interval options  
✅ AsyncStorage for data persistence  
✅ TypeScript for type safety  
✅ Motivational notification messages

## Future Enhancements

- Data export/backup functionality
- Search and filter impressions
- Statistics and insights
- Customizable notification messages
- Dark mode support

## License

This project is intended for personal use by members of The Church of Jesus Christ of Latter-day Saints.
