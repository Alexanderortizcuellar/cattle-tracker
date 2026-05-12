<template>
  <v-row align="center" class="mb-6">
    <v-col cols="12">
      <v-card variant="flat" class="pa-2 rounded-lg bg-white border">
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-select
              v-model="internalFilters.breed"
              :items="['Todas', ...breedOptions]"
              label="Raza"
              density="compact"
              variant="outlined"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="internalFilters.sex"
              :items="['Todos', 'Macho', 'Hembra']"
              label="Sexo"
              density="compact"
              variant="outlined"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="internalFilters.status"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: {
    breed: string
    sex: string
    status: string
  }
  breedOptions: string[]
}>()

const emit = defineEmits(['update:modelValue'])

const internalFilters = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>
