<template>
  <div>
    <!-- Filters -->
    <CattleFilters v-model="filters" :breed-options="breedOptions" />

    <!-- KPIs Cattle -->
    <div class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Métricas del Hato</div>
      <v-row dense>
        <v-col v-for="kpi in cattleKpis" :key="kpi.title" cols="6" sm="4" md="2">
          <KpiCard v-bind="kpi" />
        </v-col>
      </v-row>
    </div>

    <!-- Charts -->
    <CattleCharts :filtered-animals="filteredAnimals" />

    <!-- Mothers Performance Table -->
    <div class="mb-8">
      <MothersTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLivestockStore } from '../../stores/livestock'
import { useBreedsStore } from '../../stores/breeds'

import KpiCard from './KpiCard.vue'
import CattleFilters from './CattleFilters.vue'
import CattleCharts from './CattleCharts.vue'
import MothersTable from './MothersTable.vue'
import { calculateAgeMonths, calculateAgeDays } from '../../utils/dashboardHelpers'

const livestockStore = useLivestockStore()
const breedsStore = useBreedsStore()

const filters = ref({
  breed: 'Todas',
  sex: 'Todos',
  status: 'Todos'
})

const breedOptions = computed(() => breedsStore.breeds.map(b => b.name))

const filteredAnimals = computed(() => {
  return livestockStore.animals.filter(a => {
    const matchBreed = filters.value.breed === 'Todas' || a.breed === filters.value.breed
    const matchSex = filters.value.sex === 'Todos' || a.sex === filters.value.sex
    const matchStatus = filters.value.status === 'Todos' || a.status === filters.value.status
    return matchBreed && matchSex && matchStatus
  })
})

// ---- KPI COMPUTATIONS (CATTLE) ----
const cattleKpis = computed(() => {
  const animals = filteredAnimals.value
  const total = animals.length
  const activeAnimals = animals.filter(a => a.status === 'Activo')
  const soldAnimals = animals.filter(a => a.status === 'Vendido')
  const deadAnimals = animals.filter(a => a.status === 'Muerto')

  // Edad Promedio (Activos)
  const activeWithDob = activeAnimals.filter(a => a.date_of_birth)
  const avgAgeActivos = activeWithDob.length > 0 
    ? (activeWithDob.reduce((acc, a) => acc + calculateAgeMonths(a.date_of_birth), 0) / activeWithDob.length).toFixed(1) + ' m'
    : '-'

  // Edad Promedio al Vender
  const soldWithDates = soldAnimals.filter(a => a.date_of_birth && a.sale_date)
  const avgAgeVenta = soldWithDates.length > 0
    ? (soldWithDates.reduce((acc, a) => acc + calculateAgeMonths(a.date_of_birth, new Date(a.sale_date!)), 0) / soldWithDates.length).toFixed(1) + ' m'
    : '-'

  // Tasa Mortalidad
  const mortalityRate = total > 0 ? ((deadAnimals.length / total) * 100).toFixed(1) + '%' : '0%'

  // Tiempo Prom. en Finca
  const animalsWithAcqDate = animals.filter(a => a.acquisition_date)
  const avgStay = animalsWithAcqDate.length > 0
    ? (animalsWithAcqDate.reduce((acc, a) => {
        const end = a.status === 'Vendido' && a.sale_date ? new Date(a.sale_date) :
                    a.status === 'Muerto' && a.death_date ? new Date(a.death_date) :
                    new Date()
        return acc + Math.max(0, calculateAgeDays(a.acquisition_date, end))
      }, 0) / animalsWithAcqDate.length).toFixed(0) + ' d'
    : '-'
  
  return [
    { title: 'Total Animales', value: total, icon: 'mdi-cow', color: 'text-blue', iconColor: 'blue' },
    { title: 'Activos', value: activeAnimals.length, icon: 'mdi-check-circle', color: 'text-success', iconColor: 'success' },
    { title: 'Vendidos', value: soldAnimals.length, icon: 'mdi-currency-usd', color: 'text-info', iconColor: 'info' },
    { title: 'Bajas (Muertos)', value: deadAnimals.length, icon: 'mdi-skull', color: 'text-black', iconColor: 'black' },
    { title: 'Edad Prom. (Activos)', value: avgAgeActivos, icon: 'mdi-calendar-clock', color: 'text-amber-darken-2', iconColor: 'amber-darken-2' },
    { title: 'Edad Prom. Venta', value: avgAgeVenta, icon: 'mdi-cash-check', color: 'text-indigo', iconColor: 'indigo' },
    { title: 'Tasa Mortalidad', value: mortalityRate, icon: 'mdi-skull-outline', color: 'text-deep-orange', iconColor: 'deep-orange' },
    { title: 'Tiempo Prom. Finca', value: avgStay, icon: 'mdi-clock-outline', color: 'text-teal', iconColor: 'teal' },
    { title: 'Etapa Potrero', value: animals.filter(a => a.status === 'Activo' && a.feeding_stage === 'Potrero').length, icon: 'mdi-grass', color: 'text-light-green-darken-2', iconColor: 'light-green-darken-2' },
    { title: 'Raza Dominante', value: getDominantBreed(animals), icon: 'mdi-dna', color: 'text-purple', iconColor: 'purple' },
    { title: 'Hembras Activas', value: activeFemales(animals), icon: 'mdi-gender-female', color: 'text-pink', iconColor: 'pink' },
  ]
})

const getDominantBreed = (animals: any[]) => {
  if (animals.length === 0) return '-'
  const counts: Record<string, number> = {}
  animals.forEach(a => { if (a.breed) counts[a.breed] = (counts[a.breed] || 0) + 1 })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted.length > 0 ? sorted[0][0] : '-'
}

const activeFemales = (animals: any[]) => {
  return animals.filter(a => a.status === 'Activo' && a.sex === 'Hembra').length
}
</script>
