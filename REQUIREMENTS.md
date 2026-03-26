# ApnaCart Project Requirements & Enterprise Architecture

This document serves as the single source of truth for the **ApnaCart** hyperlocal quick-commerce ecosystem, detailing both functional requirements and the high-level technical architecture.

## 1. Core Functional Requirements

### 1.1 Multi-Role User Ecosystem
The system supports four distinct user roles, all managed within a unified `users` table for efficient identity management:
- **Super Admin**: Full platform visibility, global analytics, and merchant/rider provisioning.
- **Merchant**: Manages store profile, inventory (products/categories), orders, and their specific rider fleet.
- **Rider**: Dedicated logistics force. This role is strictly separated from the customer application.
- **Customer**: End-users who browse, order, and track deliveries.

### 1.2 Decentralized Rider Onboarding
To ensure scalability, the onboarding process is multi-tenant and role-aware:
- **Admin Onboarding**: Admins can onboard riders and assign them to any registered merchant node.
- **Merchant Onboarding**: Merchants can onboard riders specifically for their own store, ensuring they only manage their local delivery fleet.
- **Self-Registration**: Riders can initiate registration, but must be "Ready" (is_ready: true) and assigned to a merchant before entering the logistics grid.

### 1.3 Application Separation
- **User/Customer App**: Focused entirely on browsing, ordering, and tracking. No rider-specific functionality is included.
- **Rider App**: A completely separate application environment dedicated to logistics, accept/reject workflows, and real-time location telemetry.
- **Admin/Merchant Dashboard**: A unified management console with role-based routing (RBAC) to separate global administration from local store management.

---

## 2. Technical Architecture (MNC-Style Domain Driven)

The backend has been refactored into a **Modular Monolith** with a professional, decoupled folder structure.

### 2.1 Backend Domain Structure (`app/Http/Controllers` & `app/Services`)

| Domain | Responsibility | Key Components |
| :--- | :--- | :--- |
| **Identity** | IAM, Profiles, & Security | Auth, Onboarding, FCM Tokens, User Addresses |
| **Inventory** | Catalogue & Asset Management | Products, Categories, Media Uploads |
| **Operations** | Transactions & Fulfilment | Order Orchestration, Coupons, Payment Webhooks |
| **Logistics** | Fleet & Dispatch | Rider Management, Location Tracking, Staff Listing |
| **Analytics** | Reporting & Business Intelligence | Dashboard Statistics, Revenue Flow |
| **Management** | Structural Configuration | Restaurant/Merchant Node Management |
| **Gateways** | External Service Integration | Stripe Payments, Notification Providers |

### 2.2 Communication Patterns
- **Services**: All business logic is strictly housed in domain-specific services. Controllers act as thin entry points.
- **Cross-Domain Safety**: Domains communicate via well-defined service interfaces to prevent circular dependencies (e.g., Order Service identifies customers via the Identity domain).
- **Real-time Telemetry**: Manual Leaflet integration in the frontend ensures high-performance logistics monitoring without the overhead of heavy framework wrappers.

---

## 3. Technology Stack
- **Backend**: Laravel 12 (Domain-Driven REST API)
- **Frontend (Admin/Merchant)**: React 18 + Vite (Tailwind CSS, Lucide Icons, Manual Leaflet)
- **Mobile (Customer/Rider)**: React + Capacitor (Hybrid Native)
- **Real-time**: Laravel Reverb / WebSockets
- **Database**: MySQL (Relational Core)

---

## 4. Current Status & Known Fixes
- **Solved**: Blank screen in Admin Dashboard due to missing icon imports and `react-leaflet` v5 context crashes.
- **Solved**: Backend "Class not found" errors after refactoring by clearing route cache and optimizing the autoloader.
- **Stabilized**: Switched Live Monitor to manual Leaflet initialization to bypass React 18 StrictMode conflicts.
