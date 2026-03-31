# AllisWell - Emergency Response System

A modern emergency response application built with React, TypeScript, and Tailwind CSS.

## Features

### 🚨 Emergency SOS
- One-tap SOS button for immediate help
- Automatic crash detection with 20-second countdown
- Real-time helper coordination and ETA tracking

### 👥 Volunteer System
- Join as a volunteer to help others in emergencies
- Location-based volunteer matching
- Increased helper response during SOS triggers

### 👤 Profile Management
- Comprehensive emergency profile setup
- Medical information storage (blood group, allergies, emergency contacts)
- View-only profile screen for quick reference

### 🗺️ Live Mapping
- Real-time incident tracking
- Volunteer location sharing
- Emergency service coordination

### 📰 Incident Feed
- Community incident reporting
- Real-time traffic and accident data
- False report verification system

### 🌙 Dark Theme
- Modern black theme for better visibility
- Optimized for emergency situations

## Database Integration

The app includes a local database service using localStorage for data persistence. For production use, integrate with a backend database service like:
- Firebase Firestore
- Supabase
- MongoDB with Express.js
- PostgreSQL

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context
- **Routing**: React Router
- **Maps**: Leaflet
- **Icons**: Lucide React
