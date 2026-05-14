# 👗 Adaa By Shagun — Premium E-Commerce Platform

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **A premium custom-built fashion e-commerce platform featuring dynamic UPI checkout, Firebase-powered authentication, admin inventory management, and real-time order handling.**

---

# ✨ Overview

**Adaa By Shagun** is a modern boutique-focused e-commerce application designed to deliver a premium shopping experience for fashion brands and small businesses.

The platform combines:
- ⚡ Lightning-fast Next.js performance
- 💳 Seamless UPI-based payments
- ☁️ Cloud-hosted product media
- 🔐 Secure admin dashboards
- 📱 Mobile-first responsive design

Built from scratch using modern frontend architecture and scalable backend services, the project focuses heavily on real-world usability, performance, and elegant UI/UX.

---

# 🛍️ Customer Features

## 🛒 Product Browsing
- Browse products by category
- Dynamic sorting (Price / Latest)
- Product detail pages with image galleries
- Responsive mobile shopping experience

---

## 💳 Dynamic UPI Checkout

### Desktop Experience
- Auto-generated UPI QR codes
- Exact payment amount embedded
- Instant scan-and-pay workflow

### Mobile Experience
Deep linking support for:
- Google Pay
- PhonePe
- Paytm

Users can directly open payment apps with prefilled payment details.

---

## 👤 User Accounts
- Firebase Authentication
- Secure Login / Signup
- Guest Checkout Support
- Saved addresses
- Order history tracking

---

## 📦 Smart Shopping Cart
- Dynamic quantity controls
- Real-time total calculation
- Automatic free-shipping threshold logic
- Persistent cart state

---

## 📱 WhatsApp Order Notification
Customers can instantly notify the store admin after placing an order using one-click WhatsApp integration.

---

# 👑 Admin Dashboard Features

## 🔒 Protected Admin Access
- Route-based protection
- Authorized email verification
- Secure dashboard access

---

## 📦 Inventory Management
Full product CRUD operations:
- Add products
- Edit product details
- Update pricing
- Manage stock
- Hide/unhide products instantly

---

## ☁️ Cloudinary Media Uploads
- CDN-hosted images
- Optimized delivery
- Fast loading product galleries
- Eliminates database storage overhead

---

## 📋 Order Management
Admins can:
- View all customer orders
- Track payment status
- Update shipping progress
- Send WhatsApp tracking messages instantly

---

# 🛠️ Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

---

## UI & Icons
- Lucide React

---

## Backend Services
- Firebase Authentication
- Firestore Database

---

## Media Hosting
- Cloudinary

---

## Deployment
- Vercel

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:
- Node.js 18+
- npm or yarn
- Firebase Project
- Cloudinary Account

---

# 1. Clone the Repository

```bash
git clone https://github.com/yourusername/adaa-by-shagun.git

cd adaa-by-shagun
```

---

# 2. Install Dependencies

```bash
npm install
```

---

# 3. Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"

NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"

NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
```

---

## ☁️ Cloudinary Configuration

Ensure your:
- `cloud_name`
- `upload_preset`

are configured properly inside:

```text
app/admin/add-product/page.tsx
```

---

# 4. Run Development Server

```bash
npm run dev
```

Application runs on:

```text
http://localhost:3000
```

---

# 📁 Project Structure

```text
adaa-by-shagun/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── add-product/
│   │   └── orders/
│   │
│   ├── products/
│   ├── checkout/
│   ├── account/
│   └── login/
│
├── components/
│   ├── ui/
│   ├── cart/
│   ├── product/
│   └── navbar/
│
├── firebase/
│   ├── config.ts
│   └── auth.ts
│
├── lib/
│   └── helpers.ts
│
├── public/
│
├── styles/
│
├── .env.local
├── package.json
└── README.md
```

---

# 🔒 Security Notes

- Firebase Firestore rules should only allow admin writes for inventory operations.
- `.env.local` is included inside `.gitignore`.
- Sensitive API keys should never be committed publicly.

---

# 📱 Mobile Optimization

The platform is fully optimized for:
- Android devices
- iPhones
- Tablets
- Responsive desktop layouts

Special attention was given to:
- Touch interactions
- Fast image loading
- Mobile UPI payments

---

# 🧪 Future Improvements

Potential future upgrades:
- Razorpay Integration
- AI-powered recommendations
- Email notifications
- Order analytics dashboard
- Coupon & discount system
- Multi-vendor support
- Inventory analytics

---

# 📸 Screenshots

> Add screenshots of:

- Homepage
- Product Page
- Cart System
- UPI Checkout
- Admin Dashboard
- Order Management
- Mobile UI

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Designed & Developed for **Adaa By Shagun**.

Built using modern full-stack web technologies with a focus on premium user experience and scalable architecture.

---

# ⭐ Support

If you like the project, consider starring the repository.

---
```The elegance of fashion meets the performance of modern web engineering.```
