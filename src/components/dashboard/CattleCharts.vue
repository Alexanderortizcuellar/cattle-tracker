<template>
  <div>
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
            <div class="text-subtitle-1 font-weight-bold mb-4">Nacimientos en el Tiempo (Mes)</div>
            <v-chart class="chart" :option="birthsOverTimeOption" autoresize />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card border flat class="rounded-xl pa-4 h-100">
            <div class="text-subtitle-1 font-weight-bold mb-4">Nacimientos por Año</div>
            <v-chart class="chart" :option="birthsPerYearOption" autoresize />
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'

const props = defineProps<{
  filteredAnimals: any[]
}>()

// ---- CHARTS LOGIC (CATTLE) ----

const statusOption = computed(() => {
  const stats = { Activo: 0, Vendido: 0, Muerto: 0 }
  props.filteredAnimals.forEach(a => { if (stats[a.status as keyof typeof stats] !== undefined) stats[a.status as keyof typeof stats]++ })
  
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
  props.filteredAnimals.filter(a => a.status === 'Activo').forEach(a => {
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
  const m = props.filteredAnimals.filter(a => a.sex === 'Macho').length
  const f = props.filteredAnimals.filter(a => a.sex === 'Hembra').length
  
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
  const total = props.filteredAnimals.length
  const active = props.filteredAnimals.filter(a => a.status === 'Activo').length
  const sold = props.filteredAnimals.filter(a => a.status === 'Vendido').length
  const dead = props.filteredAnimals.filter(a => a.status === 'Muerto').length

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
  props.filteredAnimals
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

  const birthsPerYearOption = computed(() => {
  const births: Record<string, number> = {}
  props.filteredAnimals
  .filter(a => a.acquisition_type === "Nacimiento")
  .forEach(a => {
    if (!a.date_of_birth) return
    const d = new Date(a.date_of_birth)
    const year = d.getFullYear().toString()
    births[year] = (births[year] || 0) + 1
  })

  const years = Object.keys(births).sort()
  return {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: years },
  yAxis: { type: 'value', minInterval: 1 },
  series: [{ data: years.map(y => births[y]), type: 'bar', itemStyle: { color: '#fb8c00' } }]
  }
  })
  </script>
<style scoped>
.chart {
  height: 350px;
}
</style>
