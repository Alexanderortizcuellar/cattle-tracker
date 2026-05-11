import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

export const useDataImport = () => {
  /**
   * Imports data from a JSON file into Firestore.
   * Preserves IDs to maintain relationships.
   */
  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Basic validation - check if it's at least a JSON with some known entities
      const knownEntities = ['animals', 'breeds', 'contacts', 'expenses', 'expenses_animals']
      const hasKnownEntity = knownEntities.some(key => Array.isArray(data[key]))
      
      if (!hasKnownEntity) {
        throw new Error('El archivo JSON no contiene datos válidos para importar.')
      }

      const collections = [
        { name: 'animals', items: data.animals || [] },
        { name: 'breeds', items: data.breeds || [] },
        { name: 'contacts', items: data.contacts || [] },
        { name: 'expenses', items: data.expenses || [] },
        { name: 'expenses_animals', items: data.expenses_animals || [] }
      ]

      let totalImported = 0

      for (const col of collections) {
        for (const item of col.items) {
          // 1. Extract the ID to use as document name
          const { id, ...dataToSave } = item
          
          if (!id) continue // Skip if no ID

          // 2. Use setDoc to preserve the exact ID
          // String(id) ensures we handle both string and numeric IDs safely
          const docRef = doc(db, col.name, String(id))
          await setDoc(docRef, dataToSave)
          
          totalImported++
        }
      }

      return {
        success: true,
        count: totalImported,
        message: `Se importaron ${totalImported} registros exitosamente.`
      }
    } catch (error: any) {
      console.error('Error importing data:', error)
      return {
        success: false,
        message: error.message || 'Error desconocido al importar datos.'
      }
    }
  }

  return {
    importData,
  }
}
