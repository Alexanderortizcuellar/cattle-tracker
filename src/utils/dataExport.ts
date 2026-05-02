import { useLivestockStore } from '../stores/livestock'
import { useBreedsStore } from '../stores/breeds'
import { useContactsStore } from '../stores/contacts'

export const useDataExport = () => {
  const livestockStore = useLivestockStore()
  const breedsStore = useBreedsStore()
  const contactsStore = useContactsStore()

  /**
   * Downloads all application data as a JSON file.
   */
  const downloadAllData = () => {
    // Collect data from stores
    const data = {
      animals: livestockStore.animals,
      breeds: breedsStore.breeds,
      contacts: contactsStore.contacts,
      version: '1.0.0',
      exportDate: new Date().toISOString(),
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
    downloadAllData,
  }
}
