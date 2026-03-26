# 🍱 ApnaCart: The AI-Powered Merchant Ecosystem

<p align="center">
  <img src="https://raw.githubusercontent.com/vipultikhe234/FoodHub/main/docs/hero.png" alt="ApnaCart Hero Mockup">
</p>

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18/19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![AI-Powered](https://img.shields.io/badge/AI-Production_Studio-orange?style=for-the-badge)](https://openai.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Financial_Flow-blueviolet?style=for-the-badge&logo=stripe)](https://stripe.com/)

**ApnaCart** is a premium, full-stack, AI-driven food delivery ecosystem designed to modernize the bridge between local merchants and the digital marketplace. Moving beyond traditional e-commerce, this platform integrates operational efficiency with creative intelligence, providing a "Production Studio" experience for food businesses. Currently upgraded with a **Premium E-Commerce UX**, featuring cinematic gradients, glassmorphism, and seamless transactional workflows.

---

## ⚡ Recent Evolutionary Updates (V1.2)

### 📍 Location-Aware Merchant Discovery
*   **Localized Ecosystem**: Integrated the **Location Master** module into the mobile experience, allowing users to filter restaurants based on their specific delivery area (e.g., Pune, Mumbai). 
*   **Global Visibility**: Seamlessly toggle between all active merchants or narrowed, city-specific listings to improve discovery efficiency.

### 🛒 Single-Source Logistics Enforcment
*   **Operational Validation**: Implemented strict `restaurant_id` consistency in the `CartContext`. Users can no longer mix items from different restaurants, ensuring clean order processing for riders.
*   **Intelligent Prompting**: Added a premium modal that offers users the choice to clear their existing cart or cancel when switching between different merchant menus.

### 🔗 Merchant-Centric Navigation
*   **Direct Attribution**: Added "Merchant Info" bridges on product detail pages, enabling users to explore a restaurant's full catalogue with a single tap.

---

> [!IMPORTANT]
> **Project Standards & Detailed Requirements**: For the full architectural specifications, role-based onboarding rules, and MNC-style folder standards, please refer to the [REQUIREMENTS.md](file:///d:/Projects/Mobile%20Project/Food%20Delivery%20Project/REQUIREMENTS.md) file in the root directory.

---

## 🏗️ System Architecture

ApnaCart utilizes a robust **Monolithic Service Pattern** for maximum development speed and data integrity, supported by high-performance frontend interfaces.

```mermaid
graph TD
    UserApp[React Mobile App] -->|REST API| Backend[Laravel API Engine]
    RiderApp[React Rider App] -->|REST API| Backend
    AdminPanel[React Admin Studio] -->|REST API| Backend
    Backend -->|Store/Retrieve| DB[(MySQL)]
    Backend -->|Process| Stripe[Stripe Payment Gateway]
    
    subgraph AI Creative Engine
        Backend -->|Prompt| Gemini[Naming & Copywriting AI]
        Backend -->|Visual| Imagery[AI Food Photography]
    end
    
    subgraph Distribution Hub
        Backend -->|Bundle Data| Swiggy[Swiggy Merchant Panel]
        Backend -->|Bundle Data| Zomato[Zomato Merchant Panel]
    end
```

---

## 🚀 Key Features

### 🎨 Premium User Experience (UX/UI)
*   **High-Fidelity Interface**: Completely redesigned app and admin panel featuring glassmorphism, cinematic gradients, and a bespoke typography system (`Outfit`).
*   **Micro-Interactions**: Smooth, gesture-driven animations powered by `Framer Motion` across navigation, carts, and product cards.
*   **Dynamic Cart & Checkout**: Robust cart tracking, coupon application, and tax calculation presented in a visually stunning floating checkout layout.

### 🤖 AI Merchant Production Studio
*   **AI Naming Wizard**: Transforms simple keywords into creative, high-converting culinary dish names.
*   **Sensory Copywriting**: Automatically generates professional, SEO-optimized product descriptions focusing on flavor profiles and ingredients.
*   **AI Food Photography**: Concept-aware image generation that produces 8k, restaurant-grade visuals based on product descriptions.

### 📦 Multi-Platform Distribution Hub
*   **Platform-Ready Bundling**: Instant data formatting and clipboard synchronization for **Swiggy** and **Zomato** merchant panels.
*   **Unified Inventory**: Manage your catalog in one place and sync visuals and metadata across all external delivery platforms.

### 📊 Intelligence Dashboard
*   **Live Statistics**: Real-time tracking of Revenue, Volumes, and Operational Visibility.
*   **Smart Inventory Monitoring**: Automated tracking of "Low Stock" items with category-based filtering for high-speed management.

### 💳 Secure Financial Flow
*   **Hybrid Payment Gateway**: Complete integration with Stripe for Credit Cards and native Support for Cash on Delivery (COD).
*   **Admin-Initiated Payments**: Securely convert COD orders to online transactions directly from the admin panel to minimize delivery risk.
*   **Independent Rider Ecosystem**: Standalone Rider Application with real-time GPS tracking, mission management, and earnings analytics.

---

## 🛠️ Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | Laravel 12 (PHP) | Professional Service-Layer, Order Processing & API Engine |
| **Frontend** | React + Vite | High-Fidelity, Gesture-Driven Mobile and Web Interfaces |
| **AI Integration** | Generative AI | Naming, Copywriting, and Imagery Automation |
| **Payments** | Stripe | Secure Multi-Channel Transaction Flow |
| **Design System** | TailwindCSS + Framer Motion | Premium Glassmorphism, Cinematic Colors & Micro-animations |
| **Database** | MySQL | Atomic Data Synchronization & Order State Management |

---

## 🏁 Getting Started

### 1. Prerequisites
*   **PHP 8.2+** & **Composer**
*   **Node.js 18+** & **npm**
*   **MySQL** Database

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

### 3. Frontend Setup (Admin & Mobile)
```bash
# For Admin Panel
cd admin
npm install
npm run dev

# For Mobile App
cd mobile
npm install
npm run dev

# For Rider App
cd rider
npm install
npm run dev
```

---

## 🔒 Security Configuration
The project utilizes environment variables for sensitive API keys. Ensure the following are configured in your `backend/.env`:
*   `STRIPE_KEY` & `STRIPE_SECRET`: Integration with the payment gateway.
*   `GEMINI_API_KEY` (or chosen AI Provider): Powering the creative content studio.

---

## 📂 Project Structure
```text
.
├── admin/               # React Admin Dashboard (Vite)
├── mobile/              # React Mobile Customer App
├── rider/               # React Standalone Rider App
├── backend/             # Laravel API & Business Logic
├── docker/              # Containerization services
└── README.md            # You are here
```

---

Developed with ❤️ by **[Vipul Tikhe](https://github.com/vipultikhe234)**
