<template>
  <v-container fluid class="pa-3 pa-md-6 bg-grey-lighten-4 min-vh-100 position-relative">
    <v-fade-transition>
      <div v-if="livestockStore.loading || breedsStore.loading || expensesStore.loading" class="loading-overlay">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <div class="mt-4 text-h6 text-grey-darken-1">Cargando datos del panel...</div>
      </div>
    </v-fade-transition>

    <!-- Header & Global Toggle -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" md="6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-1">
          Panel de Control
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Análisis avanzado del hato y rentabilidad
        </p>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-md-end align-center ga-4">
        <v-btn-toggle
          v-model="dashboardView"
          mandatory
          color="primary"
          variant="elevated"
          rounded="xl"
          density="comfortable"
        >
          <v-btn value="cattle" prepend-icon="mdi-cow">Ganado</v-btn>
          <v-btn value="financial" prepend-icon="mdi-finance">Finanzas</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Content -->
    <CattleDashboard v-if="dashboardView === 'cattle'" />
    <FinancialDashboard v-else />

  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useLivestockStore } from '../stores/livestock'
import { useBreedsStore } from '../stores/breeds'
import { useExpensesStore } from '../stores/expenses'

import { THEME_KEY } from 'vue-echarts'
import CattleDashboard from '../components/dashboard/CattleDashboard.vue'
import FinancialDashboard from '../components/dashboard/FinancialDashboard.vue'

provide(THEME_KEY, 'light')

const livestockStore = useLivestockStore()
const breedsStore = useBreedsStore()
const expensesStore = useExpensesStore()

const dashboardView = ref('cattle')

onMounted(async () => {
  await livestockStore.loadAnimals()
  await breedsStore.loadBreeds()
  await expensesStore.loadExpenses()
})
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}
</style>
