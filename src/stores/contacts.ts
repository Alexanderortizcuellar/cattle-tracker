import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import type { Contact } from '../types'
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

export const useContactsStore = defineStore('contacts', () => {
  const contactsCol = collection(db, 'contacts')
  const contacts = ref<Contact[]>([])
  let unsubscribe: Unsubscribe | null = null

  // 🔥 Load contacts (realtime)
  const loadContacts = () => {
    if (unsubscribe) unsubscribe()

    const q = query(contactsCol)
    unsubscribe = onSnapshot(q, (snapshot) => {
      contacts.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Contact),
      }))
    })
    console.log(["contacts.value", contacts])
  }

  // 💾 Add contact
  const addContact = async (contact: Omit<Contact, 'id'>) => {
    await addDoc(contactsCol, contact)
  }

  // ✏️ Update contact
  const updateContact = async (
    id: string,
    contact: Partial<Omit<Contact, 'id'>>
  ) => {
    const contactRef = doc(db, 'contacts', id)
    await updateDoc(contactRef, contact)
  }

  // 🗑️ Delete contact
  const deleteContact = async (id: string) => {
    const contactRef = doc(db, 'contacts', id)
    console.log(["contactRef", contactRef])
    await deleteDoc(contactRef)
  }

  // 🧹 Cleanup
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return {
    contacts,
    loadContacts,
    addContact,
    updateContact,
    deleteContact,
  }
})
