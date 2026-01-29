# Classifieds App Base

## 1. Project Overview
This repository contains a full-stack, multi-platform Classifieds Application ecosystem. It allows users to browse and post classified ads across both web and mobile platforms, sharing a unified backend and database.

The project is structured as a monorepo containing three distinct services:
1.  **Web Portal:** A modern web application for desktop/mobile browsers.
2.  **Mobile App:** A native iOS/Android application.
3.  **Server:** A dedicated backend service handling API requests, email notifications, and AI integration (MCP).

## 2. Tech Stack

### **Web Frontend (`classifieds-web`)**
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS / PostCSS
* **Backend Integration:** Supabase (Auth & Database)

### **Mobile Frontend (`classifieds-client`)**
* **Framework:** React Native (via Expo)
* **Language:** JavaScript/TypeScript
* **Navigation:** Expo Router / React Navigation
* **Backend Integration:** Supabase

### **Backend (`classifieds-server`)**
* **Runtime:** Node.js
* **Features:** Custom Server logic, Email Service, MCP (Model Context Protocol) Server implementation.

---

## 3. Project Structure

```text
Classifieds_App_Base/
├── classifieds-web/        # Next.js Web Application
│   ├── app/                # App Router Pages
│   ├── public/             # Static Assets
│   ├── supabase.js         # Supabase Client Config
│   └── next.config.ts      # Next.js Configuration
│
├── classifieds-client/     # Expo Mobile Application
│   ├── app/                # Mobile Screens
│   ├── components/         # React Native Components
│   ├── assets/             # Images/Fonts
│   └── App.js              # Entry Point
│
├── classifieds-server/     # Backend Services
│   ├── mcp-server.mjs      # MCP Server Implementation
│   └── server.js           # Main Node Server
│
└── README.md               # Documentation
```

## 4. Setup & Installation

    Prerequisites : 
        Node.js (v18+ recommended)
        npm or yarn
        Expo Go app on your phone (for mobile testing)

    Supabase Account (for Database & Auth)

    1. Clone the Repository

        git clone https://github.com/https-dhanesh/Classifieds_App_Base.git
        cd Classifieds_App_Base

    2. Setup Web App (Next.js)

        cd classifieds-web
        npm install

        Create a .env.local file and add your keys
        EXPO_PUBLIC_SUPABASE_URL=your_url
        EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
        ANTHROPIC_API_KEY=your_api_key

        npm run dev
        Access the web app at http://localhost:3000

    3. Setup Mobile App (Expo)

        cd ../classifieds-client
        npm install

        Create a .env.local file and add your keys
        NEXT_PUBLIC_SUPABASE_URL=your_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

        Ensure supabase.js has your credentials

        npx expo start
        Scan the QR code with the Expo Go app on your phone to run.

    4. Setup Backend Server
   
        cd ../classifieds-server
        npm install


        Create a .env file in the classifieds-server root with the following keys:
            PORT=3000
            SUPABASE_URL=your_supabase_project_url
            SUPABASE_KEY=your_supabase_anon_key
            EMAIL_USER=your_email@gmail.com
            EMAIL_PASS=your_app_password
        
        node server.js
