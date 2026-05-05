<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">Razas</h1>
        <v-btn
          color="primary"
          @click="openDialog()"
          prepend-icon="mdi-plus"
          class="rounded-lg"
        >
          <span class="d-none d-sm-inline">Agregar Raza</span>
          <v-icon class="d-inline d-sm-none">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2" class="rounded-lg overflow-hidden">
      <v-card-text class="pa-4">
        <v-text-field
          v-model="search"
          label="Buscar razas..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-4"
          bg-color="white"
        ></v-text-field>

        <v-data-table
          :headers="headers"
          :items="breedsStore.breeds"
          :search="search"
          hover
          class="elevation-0 border rounded-lg"
        >
          <template v-slot:item.actions="{ item }">
            <div class="d-flex ga-1 justify-end">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                color="primary"
                size="x-small"
                @click="openDialog(item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                size="x-small"
                @click="confirmDelete(item)"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editMode ? 'Editar Raza' : 'Nueva Raza' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="formData.name"
              label="Nombre *"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="formData.code"
              label="Código *"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="formData.origin_country"
              label="País de Origen *"
              :rules="[rules.required]"
              variant="outlined"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveBreed">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar esta raza?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteBreed">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBreedsStore } from '../stores/breeds'
import type { Breed } from '../types'

const breedsStore = useBreedsStore()

const search = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const currentId = ref<string | undefined>()

const form = ref()
onMounted(() => {
  breedsStore.loadBreeds()
})

const formData = ref<Breed>({
  name: '',
  code: '',
  origin_country: '',
})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Código', key: 'code' },
  { title: 'País de Origen', key: 'origin_country' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const rules = {
  required: (v: string) => !!v || 'Este campo es requerido',
}

const openDialog = (breed?: Breed) => {
  if (breed && breed.id) {
    editMode.value = true
    currentId.value = breed.id
    formData.value = { ...breed }
  } else {
    editMode.value = false
    currentId.value = undefined
    formData.value = {
      name: '',
      code: '',
      origin_country: '',
    }
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  form.value?.reset()
}

const saveBreed = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  if (editMode.value && currentId.value) {
    breedsStore.updateBreed(currentId.value.toString(), formData.value)
  } else {
    breedsStore.addBreed(formData.value)
  }

  closeDialog()
}

const confirmDelete = (breed: Breed) => {
  currentId.value = breed.id
  deleteDialog.value = true
}

const deleteBreed = () => {
  if (currentId.value) {
    breedsStore.deleteBreed(currentId.value.toString())
  }
  deleteDialog.value = false
}
</script>
