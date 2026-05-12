<template>
  <v-card border flat class="rounded-xl pa-4">
    <div class="text-subtitle-1 font-weight-bold mb-4">Desempeño de Madres (> 2 años)</div>
    
    <v-row dense class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Buscar madre (Nombre/Número/Marca)"
          density="compact"
          variant="outlined"
          hide-details
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="statusFilter"
          :items="['Todos', 'Activo', 'Vendido', 'Muerto']"
          label="Estado de la madre"
          density="compact"
          variant="outlined"
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="motherOffspringFilter"
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
        <div class="d-flex flex-column">
          <router-link :to="`/livestock/${item.id}`" class="text-decoration-none font-weight-bold text-primary">
            {{ item.name }}
          </router-link>
          <span class="text-caption text-grey">{{ item.number || item.mark || '' }}</span>
        </div>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
          size="x-small"
          :color="getStatusColor(item.status)"
          variant="flat"
          class="font-weight-bold"
        >
          {{ item.status }}
        </v-chip>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLivestockStore } from '../../stores/livestock'
import { calculateAgeMonths, calculateAgeDays } from '../../utils/dashboardHelpers'

const livestockStore = useLivestockStore()
const motherOffspringFilter = ref('Todas')
const statusFilter = ref('Activo')
const searchQuery = ref('')

const motherTableHeaders = [
  { title: 'Madre', key: 'name', sortable: true, align: 'start' as const },
  { title: 'Estado', key: 'status', sortable: true, align: 'center' as const },
  { title: 'Total Crías', key: 'totalCrias', sortable: true, align: 'center' as const },
  { title: 'Último Parto', key: 'ultimoPartoDays', sortable: true, align: 'center' as const },
  { title: 'Vendidas', key: 'vendidas', sortable: true, align: 'center' as const },
  { title: 'Bajas', key: 'bajas', sortable: true, align: 'center' as const },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Activo': return 'success'
    case 'Vendido': return 'info'
    case 'Muerto': return 'error'
    default: return 'grey'
  }
}

const mothersTableData = computed(() => {
  let mothers = livestockStore.animals.filter(a => {
    const isAdultFemale = a.sex === 'Hembra' && a.date_of_birth && calculateAgeMonths(a.date_of_birth) >= 24
    const matchesStatus = statusFilter.value === 'Todos' || a.status === statusFilter.value
    
    const searchLower = searchQuery.value?.toLowerCase() || ''
    const matchesSearch = !searchLower || 
      (a.name || '').toLowerCase().includes(searchLower) ||
      (a.number || '').toLowerCase().includes(searchLower) ||
      (a.mark || '').toLowerCase().includes(searchLower)
    
    return isAdultFemale && matchesStatus && matchesSearch
  })
  
  const mapped = mothers.map(mother => {
    const offspring = livestockStore.animals.filter(o => String(o.motherId) === String(mother.id))
    
    const offspringSorted = [...offspring]
      .filter(o => o.date_of_birth)
      .sort((a, b) => new Date(b.date_of_birth).getTime() - new Date(a.date_of_birth).getTime())
    
    const lastBirthDate = offspringSorted.length > 0 ? offspringSorted[0].date_of_birth : null
    
    let lastBirthStr = '-'
    let lastBirthDays = 999999
    if (lastBirthDate) {
      const months = calculateAgeMonths(lastBirthDate)
      const days = calculateAgeDays(lastBirthDate)
      lastBirthStr = `${months}m (${days}d)`
      lastBirthDays = days
    }

    return {
      id: mother.id,
      name: mother.name || mother.number || mother.mark || 'Sin nombre',
      number: mother.number,
      mark: mother.mark,
      status: mother.status,
      totalCrias: offspring.length,
      ultimoParto: lastBirthStr,
      ultimoPartoDays: lastBirthDays,
      vendidas: offspring.filter(o => o.status === 'Vendido').length,
      bajas: offspring.filter(o => o.status === 'Muerto').length
    }
  })

  if (motherOffspringFilter.value === '0 Crías') {
    return mapped.filter(m => m.totalCrias === 0)
  } else if (motherOffspringFilter.value === '1+ Crías') {
    return mapped.filter(m => m.totalCrias >= 1)
  }

  return mapped
})
</script>
