# 🐄 Cattle Management System

A modern web application for comprehensive livestock herd management. It allows you to administer, track, and monitor cattle with an intuitive dashboard, analysis charts, and complete data management.

## 📋 Project Description

This is a complete **cattle management** platform that facilitates ranchers with:

* **Interactive Dashboard:** General herd summary with key metrics.
* **Cattle Management:** Detailed record of each animal (name, brand, breed, weight, status, etc.).
* **Breeds:** Catalog of available cattle breeds.
* **Contacts:** Registry of suppliers, veterinarians, and other contacts.
* **Secure Authentication:** Access via Firebase Authentication.
* **Real-time Database:** Instant synchronization with Firebase Firestore.
* **Charts & Analysis:** Data visualization using Chart.js and Recharts.
* **Responsive Interface:** Design adapted for mobile and desktop devices.

### Main Technologies

* **Vue 3**: Modern framework with Composition API
* **TypeScript**: Static typing for better security
* **Vite**: Fast and efficient build tool
* **Vuetify 3**: Material Design components
* **Pinia**: State management
* **Firebase**: Backend and authentication
* **Chart.js & Recharts**: Data visualization

## 🚀 Installation

### Prerequisites

* **Node.js**: v16 or higher
* **npm** or **yarn**: Package manager
* Firebase account (for full functionality)

### Installation Steps

#### 1. Clone the repository

```bash
git clone https://github.com/Alexanderortizcuellar/cattle-tracker.git
cd cattle-tracker

```

#### 2. Install dependencies

```bash
npm install

```

or if you use yarn:

```bash
yarn install

```

#### 3. Configure Firebase

1. Create a project in [Firebase Console](https://console.firebase.google.com)
2. Get your configuration credentials
3. Create a `src/firebase.config.ts` file (or update `src/firebase.ts`) with your credentials:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

```

#### 4. Run in development mode

```bash
npm run dev

```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

```bash
# Development mode with hot-reload
npm run dev

# Build for production
npm run build

# Preview the build
npm run preview

```

## 🔐 Authentication

The project uses Firebase Authentication. Users must:

1. Register or log in on the login page.
2. Once authenticated, access the main dashboard.
3. Manage their cattle information securely.

## 🎯 Key Features

### Dashboard

* Herd metrics (total animals, males, females, etc.)
* Distribution charts by status
* Real-time information

### Cattle Management

* Create, edit, and delete cattle records
* Filter by name, brand, or breed
* Import/export data
* Track animal status (active, sold, deceased)

### Breeds

* Complete catalog of available breeds
* Detailed information for each breed

### Contacts

* Registry of suppliers, veterinarians, etc.
* Contact and location information

## 🛠️ Development

### Adding a New Feature

1. Create components in `src/components/`
2. Create stores in `src/stores/` if state management is needed
3. Add routes in `src/router/index.ts`
4. Create the view in `src/views/`

### TypeScript

The project is fully typed. Make sure to:

```typescript
// Use interfaces for data
interface Cattle {
  id: number
  name: string
  // ...
}

// Use types in components
export default defineComponent({
  // ...
})

```

## 📚 Useful Resources

* [Vue 3 Documentation](https://vuejs.org/)
* [TypeScript with Vue Guide](https://vuejs.org/guide/typescript/overview.html)
* [Vuetify Documentation](https://vuetifyjs.com/)
* [Pinia Documentation](https://pinia.vuejs.org/)
* [Firebase Documentation](https://firebase.google.com/docs)

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is under the MIT license. See `LICENSE` for more details.

## 📞 Contact

**Author**: Alexander ortiz

For questions or suggestions, open an issue in the repository.