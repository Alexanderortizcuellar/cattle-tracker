<template>
  <v-dialog v-model="show" max-width="800px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
        <v-icon start class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-cash-plus' }}</v-icon>
        <span class="text-h6">{{ isEditing ? 'Editar Registro' : 'Registrar Gasto' }}</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
      </v-card-title>

      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" sm="3">
              <v-btn-toggle
                v-model="formData.type"
                mandatory
                color="primary"
                variant="tonal"
                class="w-100"
                density="compact"
              >
                <v-btn value="Gasto" class="flex-grow-1">Gasto</v-btn>
                <v-btn value="Ingreso" class="flex-grow-1">Ingreso</v-btn>
              </v-btn-toggle>
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field
                v-model.number="formData.amount"
                label="Monto Total"
                prefix="$"
                type="number"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Monto es requerido']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="formData.category"
                label="Categoría"
                :items="categories"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Categoría es requerida']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="formData.date"
                label="Fecha"
                type="date"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Fecha es requerida']"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12">
              <v-btn-toggle
                v-model="formData.scope"
                mandatory
                color="primary"
                variant="tonal"
                class="w-100 mb-2"
                density="compact"
              >
                <v-btn value="Global" class="flex-grow-1">Gasto Global</v-btn>
                <v-btn value="Individual" class="flex-grow-1">Por Animal</v-btn>
              </v-btn-toggle>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Descripción"
                variant="outlined"
                density="compact"
                rows="2"
                :rules="[v => !!v || 'Descripción es requerida']"
                required
              ></v-textarea>
            </v-col>

            <!-- ANIMAL SELECTION (Conditional) -->
            <v-col cols="12" v-if="formData.scope === 'Individual'">
              <v-card variant="outlined" class="rounded-lg pa-3">
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="text-subtitle-2 font-weight-bold">Asociar Animales</div>
                  <div class="text-caption text-primary font-weight-bold" v-if="selectedAnimals.length">
                    {{ selectedAnimals.length }} seleccionados
                    <span v-if="formData.amount > 0">
                      (${{ (formData.amount / selectedAnimals.length).toLocaleString(undefined, {maximumFractionDigits: 2}) }} c/u)
                    </span>
                  </div>
                </div>

                <!-- Filters -->
                <v-row dense class="mb-2">
                  <v-col cols="4">
                    <v-select
                      v-model="filters.feeding_stage"
                      label="Etapa"
                      :items="['Potrero', 'Leche']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="filters.sex"
                      label="Sexo"
                      :items="['Macho', 'Hembra']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="filters.status"
                      label="Estado"
                      :items="['Activo', 'Vendido', 'Muerto']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    ></v-select>
                  </v-col>
                </v-row>

                <!-- Bulk Actions -->
                <div class="d-flex ga-2 mb-2">
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    @click="selectAll"
                  >
                    Seleccionar Filtrados ({{ filteredAnimals.length }})
                  </v-btn>
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="error"
                    @click="unselectAll"
                  >
                    Deseleccionar Filtrados
                  </v-btn>
                </div>

                <!-- Animal List -->
                <v-list
                  density="compact"
                  max-height="250"
                  class="overflow-y-auto border rounded"
                >
                  <v-list-item
                    v-for="animal in filteredAnimals"
                    :key="animal.id"
                    @click="toggleAnimal(animal.id as string)"
                  >
                    <template v-slot:prepend>
                      <v-checkbox-btn
                        :model-value="selectedAnimals.includes(animal.id as string)"
                        readonly
                      ></v-checkbox-btn>
                    </template>
                    <v-list-item-title>
                      {{ animal.number }} - {{ animal.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ animal.breed }} • {{ animal.sex }} • {{ animal.feeding_stage || 'N/A' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="filteredAnimals.length === 0">
                    <v-list-item-title class="text-center text-grey">
                      No se encontraron animales con estos filtros
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="grey-darken-1"
            class="px-4"
            @click="close"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="px-6 rounded-lg"
            type="submit"
            :loading="loading"
            :disabled="!valid || (formData.scope === 'Individual' && selectedAnimals.length === 0)"
          >
            Guardar Gasto
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import { useLivestockStore } from '../stores/livestock'
import type { Expense } from '../types'

const props = defineProps<{
  modelValue: boolean
  editData?: {
    expense: Expense
    animalIds: string[]
  } | null
}>()

const emit = defineEmits(['update:modelValue', 'save'])

const livestockStore = useLivestockStore()
const valid = ref(false)
const loading = ref(false)
const form = ref<any>(null)

const categories = ['Pastoreo', 'Alimento', 'Medicamento', 'Compra', 'Transporte', 'Mantenimiento', 'Mano de obra', 'Venta', 'Otro']

const isEditing = computed(() => !!props.editData)

const formData = ref<Expense>({
  amount: 0,
  date: new Date().toISOString().substr(0, 10),
  description: '',
  category: 'Otro',
  type: 'Gasto',
  scope: 'Global'
})

const selectedAnimals = ref<string[]>([])
const filters = reactive({
  feeding_stage: null as string | null,
  sex: null as string | null,
  status: 'Activo' as string | null
})

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filteredAnimals = computed(() => {
  return livestockStore.animals.filter(a => {
    if (filters.feeding_stage && a.feeding_stage !== filters.feeding_stage) return false
    if (filters.sex && a.sex !== filters.sex) return false
    if (filters.status && a.status !== filters.status) return false
    return true
  })
})

const toggleAnimal = (id: string) => {
  const index = selectedAnimals.value.indexOf(id)
  if (index > -1) {
    selectedAnimals.value.splice(index, 1)
  } else {
    selectedAnimals.value.push(id)
  }
}

const selectAll = () => {
  filteredAnimals.value.forEach(a => {
    if (a.id && !selectedAnimals.value.includes(a.id as string)) {
      selectedAnimals.value.push(a.id as string)
    }
  })
}

const unselectAll = () => {
  const filteredIds = filteredAnimals.value.map(a => a.id as string)
  selectedAnimals.value = selectedAnimals.value.filter(id => !filteredIds.includes(id))
}

const close = () => {
  show.value = false
  // Don't reset here, wait for modelValue watch
}

const resetForm = () => {
  if (form.value) form.value.reset()
  
  if (props.editData) {
    formData.value = { ...props.editData.expense }
    selectedAnimals.value = [...props.editData.animalIds]
  } else {
    formData.value = {
      amount: 0,
      date: new Date().toISOString().substr(0, 10),
      description: '',
      category: 'Otro',
      type: 'Gasto',
      scope: 'Global'
    }
    selectedAnimals.value = []
  }
  
  filters.feeding_stage = null
  filters.sex = null
  filters.status = 'Activo'
}

const save = async () => {
  if (!valid.value) return
  loading.value = true
  try {
    emit('save', { 
      expense: { ...formData.value }, 
      animalIds: formData.value.scope === 'Individual' ? [...selectedAnimals.value] : [] 
    })
    show.value = false
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

watch(() => props.editData, () => {
  if (props.modelValue) {
    resetForm()
  }
})
</script>
