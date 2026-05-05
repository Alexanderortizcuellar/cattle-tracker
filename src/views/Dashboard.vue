<template>
  <v-container fluid class="pa-3 pa-md-6 bg-grey-lighten-4 min-vh-100">
    <!-- Header & Global Filters -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" md="6">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-1">
          Panel de Control
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Análisis avanzado del hato y rentabilidad
        </p>
      </v-col>
      <v-col cols="12" md="6">
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

    <!-- 1. GLOBAL KPIs -->
    <div class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Métricas Globales</div>
      <v-row dense>
        <v-col v-for="kpi in kpis" :key="kpi.title" cols="6" sm="4" md="2">
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

    <!-- 2. FINANCIAL CHARTS -->
    <div class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Análisis Financiero</div>
      <v-row>
        <v-col cols="12" md="8">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Flujo de Caja y Ganancia Neta</div>
            <v-chart class="chart" :option="cashFlowOption" autoresize />
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Compras vs Ventas</div>
            <v-chart class="chart" :option="buySellOption" autoresize />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 3. INVENTORY & STATUS -->
    <div class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Inventario y Estado</div>
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
            <div class="text-subtitle-1 font-weight-bold mb-4">Valor del Inventario</div>
            <v-chart class="chart" :option="inventoryValueOption" autoresize />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 4. BREED & 5. SEX ANALYTICS -->
    <div class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Raza y Demografía</div>
      <v-row>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Rendimiento por Raza</div>
            <v-chart class="chart" :option="breedPerformanceOption" autoresize />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Métricas por Sexo</div>
            <v-chart class="chart" :option="sexDemographicsOption" autoresize />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 6. LIFECYCLE METRICS -->
    <div class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Ciclo de Vida</div>
      <v-row dense>
        <v-col v-for="life in lifecycleMetrics" :key="life.title" cols="12" sm="3">
          <v-card border flat class="rounded-lg">
            <v-card-text class="text-center">
              <div class="text-caption text-grey">{{ life.title }}</div>
              <div class="text-h5 font-weight-bold">{{ life.value }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-card border flat class="rounded-xl pa-4 mt-4">
        <div class="text-subtitle-1 font-weight-bold mb-4">Embudo de Ciclo de Vida</div>
        <v-chart class="chart" :option="lifecycleFunnelOption" autoresize />
      </v-card>
    </div>

    <!-- 7. REPRODUCTION -->
    <div v-if="reproEnabled" class="mb-8">
      <div class="text-overline mb-2 text-primary font-weight-bold">Reproducción</div>
      <v-row>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Nacimientos en el Tiempo</div>
            <v-chart class="chart" :option="birthsOverTimeOption" autoresize />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Productividad por Madre</div>
            <v-chart class="chart" :option="mothersOffspringOption" autoresize />
          </v-card>
        </v-col>
      </v-row>

      <!-- Female Performance Table -->
      <v-card border flat class="rounded-xl pa-4 mt-6">
        <div class="d-flex align-center mb-4 flex-wrap ga-4">
          <div class="text-subtitle-1 font-weight-bold">Rendimiento de Madres (> 2 años)</div>
          <v-spacer />
          <v-select
            v-model="motherStatusFilter"
            :items="['Todos', 'Activo', 'Vendido', 'Muerto']"
            label="Estado"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 150px"
          />
          <v-text-field
            v-model="motherSearch"
            append-inner-icon="mdi-magnify"
            label="Buscar Madre"
            single-line
            hide-details
            density="compact"
            variant="outlined"
            style="max-width: 250px"
          />
        </div>
        <v-data-table
          :headers="motherHeaders"
          :items="femalePerformanceData"
          :search="motherSearch"
          class="elevation-0 bg-transparent"
          hover
          density="comfortable"
        >
          <template v-slot:item.name="{ item }">
            <div class="font-weight-bold text-primary clickable-cell" style="cursor: pointer" @click="$router.push(`/livestock/${item.id}`)">
              {{ item.name }}
            </div>
            <div class="text-caption text-grey">{{ item.number }}</div>
          </template>
          <template v-slot:item.offspringCount="{ item }">
            <v-chip color="blue" size="small" variant="tonal" class="font-weight-bold">
              {{ item.offspringCount }}
            </v-chip>
          </template>
          <template v-slot:item.soldOffspring="{ item }">
            <span class="text-success font-weight-bold">{{ item.soldOffspring }}</span>
          </template>
          <template v-slot:item.deadOffspring="{ item }">
            <span :class="item.deadOffspring > 0 ? 'text-error font-weight-bold' : 'text-grey'">
              {{ item.deadOffspring }}
            </span>
          </template>
        </v-data-table>
      </v-card>
    </div>

  </v-container>
</template>

<script setup lang="ts">
// ... (rest of imports unchanged)
import { ref, computed, onMounted, provide } from 'vue'
import { useLivestockStore } from '../stores/livestock'
import { useBreedsStore } from '../stores/breeds'

// ECharts
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, FunnelChart } from 'echarts/charts'
// ... (rest of imports unchanged)
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

const filters = ref({
  breed: 'Todas',
  sex: 'Todos',
  status: 'Todos'
})

const motherSearch = ref('')
const motherStatusFilter = ref('Activo')
const motherHeaders = [
  { title: 'Madre', key: 'name', sortable: true },
  { title: 'Total Crías', key: 'offspringCount', align: 'center' as const, sortable: true },
  { title: 'Último Parto', key: 'timeSinceLastBirth', align: 'center' as const, sortable: true },
  { title: 'Vendidas', key: 'soldOffspring', align: 'center' as const, sortable: true },
  { title: 'Bajas', key: 'deadOffspring', align: 'center' as const, sortable: true },
]

onMounted(async () => {
  await livestockStore.loadAnimals()
  await breedsStore.loadBreeds()
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

const femalePerformanceData = computed(() => {
  const now = new Date()
  return livestockStore.animals.filter(a => {
    if (a.sex !== 'Hembra' || !a.date_of_birth) return false
    
    // Filtro por estado
    if (motherStatusFilter.value !== 'Todos' && a.status !== motherStatusFilter.value) return false

    const dob = new Date(a.date_of_birth)
    const ageY = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    return ageY > 2
  }).map(mother => {
    const motherOffspring = livestockStore.animals.filter(a => a.motherId === mother.id)
    const lastBirth = motherOffspring.length > 0 
      ? new Date(Math.max(...motherOffspring.map(o => new Date(o.date_of_birth).getTime())))
      : null
    
    let timeSinceLast = '-'
    if (lastBirth) {
      const diffDays = Math.floor((now.getTime() - lastBirth.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays < 30) timeSinceLast = `${diffDays}d`
      else timeSinceLast = `${Math.floor(diffDays / 30)}m (${diffDays}d)`
    }

    return {
      id: mother.id,
      name: mother.name || mother.number,
      number: mother.number,
      offspringCount: motherOffspring.length,
      timeSinceLastBirth: timeSinceLast,
      soldOffspring: motherOffspring.filter(o => o.status === 'Vendido').length,
      deadOffspring: motherOffspring.filter(o => o.status === 'Muerto').length
    }
  }).sort((a, b) => b.offspringCount - a.offspringCount)
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}

// ---- KPIs COMPUTATION ----
const kpis = computed(() => {
  const animals = filteredAnimals.value
  const total = animals.length
  const active = animals.filter(a => a.status === 'Activo').length
  const sold = animals.filter(a => a.status === 'Vendido').length
  const dead = animals.filter(a => a.status === 'Muerto').length
  
  const investment = animals.reduce((acc, a) => acc + (a.acquisition_price || 0), 0)
  const revenue = animals.reduce((acc, a) => acc + (a.sale_price || 0), 0)
  const profit = revenue - investment
  const roi = investment > 0 ? (profit / investment) * 100 : 0
  
  const inventoryValue = animals.filter(a => a.status === 'Activo').reduce((acc, a) => acc + (a.acquisition_price || 0), 0)
  
  const avgPurchase = total > 0 ? investment / total : 0
  const soldAnimals = animals.filter(a => a.status === 'Vendido')
  const avgSale = soldAnimals.length > 0 ? revenue / soldAnimals.length : 0
  
  return [
    { title: 'Total Animales', value: total, icon: 'mdi-cow', color: 'text-blue', iconColor: 'blue' },
    { title: 'Activos', value: active, icon: 'mdi-check-circle', color: 'text-success', iconColor: 'success' },
    { title: 'Vendidos', value: sold, icon: 'mdi-currency-usd', color: 'text-info', iconColor: 'info' },
    { title: 'Inversión Total', value: formatCurrency(investment), icon: 'mdi-cash-minus', color: 'text-red', iconColor: 'red' },
    { title: 'Ingresos Totales', value: formatCurrency(revenue), icon: 'mdi-cash-plus', color: 'text-green', iconColor: 'green' },
    { title: 'Utilidad Neta', value: formatCurrency(profit), icon: 'mdi-finance', color: profit >= 0 ? 'text-green' : 'text-red', iconColor: profit >= 0 ? 'green' : 'red' },
    { title: 'ROI', value: `${roi.toFixed(1)}%`, icon: 'mdi-trending-up', color: roi >= 0 ? 'text-green' : 'text-red', iconColor: roi >= 0 ? 'green' : 'red' },
    { title: 'Valor Inventario', value: formatCurrency(inventoryValue), icon: 'mdi-warehouse', color: 'text-orange', iconColor: 'orange' },
    { title: 'Prom. Compra', value: formatCurrency(avgPurchase), icon: 'mdi-tag', color: 'text-grey-darken-2', iconColor: 'grey' },
    { title: 'Prom. Venta', value: formatCurrency(avgSale), icon: 'mdi-tag-outline', color: 'text-grey-darken-2', iconColor: 'grey' },
    { title: 'Muertos', value: dead, icon: 'mdi-skull', color: 'text-black', iconColor: 'black' },
    { title: 'Prom. Utilidad', value: formatCurrency(sold > 0 ? profit / sold : 0), icon: 'mdi-equalizer', color: 'text-purple', iconColor: 'purple' },
  ]
})

// ---- CHARTS LOGIC ----

// Helper for grouping by month
const groupByMonth = (animals: any[], dateField: string, valueField: string) => {
  const groups: Record<string, number> = {}
  animals.forEach(a => {
    if (!a[dateField]) return
    const d = new Date(a[dateField])
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    groups[key] = (groups[key] || 0) + (a[valueField] || 0)
  })
  return groups
}

// 2. FINANCIAL CHARTS
const cashFlowOption = computed(() => {
  const animals = filteredAnimals.value
  const buys = groupByMonth(animals, 'acquisition_date', 'acquisition_price')
  const sells = groupByMonth(animals, 'sale_date', 'sale_price')
  
  const allMonths = [...new Set([...Object.keys(buys), ...Object.keys(sells)])].sort()
  
  const buyData = allMonths.map(m => -(buys[m] || 0))
  const sellData = allMonths.map(m => sells[m] || 0)
  const profitData = allMonths.map((m, _) => (buys[m] || 0) === 0 && (sells[m] || 0) === 0 ? 0 : (sells[m] || 0) - (buys[m] || 0))

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Compras', 'Ventas', 'Utilidad Mensual'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: allMonths },
    yAxis: { type: 'value' },
    series: [
      { name: 'Compras', type: 'bar', stack: 'total', data: buyData, itemStyle: { color: '#ef5350' } },
      { name: 'Ventas', type: 'bar', stack: 'total', data: sellData, itemStyle: { color: '#66bb6a' } },
      { name: 'Utilidad Mensual', type: 'line', data: profitData, itemStyle: { color: '#2196f3' } }
    ]
  }
})

const buySellOption = computed(() => {
  const investment = filteredAnimals.value.reduce((acc, a) => acc + (a.acquisition_price || 0), 0)
  const revenue = filteredAnimals.value.reduce((acc, a) => acc + (a.sale_price || 0), 0)
  
  return {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: investment, name: 'Inversión', itemStyle: { color: '#ef5350' } },
        { value: revenue, name: 'Ventas', itemStyle: { color: '#66bb6a' } }
      ],
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }
})

// 3. INVENTORY & STATUS
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

const inventoryValueOption = computed(() => {
  const buys = groupByMonth(filteredAnimals.value.filter(a => a.status === 'Activo'), 'acquisition_date', 'acquisition_price')
  const months = Object.keys(buys).sort()
  let runningTotal = 0
  const data = months.map(m => {
    runningTotal += buys[m]
    return runningTotal
  })
  
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{ data, type: 'line', areaStyle: {}, itemStyle: { color: '#ff9800' } }]
  }
})

// 4. BREED PERFORMANCE
const breedPerformanceOption = computed(() => {
  const stats: Record<string, { count: 0, investment: 0, revenue: 0, dead: 0 }> = {}
  filteredAnimals.value.forEach(a => {
    const b = a.breed || 'Desconocida'
    if (!stats[b]) stats[b] = { count: 0, investment: 0, revenue: 0, dead: 0 }
    stats[b].count++
    stats[b].investment += (a.acquisition_price || 0)
    stats[b].revenue += (a.sale_price || 0)
    if (a.status === 'Muerto') stats[b].dead++
  })
  
  const breeds = Object.keys(stats)
  const profits = breeds.map(b => stats[b].revenue - stats[b].investment)
  const mortality = breeds.map(b => (stats[b].dead / stats[b].count) * 100)
  
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ganancia', 'Tasa Mortalidad (%)'] },
    xAxis: { type: 'category', data: breeds },
    yAxis: [
      { type: 'value', name: 'Ganancia' },
      { type: 'value', name: 'Mortalidad', max: 100, axisLabel: { formatter: '{value}%' } }
    ],
    series: [
      { name: 'Ganancia', type: 'bar', data: profits, itemStyle: { color: '#00bcd4' } },
      { name: 'Tasa Mortalidad (%)', type: 'line', yAxisIndex: 1, data: mortality, itemStyle: { color: '#e91e63' } }
    ]
  }
})

// 5. SEX DEMOGRAPHICS
const sexDemographicsOption = computed(() => {
  const m = filteredAnimals.value.filter(a => a.sex === 'Macho')
  const f = filteredAnimals.value.filter(a => a.sex === 'Hembra')
  
  const mProfit = m.reduce((acc, a) => acc + (a.sale_price || 0) - (a.acquisition_price || 0), 0)
  const fProfit = f.reduce((acc, a) => acc + (a.sale_price || 0) - (a.acquisition_price || 0), 0)
  
  const now = new Date()
  const getAvgAge = (arr: any[]) => {
    if (arr.length === 0) return 0
    const ages = arr.filter(a => a.date_of_birth).map(a => (now.getTime() - new Date(a.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) // in months
    return ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0
  }
  
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ganancia Total', 'Edad Promedio (Meses)'] },
    xAxis: { type: 'category', data: ['Macho', 'Hembra'] },
    yAxis: [
      { type: 'value', name: 'Ganancia' },
      { type: 'value', name: 'Meses' }
    ],
    series: [
      { name: 'Ganancia Total', type: 'bar', data: [mProfit, fProfit], itemStyle: { color: '#3f51b5' } },
      { name: 'Edad Promedio (Meses)', type: 'line', yAxisIndex: 1, data: [getAvgAge(m), getAvgAge(f)], itemStyle: { color: '#ffeb3b' } }
    ]
  }
})

// 6. LIFECYCLE METRICS
const lifecycleMetrics = computed(() => {
  const active = filteredAnimals.value.filter(a => a.status === 'Activo')
  const sold = filteredAnimals.value.filter(a => a.status === 'Vendido')
  const dead = filteredAnimals.value.filter(a => a.status === 'Muerto')
  const total = filteredAnimals.value.length
  
  const now = new Date()
  const activeWithBirth = active.filter(a => a.date_of_birth)
  const avgAgeActive = activeWithBirth.length > 0 
    ? activeWithBirth.reduce((acc, a) => acc + (now.getTime() - new Date(a.date_of_birth).getTime()), 0) / activeWithBirth.length / (1000 * 60 * 60 * 24 * 365.25)
    : 0
    
  const mortalityRate = total > 0 ? (dead.length / total) * 100 : 0
  const soldWithDates = sold.filter(a => a.date_of_birth && a.sale_date)
  const avgAgeAtSale = soldWithDates.length > 0
    ? soldWithDates.reduce((acc, a) => acc + (new Date(a.sale_date!).getTime() - new Date(a.date_of_birth).getTime()), 0) / soldWithDates.length / (1000 * 60 * 60 * 24 * 365.25)
    : 0

  return [
    { title: 'Edad Promedio (Activos)', value: `${avgAgeActive.toFixed(1)} años` },
    { title: 'Edad Promedio al Vender', value: `${avgAgeAtSale.toFixed(1)} años` },
    { title: 'Tasa Mortalidad', value: `${mortalityRate.toFixed(1)}%` },
    { title: 'Tiempo Prom. en Finca', value: `${(avgAgeAtSale || avgAgeActive).toFixed(1)} años` }
  ]
})

const lifecycleFunnelOption = computed(() => {
  const total = filteredAnimals.value.length
  const active = filteredAnimals.value.filter(a => a.status === 'Activo').length
  const sold = filteredAnimals.value.filter(a => a.status === 'Vendido').length
  const dead = filteredAnimals.value.filter(a => a.status === 'Muerto').length

  return {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}%' },
    series: [
      {
        name: 'Embudo de Ciclo de Vida',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: total,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside' },
        labelLine: { show: false },
        itemStyle: { opacity: 0.7 },
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

// 7. REPRODUCTION
const reproEnabled = computed(() => filteredAnimals.value.some(a => a.motherId))

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
  const data = months.map(m => births[m])
  
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{ data, type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, itemStyle: { color: '#009688' } }]
  }
})

const mothersOffspringOption = computed(() => {
  const counts: Record<string, number> = {}
  filteredAnimals.value.forEach(a => {
    if (a.motherId) {
      counts[a.motherId] = (counts[a.motherId] || 0) + 1
    }
  })
  
  const sortedMothers = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10
    
  const names = sortedMothers.map(([id]) => {
    const mother = livestockStore.animals.find(a => a.id === id)
    return mother ? mother.name : `ID: ${id}`
  })
  const values = sortedMothers.map(([, count]) => count)
  
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{ data: values, type: 'bar', itemStyle: { color: '#ff9800' } }]
  }
})

</script>

<style scoped>
.chart {
  height: 300px;
}
.min-vh-100 {
  min-height: 100vh;
}
</style>
