// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBAJt3hcpxu_kPHj6xvOn9kLsqRZOSlrnU",
  authDomain: "cattle-32b56.firebaseapp.com",
  projectId: "cattle-32b56",
  storageBucket: "cattle-32b56.firebasestorage.app",
  messagingSenderId: "430009296845",
  appId: "1:430009296845:web:97e767718b4434d6a94684",
  measurementId: "G-SDJ6SJC2P9"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
