import { defineStore } from 'pinia'
import type { Animal } from '../types'
import { ref, onUnmounted } from 'vue'
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
  let unsubscribe: Unsubscribe | null = null

  // --- 🔥 Cargar animales (suscripción en tiempo real) ---
  const loadAnimals = () => {
    const q = query(animalsCol)
    unsubscribe = onSnapshot(q, (snapshot) => {
      animals.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Animal),
      }))
    })
  }

  // --- 💾 Agregar un nuevo animal ---
  const addAnimal = async (animal: Animal) => {
    await addDoc(animalsCol, animal)
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

  // --- 🧹 Cancelar suscripción al desmontar ---
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return {
    animals,
    loadAnimals,
    addAnimal,
    updateAnimal,
    deleteAnimal,
  }
})
