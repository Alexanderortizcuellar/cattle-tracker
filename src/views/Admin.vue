<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Administración</h1>
        <v-divider class="mb-6"></v-divider>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <v-card variant="outlined">
          <v-list color="primary">
            <v-list-item
              v-for="item in adminMenuItems"
              :key="item.id"
              :active="activeTab === item.id"
              @click="activeTab = item.id"
              :prepend-icon="item.icon"
              :title="item.title"
              rounded="lg"
              class="mb-1"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <!-- Tab: Bulk Operations -->
        <v-window v-model="activeTab">
          <v-window-item value="sync">
            <v-row>
              <v-col cols="12" lg="6">
                <v-card variant="outlined" class="pa-4 h-100">
                  <v-card-title class="d-flex align-center">
                    <v-icon start color="primary">mdi-cart-arrow-down</v-icon>
                    Importar Compras
                  </v-card-title>
                  <v-card-text>
                    Crea automáticamente un registro de gasto por cada animal comprado que tenga un precio de adquisición definido.
                    Se usará la categoría <strong>Compra</strong> y el tipo <strong>Gasto</strong>.
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="elevated"
                      @click="syncPurchases"
                      :loading="loadingPurchases"
                    >
                      Sincronizar Compras
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6">
                <v-card variant="outlined" class="pa-4 h-100">
                  <v-card-title class="d-flex align-center">
                    <v-icon start color="success">mdi-cash-multiple</v-icon>
                    Importar Ventas
                  </v-card-title>
                  <v-card-text>
                    Crea automáticamente un registro de ingreso por cada animal vendido que tenga un precio de venta definido.
                    Se usará la categoría <strong>Venta</strong> y el tipo <strong>Ingreso</strong>.
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="success"
                      variant="elevated"
                      @click="syncSales"
                      :loading="loadingSales"
                    >
                      Sincronizar Ventas
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab: Data Management -->
          <v-window-item value="data">
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <v-card-title>Respaldo JSON</v-card-title>
                  <v-card-text>Exporta o importa la base de datos completa en formato JSON.</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" variant="tonal" prepend-icon="mdi-download" @click="openExportDialog">
                      Exportar JSON
                    </v-btn>
                    <v-btn color="secondary" variant="tonal" prepend-icon="mdi-upload" @click="triggerImport">
                      Importar JSON
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <v-card-title>Carga Masiva (CSV)</v-card-title>
                  <v-card-text>Carga animales desde un archivo CSV o descarga la plantilla base.</v-card-text>
                  <v-card-actions>
                    <v-btn color="success" variant="tonal" prepend-icon="mdi-file-import" @click="triggerCsvImport">
                      Cargar CSV
                    </v-btn>
                    <v-btn color="info" variant="tonal" prepend-icon="mdi-file-download" @click="downloadCsvTemplate">
                      Plantilla CSV
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>

    <!-- Export Selection Dialog -->
    <v-dialog v-model="exportDialog" max-width="500px">
      <v-card>
        <v-card-title>Seleccionar Datos para Exportar</v-card-title>
        <v-card-text>
          <v-checkbox v-model="exportOptions.animals" label="Ganado (Cattle)" hide-details></v-checkbox>
          <v-checkbox v-model="exportOptions.contacts" label="Contactos" hide-details></v-checkbox>
          <v-checkbox v-model="exportOptions.breeds" label="Razas" hide-details></v-checkbox>
          <v-checkbox v-model="exportOptions.expenses" label="Gastos e Ingresos" hide-details></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="exportDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="confirmExport" :disabled="!Object.values(exportOptions).some(v => v)">
            Exportar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Hidden Inputs -->
    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleImport" />
    <input ref="csvInput" type="file" accept=".csv" style="display: none" @change="handleCsvImport" />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLivestockStore } from '../stores/livestock'
import { useExpensesStore } from '../stores/expenses'
import { useDataExport } from '../utils/dataExport'
import { useDataImport } from '../utils/dataImport'
import { useCsvHandler } from '../utils/csvHandler'
import type { Expense } from '../types'

const livestockStore = useLivestockStore()
const expensesStore = useExpensesStore()
const { downloadData } = useDataExport()
const { importData } = useDataImport()
const { downloadCsvTemplate, handleCsvUpload } = useCsvHandler()

const activeTab = ref('sync')
const adminMenuItems = [
  { id: 'sync', title: 'Sincronización Masiva', icon: 'mdi-sync' },
  { id: 'data', title: 'Gestión de Datos', icon: 'mdi-database' },
]

const fileInput = ref<HTMLInputElement | null>(null)
const csvInput = ref<HTMLInputElement | null>(null)
const loadingPurchases = ref(false)
const loadingSales = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const exportDialog = ref(false)
const exportOptions = ref({
  animals: true,
  contacts: true,
  breeds: true,
  expenses: true
})

const openExportDialog = () => {
  exportDialog.value = true
}

const confirmExport = () => {
  downloadData(exportOptions.value)
  exportDialog.value = false
  showMessage('Exportación iniciada')
}

onMounted(async () => {
  await livestockStore.loadAnimals()
  await expensesStore.loadExpenses()
  await expensesStore.loadAssociations()
})

const triggerImport = () => fileInput.value?.click()
const triggerCsvImport = () => csvInput.value?.click()

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const result = await importData(file)
  showMessage(result.message)
  target.value = ''
}

const handleCsvImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const result = await handleCsvUpload(file)
  showMessage(result.message)
  target.value = ''
}

const showMessage = (text: string, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const syncPurchases = async () => {
  loadingPurchases.value = true
  let count = 0
  let skipped = 0

  try {
    const purchasedAnimals = livestockStore.animals.filter(
      (a) => a.acquisition_price && a.acquisition_price > 0
    )

    for (const animal of purchasedAnimals) {
      const exists = await expensesStore.findAnimalExpense(String(animal.id), 'Compra')
      
      let alreadyHasPurchaseExpense = false
      if (exists) {
        const existingExpense = expensesStore.expenses.find(e => e.id === exists)
        if (existingExpense?.type === 'Gasto') {
          alreadyHasPurchaseExpense = true
        }
      }

      if (!alreadyHasPurchaseExpense) {
        const expense: Expense = {
          amount: animal.acquisition_price,
          date: animal.acquisition_date || new Date().toISOString().split('T')[0],
          description: `Compra de animal: ${animal.number || animal.name || animal.id}`,
          category: 'Compra', 
          type: 'Gasto',
          scope: 'Individual'
        }
        await expensesStore.addExpense(expense, [String(animal.id)])
        count++
      } else {
        skipped++
      }
    }
    showMessage(`Sincronización completada: ${count} creados, ${skipped} omitidos.`)
  } catch (error) {
    console.error(error)
    showMessage('Error al sincronizar compras', 'error')
  } finally {
    loadingPurchases.value = false
  }
}

const syncSales = async () => {
  loadingSales.value = true
  let count = 0
  let skipped = 0

  try {
    const soldAnimals = livestockStore.animals.filter(
      (a) => a.status === 'Vendido' && a.sale_price && a.sale_price > 0
    )

    for (const animal of soldAnimals) {
      const exists = await expensesStore.findAnimalExpense(String(animal.id), 'Venta')
      
      let alreadyHasSaleExpense = false
      if (exists) {
        const existingExpense = expensesStore.expenses.find(e => e.id === exists)
        if (existingExpense?.type === 'Ingreso') {
          alreadyHasSaleExpense = true
        }
      }

      if (!alreadyHasSaleExpense) {
        const expense: Expense = {
          amount: animal.sale_price!,
          date: animal.sale_date || new Date().toISOString().split('T')[0],
          description: `Venta de animal: ${animal.number || animal.name || animal.id}`,
          category: 'Venta',
          type: 'Ingreso',
          scope: 'Individual'
        }
        await expensesStore.addExpense(expense, [String(animal.id)])
        count++
      } else {
        skipped++
      }
    }
    showMessage(`Sincronización completada: ${count} creados, ${skipped} omitidos.`)
  } catch (error) {
    console.error(error)
    showMessage('Error al sincronizar ventas', 'error')
  } finally {
    loadingSales.value = false
  }
}
</script>
