<template>
  <v-container fluid class="pa-3 pa-md-6 bg-grey-lighten-4 min-vh-100">
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

    <!-- Filters (Show only in Cattle view or optionally in both) -->
    <v-row v-if="dashboardView === 'cattle'" align="center" class="mb-6">
      <v-col cols="12">
        <v-card variant="flat" class="pa-2 rounded-lg bg-white border">
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-select
                v-model="filters.breed"
                :items="['Todas', ...breedOptions]"
                label="Raza"
                density="compact"
                variant="outlined"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="filters.sex"
                :items="['Todos', 'Macho', 'Hembra']"
                label="Sexo"
                density="compact"
                variant="outlined"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="filters.status"
                :items="['Todos', 'Activo', 'Vendido', 'Muerto']"
                label="Estado"
                density="compact"
                variant="outlined"
                hide-details
              ></v-select>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- 1. CATTLE VIEW -->
    <div v-if="dashboardView === 'cattle'">
      <!-- KPIs Cattle -->
      <div class="mb-8">
        <div class="text-overline mb-2 text-primary font-weight-bold">Métricas del Hato</div>
        <v-row dense>
          <v-col v-for="kpi in cattleKpis" :key="kpi.title" cols="6" sm="4" md="2">
            <v-card border flat class="rounded-lg h-100">
              <v-card-text class="pa-3">
                <div class="text-caption text-grey-darken-1 text-truncate">{{ kpi.title }}</div>
                <div class="text-h6 font-weight-bold" :class="kpi.color">{{ kpi.value }}</div>
                <v-icon :color="kpi.iconColor" size="18" class="mt-1">{{ kpi.icon }}</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Inventory & Status Charts -->
      <div class="mb-8">
        <v-row>
          <v-col cols="12" md="4">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Distribución por Estado</div>
              <v-chart class="chart" :option="statusOption" autoresize />
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Animales Activos por Edad</div>
              <v-chart class="chart" :option="ageGroupOption" autoresize />
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Métricas por Sexo</div>
              <v-chart class="chart" :option="sexDemographicsOption" autoresize />
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Lifecycle & Reproduction -->
      <div class="mb-8">
        <v-row>
          <v-col cols="12" md="6">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Embudo de Ciclo de Vida</div>
              <v-chart class="chart" :option="lifecycleFunnelOption" autoresize />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Nacimientos en el Tiempo</div>
              <v-chart class="chart" :option="birthsOverTimeOption" autoresize />
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Mothers Performance Table -->
      <div class="mb-8">
        <v-card border flat class="rounded-xl pa-4">
          <v-row align="center" no-gutters class="mb-4">
            <v-col>
              <div class="text-subtitle-1 font-weight-bold">Desempeño de Madres (> 2 años)</div>
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="filters.motherOffspring"
                :items="['Todas', '0 Crías', '1+ Crías']"
                label="Filtrar por crías"
                density="compact"
                variant="outlined"
                hide-details
              ></v-select>
            </v-col>
          </v-row>
          <v-data-table
            :headers="motherTableHeaders"
            :items="mothersTableData"
            :sort-by="[{ key: 'ultimoPartoDays', order: 'asc' }]"
            density="compact"
            class="elevation-0"
          >
            <template v-slot:item.name="{ item }">
              <router-link :to="`/livestock/${item.id}`" class="text-decoration-none font-weight-bold text-primary">
                {{ item.name }}
              </router-link>
            </template>

            <template v-slot:item.totalCrias="{ item }">
              <v-avatar size="28" color="blue-lighten-4" class="text-blue-darken-3 font-weight-bold">
                {{ item.totalCrias }}
              </v-avatar>
            </template>

            <template v-slot:item.ultimoPartoDays="{ item }">
              {{ item.ultimoParto }}
            </template>

            <template v-slot:item.vendidas="{ item }">
              <span class="text-success font-weight-bold">{{ item.vendidas }}</span>
            </template>

            <template v-slot:item.bajas="{ item }">
              <span class="text-error font-weight-bold">{{ item.bajas }}</span>
            </template>
          </v-data-table>
        </v-card>
      </div>
    </div>

    <!-- 2. FINANCIAL VIEW -->
    <div v-else>
      <!-- KPIs Financial -->
      <div class="mb-8">
        <div class="text-overline mb-2 text-primary font-weight-bold">Métricas Financieras</div>
        <v-row dense>
          <v-col v-for="kpi in financialKpis" :key="kpi.title" cols="6" sm="4" md="3">
            <v-card border flat class="rounded-lg h-100">
              <v-card-text class="pa-3">
                <div class="text-caption text-grey-darken-1 text-truncate">{{ kpi.title }}</div>
                <div class="text-h6 font-weight-bold" :class="kpi.color">{{ kpi.value }}</div>
                <v-icon :color="kpi.iconColor" size="18" class="mt-1">{{ kpi.icon }}</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Financial Analysis Charts -->
      <div class="mb-8">
        <v-row>
          <v-col cols="12" md="8">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Flujo de Caja (Ingresos vs Gastos)</div>
              <v-chart class="chart" :option="cashFlowOption" autoresize />
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Gastos por Categoría</div>
              <v-chart class="chart" :option="expensesByCategoryOption" autoresize />
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div class="mb-8">
        <v-row>
          <v-col cols="12" md="6">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Ingresos vs Gastos Totales</div>
              <v-chart class="chart" :option="incomeVsExpenseOption" autoresize />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card border flat class="rounded-xl pa-4 h-100">
              <div class="text-subtitle-1 font-weight-bold mb-4">Valor del Inventario Activo</div>
              <v-chart class="chart" :option="inventoryValueOption" autoresize />
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useLivestockStore } from '../stores/livestock'
import { useBreedsStore } from '../stores/breeds'
import { useExpensesStore } from '../stores/expenses'

// ECharts
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, FunnelChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  MarkPointComponent,
  MarkLineComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  FunnelChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  MarkPointComponent,
  MarkLineComponent,
  DataZoomComponent
])

provide(THEME_KEY, 'light')

const livestockStore = useLivestockStore()
const breedsStore = useBreedsStore()
const expensesStore = useExpensesStore()

const dashboardView = ref('cattle')

const filters = ref({
  breed: 'Todas',
  sex: 'Todos',
  status: 'Todos',
  motherOffspring: 'Todas'
})

onMounted(async () => {
  await livestockStore.loadAnimals()
  await breedsStore.loadBreeds()
  await expensesStore.loadExpenses()
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

// ---- HELPERS ----
const calculateAgeMonths = (dob: string | null | undefined, endDate: Date = new Date()) => {
  if (!dob) return 0
  const birth = new Date(dob)
  const diffTime = endDate.getTime() - birth.getTime()
  if (diffTime < 0) return 0
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return Math.floor(diffDays / 30.44)
}

const calculateAgeDays = (dob: string | null | undefined, endDate: Date = new Date()) => {
  if (!dob) return 0
  const birth = new Date(dob)
  const diffTime = endDate.getTime() - birth.getTime()
  if (diffTime < 0) return 0
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}

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
        //const start = new Date(a.acquisition_date)
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

// ---- MOTHERS TABLE ----
const motherTableHeaders = ref([
  { title: 'Madre', key: 'name', sortable: true, align: 'start' as const },
  { title: 'Total Crías', key: 'totalCrias', sortable: true, align: 'center' as const },
  { title: 'Último Parto', key: 'ultimoPartoDays', sortable: true, align: 'center' as const },
  { title: 'Vendidas', key: 'vendidas', sortable: true, align: 'center' as const },
  { title: 'Bajas', key: 'bajas', sortable: true, align: 'center' as const },
])

const mothersTableData = computed(() => {
  let mothers = livestockStore.animals
    .filter(a => a.sex === 'Hembra' && a.date_of_birth && calculateAgeMonths(a.date_of_birth) >= 24)
  
  const mapped = mothers.map(mother => {
    const offspring = livestockStore.animals.filter(o => String(o.motherId) === String(mother.id))
    
    const offspringSorted = [...offspring]
      .filter(o => o.date_of_birth)
      .sort((a, b) => new Date(b.date_of_birth).getTime() - new Date(a.date_of_birth).getTime())
    
    const lastBirthDate = offspringSorted.length > 0 ? offspringSorted[0].date_of_birth : null
    
    let lastBirthStr = '-'
    let lastBirthDays = 999999 // For sorting (large number means long ago or never)
    if (lastBirthDate) {
      const months = calculateAgeMonths(lastBirthDate)
      const days = calculateAgeDays(lastBirthDate)
      lastBirthStr = `${months}m (${days}d)`
      lastBirthDays = days
    }

    return {
      id: mother.id,
      name: mother.name || mother.number || mother.mark || 'Sin nombre',
      totalCrias: offspring.length,
      ultimoParto: lastBirthStr,
      ultimoPartoDays: lastBirthDays,
      vendidas: offspring.filter(o => o.status === 'Vendido').length,
      bajas: offspring.filter(o => o.status === 'Muerto').length
    }
  })

  if (filters.value.motherOffspring === '0 Crías') {
    return mapped.filter(m => m.totalCrias === 0)
  } else if (filters.value.motherOffspring === '1+ Crías') {
    return mapped.filter(m => m.totalCrias >= 1)
  }

  return mapped
})

// ---- KPI COMPUTATIONS (FINANCIAL) ----
const financialKpis = computed(() => {
  const expenses = expensesStore.expenses
  const totalIncome = expenses.filter(e => e.type === 'Ingreso').reduce((acc, e) => acc + e.amount, 0)
  const totalExpense = expenses.filter(e => e.type === 'Gasto').reduce((acc, e) => acc + e.amount, 0)
  const netBalance = totalIncome - totalExpense
  
  const inventoryValue = livestockStore.animals
    .filter(a => a.status === 'Activo')
    .reduce((acc, a) => acc + (a.acquisition_price || 0), 0)
  
  return [
    { title: 'Ingresos Totales', value: formatCurrency(totalIncome), icon: 'mdi-cash-plus', color: 'text-green', iconColor: 'green' },
    { title: 'Gastos Totales', value: formatCurrency(totalExpense), icon: 'mdi-cash-minus', color: 'text-red', iconColor: 'red' },
    { title: 'Balance Neto', value: formatCurrency(netBalance), icon: 'mdi-finance', color: netBalance >= 0 ? 'text-green' : 'text-red', iconColor: netBalance >= 0 ? 'green' : 'red' },
    { title: 'Valor Inventario', value: formatCurrency(inventoryValue), icon: 'mdi-warehouse', color: 'text-orange', iconColor: 'orange' },
  ]
})

// ---- CHARTS LOGIC (CATTLE) ----

const statusOption = computed(() => {
  const stats = { Activo: 0, Vendido: 0, Muerto: 0 }
  filteredAnimals.value.forEach(a => { if (stats[a.status as keyof typeof stats] !== undefined) stats[a.status as keyof typeof stats]++ })
  
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: stats.Activo, name: 'Activo', itemStyle: { color: '#4caf50' } },
        { value: stats.Vendido, name: 'Vendido', itemStyle: { color: '#2196f3' } },
        { value: stats.Muerto, name: 'Muerto', itemStyle: { color: '#f44336' } }
      ]
    }]
  }
})

const ageGroupOption = computed(() => {
  const groups = { '0-1 año': 0, '1-2 años': 0, '2+ años': 0 }
  const now = new Date()
  filteredAnimals.value.filter(a => a.status === 'Activo').forEach(a => {
    if (!a.date_of_birth) return
    const dob = new Date(a.date_of_birth)
    const ageY = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    if (ageY < 1) groups['0-1 año']++
    else if (ageY < 2) groups['1-2 años']++
    else groups['2+ años']++
  })
  
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Object.keys(groups) },
    yAxis: { type: 'value' },
    series: [{ data: Object.values(groups), type: 'bar', itemStyle: { color: '#8e24aa' } }]
  }
})

const sexDemographicsOption = computed(() => {
  const m = filteredAnimals.value.filter(a => a.sex === 'Macho').length
  const f = filteredAnimals.value.filter(a => a.sex === 'Hembra').length
  
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: m, name: 'Macho', itemStyle: { color: '#2196f3' } },
        { value: f, name: 'Hembra', itemStyle: { color: '#e91e63' } }
      ]
    }]
  }
})

const lifecycleFunnelOption = computed(() => {
  const total = filteredAnimals.value.length
  const active = filteredAnimals.value.filter(a => a.status === 'Activo').length
  const sold = filteredAnimals.value.filter(a => a.status === 'Vendido').length
  const dead = filteredAnimals.value.filter(a => a.status === 'Muerto').length

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [
      {
        name: 'Embudo de Ciclo de Vida',
        type: 'funnel',
        left: '10%',
        width: '80%',
        data: [
          { value: total, name: 'Adquiridos' },
          { value: active, name: 'Activos' },
          { value: sold, name: 'Vendidos' },
          { value: dead, name: 'Bajas' }
        ]
      }
    ]
  }
})

const birthsOverTimeOption = computed(() => {
  const births: Record<string, number> = {}
  filteredAnimals.value
    .filter(a => a.acquisition_type === "Nacimiento")
    .forEach(a => {
      if (!a.date_of_birth) return
      const d = new Date(a.date_of_birth)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      births[key] = (births[key] || 0) + 1
    })
    
  const months = Object.keys(births).sort()
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{ data: months.map(m => births[m]), type: 'line', smooth: true, itemStyle: { color: '#009688' } }]
  }
})

// ---- CHARTS LOGIC (FINANCIAL) ----

const cashFlowOption = computed(() => {
  const expenses = expensesStore.expenses
  const incomesByMonth: Record<string, number> = {}
  const expensesByMonth: Record<string, number> = {}
  
  expenses.forEach(e => {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (e.type === 'Ingreso') incomesByMonth[key] = (incomesByMonth[key] || 0) + e.amount
    else expensesByMonth[key] = (expensesByMonth[key] || 0) + e.amount
  })
  
  const allMonths = [...new Set([...Object.keys(incomesByMonth), ...Object.keys(expensesByMonth)])].sort()
  
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ingresos', 'Gastos'] },
    xAxis: { type: 'category', data: allMonths },
    yAxis: { type: 'value' },
    series: [
      { name: 'Ingresos', type: 'bar', data: allMonths.map(m => incomesByMonth[m] || 0), itemStyle: { color: '#66bb6a' } },
      { name: 'Gastos', type: 'bar', data: allMonths.map(m => expensesByMonth[m] || 0), itemStyle: { color: '#ef5350' } }
    ]
  }
})

const expensesByCategoryOption = computed(() => {
  const categories: Record<string, number> = {}
  expensesStore.expenses.filter(e => e.type === 'Gasto').forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount
  })
  
  return {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: Object.entries(categories).map(([name, value]) => ({ name, value }))
    }]
  }
})

const incomeVsExpenseOption = computed(() => {
  const totalIncome = expensesStore.expenses.filter(e => e.type === 'Ingreso').reduce((acc, e) => acc + e.amount, 0)
  const totalExpense = expensesStore.expenses.filter(e => e.type === 'Gasto').reduce((acc, e) => acc + e.amount, 0)
  
  return {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: totalIncome, name: 'Ingresos', itemStyle: { color: '#66bb6a' } },
        { value: totalExpense, name: 'Gastos', itemStyle: { color: '#ef5350' } }
      ]
    }]
  }
})

const inventoryValueOption = computed(() => {
  const animals = livestockStore.animals.filter(a => a.status === 'Activo')
  const valuesByMonth: Record<string, number> = {}
  
  animals.forEach(a => {
    if (!a.acquisition_date) return
    const d = new Date(a.acquisition_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    valuesByMonth[key] = (valuesByMonth[key] || 0) + (a.acquisition_price || 0)
  })
  
  const months = Object.keys(valuesByMonth).sort()
  let runningTotal = 0
  const cumulativeData = months.map(m => {
    runningTotal += valuesByMonth[m]
    return runningTotal
  })
  
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{ data: cumulativeData, type: 'line', areaStyle: {}, itemStyle: { color: '#ff9800' } }]
  }
})

</script>

<style scoped>
.chart {
  height: 350px;
}
.min-vh-100 {
  min-height: 100vh;
}
</style>
