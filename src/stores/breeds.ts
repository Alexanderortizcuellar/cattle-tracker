import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Breed } from '../types'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  type Unsubscribe,
} from 'firebase/firestore'

export const useBreedsStore = defineStore('breeds', () => {
  const breedsCol = collection(db, 'breeds')
  const breeds = ref<Breed[]>([])
  const loading = ref(false)
  let unsubscribe: Unsubscribe | null = null

  // 🔥 Load breeds (realtime)
  const loadBreeds = () => {
    if (unsubscribe) return

    loading.value = true
    const q = query(breedsCol)
    unsubscribe = onSnapshot(q, (snapshot) => {
      breeds.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Breed),
      }))
      loading.value = false
    }, (error) => {
      console.error("Error loading breeds:", error)
      loading.value = false
    })
  }

  // 💾 Add breed
  const addBreed = async (breed: Omit<Breed, 'id'>) => {
    await addDoc(breedsCol, breed)
  }

  // ✏️ Update breed
  const updateBreed = async (id: string, breed: Partial<Omit<Breed, 'id'>>) => {
    const breedRef = doc(db, 'breeds', id)
    await updateDoc(breedRef, breed)
  }

  // 🗑️ Delete breed
  const deleteBreed = async (id: string) => {
    const breedRef = doc(db, 'breeds', id)
    await deleteDoc(breedRef)
  }

  return {
    breeds,
    loading,
    loadBreeds,
    addBreed,
    updateBreed,
    deleteBreed,
  }
})
