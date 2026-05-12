import { defineStore } from 'pinia'
import type { Animal } from '../types'
import { ref } from 'vue'
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

export const useLivestockStore = defineStore('livestock', () => {
  const animalsCol = collection(db, 'animals')
  const animals = ref<Animal[]>([])
  const loading = ref(false)
  let unsubscribe: Unsubscribe | null = null

  const filters = ref({
    search: '',
    breed: '',
    sex: '',
    status: '',
    feedingStage: '',
    ageRange: '' as string,
    showFilters: false,
    viewMode: 'grid' as 'grid' | 'table'
  })

  // --- 🔥 Cargar animales (suscripción en tiempo real) ---
  const loadAnimals = () => {
    if (unsubscribe) return

    loading.value = true
    const q = query(animalsCol)
    unsubscribe = onSnapshot(q, (snapshot) => {
      animals.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Animal),
      }))
      loading.value = false
    }, (error) => {
      console.error("Error loading animals:", error)
      loading.value = false
    })
  }

  // --- 💾 Agregar un nuevo animal ---
  const addAnimal = async (animal: Animal) => {
    const docRef = await addDoc(animalsCol, animal)
    return docRef.id
  }

  // --- ✏️ Actualizar un animal ---
  const updateAnimal = async (id: string | number, animal: Animal) => {
    const docId = String(id)
    const animalRef = doc(db, 'animals', docId)
    const { id: _, ...updateData } = animal
    await updateDoc(animalRef, updateData)
  }

  // --- 🗑️ Eliminar un animal ---
  const deleteAnimal = async (id: string | number) => {
    const docId = String(id)
    const animalRef = doc(db, 'animals', docId)
    await deleteDoc(animalRef)
  }

  return {
    animals,
    filters,
    loading,
    loadAnimals,
    addAnimal,
    updateAnimal,
    deleteAnimal,
  }
})
