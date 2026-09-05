# Cartigo Mobile — Native Android & iOS Application

Production-ready native mobile application for Cartigo built with **React Native**, **Expo SDK 52**, **Expo Router**, **TypeScript**, **TanStack Query**, **Zustand**, **React Hook Form + Zod**, and **Expo SecureStore**.

---

## Tech Stack Overview

- **Framework**: React Native with Expo SDK 52 (New Architecture enabled)
- **Navigation**: Expo Router (File-based navigation with typed routes)
- **Server State & Caching**: TanStack Query v5 with 5-minute stale caching & auto-invalidation
- **Local Client State**: Zustand (Cart badge, optimistic wishlist, auth session)
- **Validation**: React Hook Form + Zod schemas
- **Storage**: Expo SecureStore (Encrypted mobile keychain/keystore token storage)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Design System**: Cartigo Ledger Navy (`#12172B`), Signal Amber (`#E8A33D`), Paper (`#F7F7F5`)

---

## App Screens & Structure

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx            # Phone/Email & password login
│   │   ├── signup.tsx           # Customer registration (Buyer & Retailer roles)
│   │   └── verify-otp.tsx       # 6-Digit OTP security code verification
│   ├── (tabs)/
│   │   ├── index.tsx            # Home (Banners, Categories, Drops, Builders)
│   │   ├── categories.tsx       # Visual categories directory
│   │   ├── wishlist.tsx         # Saved items & 1-tap move to cart
│   │   ├── cart.tsx             # Interactive shopping cart with free delivery progress
│   │   └── profile.tsx          # Account, addresses, and reseller management hub
│   ├── onboarding.tsx           # Value proposition onboarding carousel
│   ├── search.tsx               # Live autocomplete search & search history
│   ├── products/
│   │   ├── index.tsx            # Product catalog with sorting & category filtering
│   │   └── [id].tsx             # Product details with paged gallery & variant picker
│   ├── checkout/
│   │   ├── address.tsx          # Address management & delivery selection
│   │   ├── payment.tsx          # Payment methods (COD, UPI, Card) & Escrow protection
│   │   └── confirmation.tsx     # Order placed confirmation with CTG order ID
│   ├── orders/
│   │   ├── index.tsx            # Order history list
│   │   └── [id].tsx             # Visual carrier milestone shipment tracker
│   ├── notifications.tsx        # Push & in-app notifications
│   └── help.tsx                 # 24/7 Support, FAQs, and toll-free helpline
└── src/
    ├── api/                     # TanStack Query client & resilient fallback provider
    ├── components/              # Native UI system (Button, Input, Card, Header, Badge, ProductCard)
    ├── store/                   # Zustand stores (useAuthStore, useCartStore, useWishlistStore)
    ├── theme/                   # Cartigo design tokens
    ├── types/                   # TypeScript interfaces matching Prisma database
    └── utils/                   # SecureStore, currency & date formatting
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Run in Development Mode
```bash
# Start Expo bundler
npx expo start

# Run on Android emulator or physical device (Expo Go)
npx expo start --android

# Run on iOS simulator (macOS)
npx expo start --ios
```

### 3. Backend Integration
By default, the mobile app includes an intelligent fallback data layer so it can be previewed immediately. To point the mobile app to your local or staging Next.js server, create `.env` in the `mobile/` directory:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000
```
*(On Android Emulator, use `http://10.0.2.2:3000`)*

---

## Building for Production (EAS Build)

### Android APK / AAB
```bash
# Build standalone Android APK
npx eas build --platform android --profile preview
```

### iOS IPA
```bash
# Build standalone iOS App
npx eas build --platform ios --profile preview
```
