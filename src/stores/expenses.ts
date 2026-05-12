import { defineStore } from 'pinia'
import type { Expense, ExpenseAnimal } from '../types'
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
  where,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore'

export const useExpensesStore = defineStore('expenses', () => {
  const expensesCol = collection(db, 'expenses')
  const expensesAnimalsCol = collection(db, 'expenses_animals')
  
  const expenses = ref<Expense[]>([])
  const expensesAnimals = ref<ExpenseAnimal[]>([])
  const loading = ref(false)
  
  let expensesUnsubscribe: Unsubscribe | null = null
  let associationsUnsubscribe: Unsubscribe | null = null

  const loadExpenses = () => {
    if (expensesUnsubscribe) return
    loading.value = true
    const q = query(expensesCol)
    expensesUnsubscribe = onSnapshot(q, (snapshot) => {
      expenses.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Expense),
      }))
      loading.value = false
    }, (error) => {
      console.error("Error loading expenses:", error)
      loading.value = false
    })
  }

  const loadAssociations = () => {
    if (associationsUnsubscribe) return
    const q = query(expensesAnimalsCol)
    associationsUnsubscribe = onSnapshot(q, (snapshot) => {
      expensesAnimals.value = snapshot.docs.map((d) => (d.data() as ExpenseAnimal))
    })
  }

  const addExpense = async (expense: Expense, animalIds: string[]) => {
    const expenseData = {
      ...expense,
      created_at: new Date().toISOString()
    }
    const docRef = await addDoc(expensesCol, expenseData)
    const expenseId = docRef.id

    if (expense.scope === 'Individual' && animalIds.length > 0) {
      const amountPerAnimal = expense.amount / animalIds.length
      for (const animalId of animalIds) {
        await addDoc(expensesAnimalsCol, {
          expense_id: expenseId,
          animal_id: animalId,
          amount_per_animal: amountPerAnimal
        })
      }
    }
    return expenseId
  }

  const updateExpense = async (id: string, updates: Partial<Expense>, animalIds?: string[]) => {
    const expenseRef = doc(db, 'expenses', id)
    await updateDoc(expenseRef, updates)
    
    const finalAmount = updates.amount !== undefined ? updates.amount : (expenses.value.find(e => e.id === id)?.amount || 0)
    const finalScope = updates.scope !== undefined ? updates.scope : (expenses.value.find(e => e.id === id)?.scope || 'Global')

    if (finalScope === 'Global') {
      const q = query(expensesAnimalsCol, where('expense_id', '==', id))
      const snapshot = await getDocs(q)
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'expenses_animals', d.id))
      }
    } else if (animalIds) {
      const q = query(expensesAnimalsCol, where('expense_id', '==', id))
      const snapshot = await getDocs(q)
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'expenses_animals', d.id))
      }

      if (animalIds.length > 0) {
        const amountPerAnimal = finalAmount / animalIds.length
        for (const animalId of animalIds) {
          await addDoc(expensesAnimalsCol, {
            expense_id: id,
            animal_id: animalId,
            amount_per_animal: amountPerAnimal
          })
        }
      }
    } else if (updates.amount !== undefined) {
      const q = query(expensesAnimalsCol, where('expense_id', '==', id))
      const snapshot = await getDocs(q)
      if (snapshot.docs.length > 0) {
        const newAmountPerAnimal = finalAmount / snapshot.docs.length
        for (const d of snapshot.docs) {
          await updateDoc(doc(db, 'expenses_animals', d.id), {
            amount_per_animal: newAmountPerAnimal
          })
        }
      }
    }
  }

  const findAnimalExpense = async (animalId: string, category: string) => {
    const associationsQ = query(expensesAnimalsCol, where('animal_id', '==', animalId))
    const associationsSnapshot = await getDocs(associationsQ)
    const expenseIds = associationsSnapshot.docs.map(d => d.data().expense_id)
    
    if (expenseIds.length === 0) return null
    
    const expensesQ = query(expensesCol, where('category', '==', category))
    const expensesSnapshot = await getDocs(expensesQ)
    
    return expensesSnapshot.docs.find(d => expenseIds.includes(d.id))?.id || null
  }

  const deleteExpense = async (id: string) => {
    // Delete associations first
    const q = query(expensesAnimalsCol, where('expense_id', '==', id))
    const snapshot = await getDocs(q)
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, 'expenses_animals', d.id))
    }
    // Delete expense
    await deleteDoc(doc(db, 'expenses', id))
  }

  return {
    expenses,
    expensesAnimals,
    loading,
    loadExpenses,
    loadAssociations,
    addExpense,
    updateExpense,
    findAnimalExpense,
    deleteExpense
  }
})
