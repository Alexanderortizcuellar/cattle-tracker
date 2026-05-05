import Papa from 'papaparse'
import { useLivestockStore } from '../stores/livestock'

export const useCsvHandler = () => {
  const livestockStore = useLivestockStore()

  const downloadCsvTemplate = () => {
    const headers = [
      "mark",
      "number",
      "name",
      "sex",
      "date_of_birth",
      "breed",
      "acquisition_type",
      "acquisition_date",
      "acquisition_price",
      "status",
      "notes",
    ];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_animales.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCsvUpload = async (file: File) => {
    return new Promise<{success: boolean, message: string}>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as Record<string, any>[];
          try {
            await insertBulkToFirestore(data);
            resolve({ success: true, message: "Carga masiva completada" });
          } catch (err) {
            console.error(err);
            resolve({ success: false, message: "Error durante la carga masiva" });
          }
        },
      });
    });
  };

  async function insertBulkToFirestore(data: any[]) {
    const CHUNK_SIZE = 100; // Smaller chunks for better reliability
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const batchPromises = chunk.map(async (row) => {
        const formatted = {
          mark: row.mark || "",
          number: row.number || "",
          name: row.name || "",
          sex: row.sex || "Hembra",
          date_of_birth: row.date_of_birth || "",
          breed: row.breed || "",
          acquisition_type: row.acquisition_type || "Compra",
          acquisition_date: row.acquisition_date || "",
          acquisition_price: Number(row.acquisition_price) || 0,
          sellerId: row.sellerId || "",
          status: row.status || "Activo",
          notes: row.notes || "",
          buyerId: row.buyerId || "",
          sale_date: row.sale_date || "",
          sale_price: Number(row.sale_price) || 0,
          death_reason: row.death_reason || "",
          death_date: row.death_date || "",
        };
        await livestockStore.addAnimal(formatted);
      });
      await Promise.all(batchPromises);
    }
    await livestockStore.loadAnimals();
  }

  return {
    downloadCsvTemplate,
    handleCsvUpload
  }
}
