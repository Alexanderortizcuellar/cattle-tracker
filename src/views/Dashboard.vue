<template>
  <v-container fluid class="pa-3 pa-md-6 bg-grey-lighten-5 h-100">
    
    <div class="mb-4 mb-md-6">
      <h2 class="text-h5 text-md-h4 font-weight-bold text-grey-darken-3">
        Dashboard
      </h2>
      <p class="text-body-2 text-subtitle-1 text-grey-darken-1">
        Resumen del hato {{ loading ? '(Cargando...)' : '' }}
      </p>
    </div>

    <v-row dense>
      <v-col
        v-for="metric in metrics"
        :key="metric.title"
        cols="6" sm="6" md="3"
      >
        <v-card :color="metric.color" class="text-white rounded-xl elevation-3 h-100">
          <v-card-text class="d-flex flex-column align-center justify-center py-3 py-md-6">
            <v-icon :size="mobile ? 28 : 48" class="mb-2">{{ metric.icon }}</v-icon>
            <div class="font-weight-bold" :class="mobile ? 'text-h5' : 'text-h4'">
              {{ metric.value }}
            </div>
            <div class="text-caption text-md-subtitle-1 text-center opacity-90 text-truncate w-100">
              {{ metric.title }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2 mt-md-4">
      <v-col cols="12" md="6">
        <v-card class="rounded-xl elevation-2 pa-3 pa-md-4 h-100">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Distribución por Raza</h3>
          <div style="height: 300px; position: relative;">
            <Bar v-if="hasData" :data="breedData" :options="barChartOptions as any" />
            <div v-else class="d-flex align-center justify-center h-100 text-grey">
               Sin datos registrados
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="rounded-xl elevation-2 pa-3 pa-md-4 h-100">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Distribución por Sexo</h3>
          <div style="height: 300px; position: relative;">
             <div class="mx-auto h-100" style="max-width: 400px;">
                <Pie v-if="hasData" :data="sexData" :options="pieChartOptions as any" />
             </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2 mt-md-4">
      <v-col cols="12">
        <v-card class="rounded-xl elevation-2 pa-3 pa-md-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Evolución de Ingresos</h3>
          <div style="height: 250px; position: relative;">
            <Line v-if="hasData" :data="timelineData" :options="lineChartOptions as any" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div class="mt-6 mb-4">
        <h3 class="text-subtitle-2 text-grey-darken-1 mb-2 px-1">Estados del Ganado</h3>
        <v-row dense>
          <v-col
            v-for="status in animalsByStatus"
            :key="status.status"
            cols="12" sm="4"
          >
            <v-card border flat class="rounded-lg">
                <v-list-item density="comfortable">
                    <template v-slot:prepend>
                        <v-avatar :color="status.colorBg" size="32" class="font-weight-bold" :class="status.colorText">
                            {{ status.count }}
                        </v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-medium">
                        {{ status.status }}
                    </v-list-item-title>
                </v-list-item>
            </v-card>
          </v-col>
        </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify' // Importante para detectar móvil
import { useLivestockStore } from '../stores/livestock'

// Importar Chart.js y vue-chartjs
import { Bar, Pie, Line } from 'vue-chartjs'
import type { ChartOptions } from 'chart.js'
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  BarElement, ArcElement, LineElement,
  CategoryScale, LinearScale, PointElement, Filler
} from 'chart.js'

ChartJS.register(
  Title, Tooltip, Legend, BarElement, ArcElement,
  LineElement, CategoryScale, LinearScale, PointElement, Filler
)

// --- CONFIGURACIÓN ---
const { mobile } = useDisplay()
const livestockStore = useLivestockStore()
const loading = ref(false)

// Cargar datos al iniciar (CRUCIAL para que no salga vacío)
onMounted(async () => {
    loading.value = true
    await livestockStore.loadAnimals()
    loading.value = false
})

const hasData = computed(() => livestockStore.animals.length > 0)

// ---- MÉTRICAS PRINCIPALES (Solo Livestock) ----
const totalAnimals = computed(() => livestockStore.animals.length)
const activeAnimals = computed(() => livestockStore.animals.filter(a => a.status === 'Activo').length)

// Calculamos razas únicas basándonos en los animales existentes (ya que no tenemos breedsStore)
const uniqueBreedsCount = computed(() => {
    const breeds = new Set(livestockStore.animals.map(a => a.breed).filter(b => b))
    return breeds.size
})

const metrics = computed(() => [
  { title: 'Total Animales', value: totalAnimals.value, icon: 'mdi-cow', color: 'blue-darken-2' },
  { title: 'Activos', value: activeAnimals.value, icon: 'mdi-check-decagram', color: 'teal-darken-1' },
  { title: 'Razas Únicas', value: uniqueBreedsCount.value, icon: 'mdi-dna', color: 'purple-darken-1' },
  // Placeholder para contactos si lo implementas a futuro
  { title: 'Lotes', value: 'N/A', icon: 'mdi-layers-triple', color: 'orange-darken-3' },
])

// ---- DATA DE GRÁFICAS ----

// 1. Razas
const breedData = computed(() => {
  const counts: Record<string, number> = {}
  livestockStore.animals.forEach(a => {
    const raza = a.breed || 'Sin Especificar'
    counts[raza] = (counts[raza] || 0) + 1
  })
  return {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(counts),
      backgroundColor: '#42A5F5',
      borderRadius: 4
    }]
  }
})

// 2. Sexo
const sexData = computed(() => {
  const m = livestockStore.animals.filter(a => a.sex === 'Macho').length
  const f = livestockStore.animals.filter(a => a.sex === 'Hembra').length
  return {
    labels: ['Machos', 'Hembras'],
    datasets: [{
      data: [m, f],
      backgroundColor: ['#2196F3', '#EC407A']
    }]
  }
})

// 3. Timeline (Fechas)
const timelineData = computed(() => {
  const counts: Record<string, number> = {}
  
  // Ordenamos los animales por fecha para que la gráfica tenga sentido cronológico
  const sortedAnimals = [...livestockStore.animals].sort((a, b) => 
    new Date(a.acquisition_date).getTime() - new Date(b.acquisition_date).getTime()
  )

  sortedAnimals.forEach(a => {
    if (!a.acquisition_date) return
    const d = new Date(a.acquisition_date)
    // Formato corto: "Nov 24"
    const key = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
    counts[key] = (counts[key] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Registros',
      data: Object.values(counts),
      borderColor: '#66BB6A',
      backgroundColor: 'rgba(102, 187, 106, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: mobile.value ? 2 : 4
    }]
  }
})

// 4. Estados (Con colores visuales)
const animalsByStatus = computed(() => {
  const c: Record<string, number> = { 'Activo': 0, 'Vendido': 0, 'Muerto': 0 }
  livestockStore.animals.forEach(a => { if (c[a.status] !== undefined) c[a.status]++ })
  
  return [
      { status: 'Activo', count: c['Activo'], colorBg: 'green-lighten-5', colorText: 'text-green-darken-2' },
      { status: 'Vendido', count: c['Vendido'], colorBg: 'blue-lighten-5', colorText: 'text-blue-darken-2' },
      { status: 'Muerto', count: c['Muerto'], colorBg: 'red-lighten-5', colorText: 'text-red-darken-2' }
  ]
})

// ---- OPCIONES DE GRÁFICAS RESPONSIVE ----
const commonOptions = computed<ChartOptions>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
        // Ocultar leyenda en móvil para ahorrar espacio, mostrar abajo en desktop
        display: !mobile.value, 
        position: 'bottom' 
    }
  }
}))

const barChartOptions = computed(() => ({
  ...commonOptions.value,
  scales: {
    y: { beginAtZero: true, grid: { display: false } },
    x: { grid: { display: false }, ticks: { display: !mobile.value } } // Ocultar etiquetas X en móvil si hay muchas
  }
}))

const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12 } }
  }
}))

const lineChartOptions = computed(() => ({
  ...commonOptions.value,
  scales: {
    y: { beginAtZero: true, border: { display: false } },
    x: { grid: { display: false } }
  }
}))

</script>

<style scoped>
/* Estilos opcionales para fuentes específicas si las usas */
</style>