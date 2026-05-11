import { useLivestockStore } from '../stores/livestock'
import { useBreedsStore } from '../stores/breeds'
import { useContactsStore } from '../stores/contacts'
import { useExpensesStore } from '../stores/expenses'

export interface ExportOptions {
  animals?: boolean;
  breeds?: boolean;
  contacts?: boolean;
  expenses?: boolean;
}

export const useDataExport = () => {
  const livestockStore = useLivestockStore()
  const breedsStore = useBreedsStore()
  const contactsStore = useContactsStore()
  const expensesStore = useExpensesStore()

  /**
   * Downloads selected application data as a JSON file.
   */
  const downloadData = (options: ExportOptions = { animals: true, breeds: true, contacts: true, expenses: true }) => {
    // Collect data from stores based on options
    const data: any = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
    }

    if (options.animals) data.animals = livestockStore.animals
    if (options.breeds) data.breeds = breedsStore.breeds
    if (options.contacts) data.contacts = contactsStore.contacts
    if (options.expenses) {
      data.expenses = expensesStore.expenses
      data.expenses_animals = expensesStore.expensesAnimals
    }

    // Create a Blob from the JSON data
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    // Create a temporary link element to trigger the download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Format filename with current date
    const dateStr = new Date().toISOString().split('T')[0]
    link.download = `cattle-tracker-backup-${dateStr}.json`
    
    // Append to body, click, and cleanup
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Free up memory
    URL.revokeObjectURL(url)
  }

  return {
    downloadData,
  }
}
