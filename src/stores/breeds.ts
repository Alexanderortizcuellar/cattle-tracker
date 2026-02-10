import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
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
  let unsubscribe: Unsubscribe | null = null

  // 🔥 Load breeds (realtime)
  const loadBreeds = () => {
    if (unsubscribe) unsubscribe()

    const q = query(breedsCol)
    unsubscribe = onSnapshot(q, (snapshot) => {
      breeds.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Breed),
      }))
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

  // 🧹 Cleanup
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return {
    breeds,
    loadBreeds,
    addBreed,
    updateBreed,
    deleteBreed,
  }
})
