<template>
  <div>
    <v-row class="mb-4 mb-md-6">
      <v-col cols="12">
        <h1 class="text-h4 text-md-h3 font-weight-bold text-grey-darken-3">
          Gastos y Egresos
        </h1>
        <p class="text-body-1 text-md-h6 text-grey-darken-1 mt-1">
          Control financiero de tu operación ganadera
        </p>
      </v-col>
    </v-row>

    <v-card elevation="2" class="rounded-lg">
      <div class="d-flex flex-column flex-md-row align-center pa-4 ga-3">
        <v-text-field
          v-model="search"
          label="Buscar gastos..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1 w-100"
          bg-color="white"
        ></v-text-field>

        <v-btn
          color="primary"
          elevation="2"
          @click="dialog = true"
          prepend-icon="mdi-plus"
          size="large"
          class="w-100 w-md-auto"
        >
          Nuevo Gasto
        </v-btn>
      </div>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="expensesWithAnimals"
          :search="search"
          hover
          class="elevation-0"
        >
          <template v-slot:item.amount="{ item }">
            <span :class="['font-weight-bold', item.type === 'Ingreso' ? 'text-success' : 'text-error']">
              {{ item.type === 'Ingreso' ? '+' : '-' }}${{ item.amount.toLocaleString() }}
            </span>
          </template>

          <template v-slot:item.type="{ item }">
            <v-chip
              :color="item.type === 'Ingreso' ? 'success' : 'error'"
              size="x-small"
              variant="flat"
              class="font-weight-bold"
            >
              {{ item.type }}
            </v-chip>
          </template>

          <template v-slot:item.scope="{ item }">
            <v-chip
              :color="item.scope === 'Global' ? 'grey-darken-3' : 'secondary'"
              size="x-small"
              variant="tonal"
              class="font-weight-bold"
            >
              {{ item.scope }}
            </v-chip>
          </template>

          <template v-slot:item.category="{ item }">
            <v-chip
              :color="getCategoryColor(item.category)"
              size="x-small"
              label
              variant="flat"
              class="font-weight-bold"
            >
              {{ item.category }}
            </v-chip>
          </template>

          <template v-slot:item.animals="{ item }">
            <div class="d-flex flex-wrap ga-1 py-1">
              <v-chip
                v-for="assoc in item.associations"
                :key="assoc.animal_id"
                size="x-small"
                color="primary"
                variant="tonal"
                class="font-weight-medium"
                @click="$router.push(`/livestock/${assoc.animal_id}`)"
              >
                {{ getAnimalLabel(assoc.animal_id) }}
                <span v-if="assoc.amount_per_animal" class="ml-1 opacity-70">
                  (${{ assoc.amount_per_animal.toLocaleString(undefined, {maximumFractionDigits: 0}) }})
                </span>
              </v-chip>
              <span v-if="!item.associations?.length" class="text-caption text-grey">
                General
              </span>
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              v-if="item.id"
              icon="mdi-delete"
              variant="text"
              color="error"
              size="small"
              @click="deleteExpense(item.id)"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <ExpenseFormDialog
      v-model="dialog"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExpensesStore } from '../stores/expenses'
import { useLivestockStore } from '../stores/livestock'
import ExpenseFormDialog from '../components/ExpenseFormDialog.vue'
import type { Expense } from '../types'

const expensesStore = useExpensesStore()
const livestockStore = useLivestockStore()

const search = ref('')
const dialog = ref(false)

const headers = [
  { title: 'Fecha', key: 'date', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Alcance', key: 'scope', sortable: true },
  { title: 'Categoría', key: 'category', sortable: true },
  { title: 'Descripción', key: 'description', sortable: true },
  { title: 'Animales', key: 'animals', sortable: false },
  { title: 'Monto Total', key: 'amount', align: 'end' as const, sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

onMounted(() => {
  expensesStore.loadExpenses()
  expensesStore.loadAssociations()
  livestockStore.loadAnimals()
})

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Pastoreo': return 'success';
    case 'Alimento': return 'warning';
    case 'Medicamento': return 'error';
    case 'Compra': return 'primary';
    case 'Transporte': return 'info';
    case 'Mantenimiento': return 'grey-darken-1';
    case 'Mano de obra': return 'brown';
    case 'Venta': return 'success';
    default: return 'grey';
  }
}

const expensesWithAnimals = computed(() => {
  return expensesStore.expenses.map(expense => {
    const associations = expensesStore.expensesAnimals
      .filter(ea => ea.expense_id === expense.id)
    
    return {
      ...expense,
      associations
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const getAnimalLabel = (id: string) => {
  const animal = livestockStore.animals.find(a => a.id === id)
  return animal ? `${animal.number}` : '?'
}

const handleSave = async ({ expense, animalIds }: { expense: Expense, animalIds: string[] }) => {
  await expensesStore.addExpense(expense, animalIds)
}

const deleteExpense = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este gasto?')) {
    await expensesStore.deleteExpense(id)
  }
}
</script>
