<template>
  <v-dialog
    v-model="internalShow"
    max-width="800px"
    :fullscreen="mobile"
    transition="dialog-bottom-transition"
    @click:outside="close"
  >
    <v-card>
      <v-toolbar color="white" elevation="1">
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{
          isEdit ? "Editar Animal" : "Nuevo Animal"
        }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn variant="text" color="primary" @click="save"
            >Guardar</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text class="pa-4 bg-grey-lighten-5">
        <v-form ref="form">
          <!-- Identificación -->
          <v-card elevation="0" border class="pa-4 mb-4">
            <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
              Identificación
            </div>
            <v-row dense>
              <v-col cols="6" md="6">
                <v-text-field
                  v-model="formData.mark"
                  label="Marca *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>
              <v-col cols="6" md="6">
                <v-text-field
                  v-model="formData.number"
                  label="Número *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Nombre *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  :loading="isGeneratingName"
                  :disabled="isGeneratingName"
                  append-inner-icon="mdi-refresh"
                  @click:append-inner="generateName"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formData.sex"
                  label="Sexo *"
                  :items="['Macho', 'Hembra']"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formData.breed"
                  label="Raza *"
                  :items="breedOptions"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>
            </v-row>
          </v-card>

          <!-- Detalles & Estado -->
          <v-card elevation="0" border class="pa-4 mb-4">
            <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
              Detalles & Estado
            </div>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.date_of_birth"
                  label="Fecha Nacimiento *"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>
              <v-col cols="6" md="4">
                <v-select
                  v-model="formData.feeding_stage"
                  label="Etapa de Alimentación"
                  :items="[
                    { title: 'Ninguno', value: null },
                    { title: 'Potrero', value: 'Potrero' },
                    { title: 'Leche', value: 'Leche' },
                  ]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  clearable
                />
              </v-col>
              <v-col cols="6" md="4">
                <v-select
                  v-model="formData.status"
                  label="Estado *"
                  :items="['Activo', 'Vendido', 'Muerto']"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>
            </v-row>
          </v-card>

          <!-- Detalles de la Venta (Condicional) -->
          <v-expand-transition>
            <div v-show="formData.status === 'Vendido'">
              <v-card elevation="0" border class="pa-4 mb-4 bg-white">
                <div class="text-subtitle-2 font-weight-bold text-error mb-3">
                  Detalles de la Venta
                </div>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.buyerId"
                      :items="buyerOptions"
                      item-title="name"
                      item-value="id"
                      label="Comprador *"
                      :rules="[rules.requiredIfStatus('Vendido', 'Este campo es obligatorio si está vendido')]"
                      variant="outlined"
                      density="comfortable"
                      bg-color="white"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="formData.sale_price"
                      label="Valor de la Venta *"
                      type="number"
                      :rules="[
                        rules.requiredIfStatus('Vendido', 'Este campo es obligatorio si está vendido'),
                        rules.nonNegativeStatus
                      ]"
                      variant="outlined"
                      prefix="$"
                      density="comfortable"
                      bg-color="white"
                    />
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      v-model="formData.sale_date"
                      label="Fecha de venta *"
                      type="date"
                      :rules="[rules.requiredIfStatus('Vendido', 'Este campo es obligatorio si está vendido')]"
                      variant="outlined"
                      density="comfortable"
                      bg-color="white"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </div>
          </v-expand-transition>

          <!-- Detalles de Deceso (Condicional) -->
          <v-expand-transition>
            <div v-show="formData.status === 'Muerto'">
              <v-card elevation="0" border class="pa-4 mb-4 bg-white">
                <div class="text-subtitle-2 font-weight-bold text-error mb-3">
                  Detalles de Deceso
                </div>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.death_date"
                      label="Fecha de Muerte *"
                      type="date"
                      :rules="[rules.requiredIfStatus('Muerto', 'Este campo es obligatorio si está muerto')]"
                      variant="outlined"
                      density="comfortable"
                      bg-color="white"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.death_reason"
                      label="Causa de Muerte *"
                      :rules="[rules.requiredIfStatus('Muerto', 'Este campo es obligatorio si está muerto')]"
                      variant="outlined"
                      density="comfortable"
                      bg-color="white"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </div>
          </v-expand-transition>

          <!-- Adquisición -->
          <v-card elevation="0" border class="pa-4">
            <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
              Adquisición
            </div>
            <v-row dense>
              <v-col
                :cols="formData.acquisition_type === 'Nacimiento' ? 12 : 6"
              >
                <v-select
                  v-model="formData.acquisition_type"
                  label="Tipo"
                  :items="['Compra', 'Nacimiento', 'Donación', 'Negocio']"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>

              <v-col
                cols="6"
                v-if="formData.acquisition_type !== 'Nacimiento'"
              >
                <v-text-field
                  v-model.number="formData.acquisition_price"
                  label="Costo"
                  type="number"
                  :rules="[rules.nonNegative]"
                  variant="outlined"
                  prefix="$"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>

              <v-col cols="12" v-if="formData.acquisition_type === 'Nacimiento'">
                <v-select
                  v-model="formData.motherId"
                  :items="motherOptions"
                  item-title="name"
                  item-value="id"
                  label="Madre"
                  :rules="[rules.requiredIfMother]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                ></v-select>
              </v-col>

              <v-col cols="12" v-if="formData.acquisition_type === 'Compra'">
                <v-select
                  v-model="formData.sellerId"
                  :items="sellerOptions"
                  item-title="name"
                  item-value="id"
                  label="Vendedor"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                v-if="formData.acquisition_type !== 'Nacimiento'"
              >
                <v-text-field
                  v-model="formData.acquisition_date"
                  label="Fecha Adquisición"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.notes"
                  label="Notas Adicionales"
                  variant="outlined"
                  rows="2"
                  auto-grow
                  density="comfortable"
                  bg-color="white"
                />
              </v-col>
            </v-row>
          </v-card>

          <!-- Eliminar (Solo en edición) -->
          <div class="mt-6 mb-4" v-if="isEdit">
            <v-btn
              block
              color="error"
              variant="tonal"
              prepend-icon="mdi-delete"
              @click="confirmDelete"
            >
              Eliminar Registro
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Diálogo de confirmación de eliminación -->
  <v-dialog v-model="deleteConfirmDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">¿Eliminar Animal?</v-card-title>
      <v-card-text class="text-body-2">
        Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="deleteConfirmDialog = false" variant="plain">Cancelar</v-btn>
        <v-btn color="error" @click="handleDelete">Eliminar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import type { Animal } from '../types';
import { useLivestockStore } from '../stores/livestock';
import { useBreedsStore } from '../stores/breeds';
import { useContactsStore } from '../stores/contacts';

const props = defineProps<{
  modelValue: boolean;
  animal?: Animal | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', animal: Animal): void;
  (e: 'delete', id: string | number): void;
}>();

const { mobile } = useDisplay();
const livestockStore = useLivestockStore();
const breedsStore = useBreedsStore();
const contactsStore = useContactsStore();

const form = ref();
const deleteConfirmDialog = ref(false);
const isGeneratingName = ref(false);

const initialFormData: Animal = {
  mark: '',
  number: '',
  name: '',
  sex: 'Hembra',
  date_of_birth: '',
  breed: '',
  acquisition_type: 'Compra',
  acquisition_date: '',
  acquisition_price: 0,
  sellerId: '',
  status: 'Activo',
  notes: '',
  buyerId: '',
  sale_date: '',
  sale_price: 0,
  death_reason: '',
  death_date: '',
  motherId: null,
};

const formData = ref<Animal>({ ...initialFormData });

const internalShow = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEdit = computed(() => !!props.animal?.id);

const breedOptions = computed(() => breedsStore.breeds.map(b => b.name));
const motherOptions = computed(() => livestockStore.animals.filter(a => a.sex === 'Hembra'));
const buyerOptions = computed(() => contactsStore.contacts.filter(c => c.type === 'Comprador' || c.type === 'Ambos'));
const sellerOptions = computed(() => contactsStore.contacts.filter(c => c.type === 'Vendedor' || c.type === 'Ambos'));

const rules = {
  required: (v: any) => !!v || v === 0 || 'Requerido',
  nonNegative: (v: number) => v >= 0 || 'Inválido',
  nonNegativeStatus: (v: any) => v === null || v === undefined || v === '' || Number(v) >= 0 || 'Inválido',
  requiredIfStatus: (status: string, message: string) => (v: any) => {
    if (formData.value.status !== status) return true;
    return !!v || v === 0 || message;
  },
  requiredIfMother: (v: any) => {
    if (formData.value.acquisition_type !== 'Nacimiento') return true;
    return !!v || 'Se necesita la madre si es por nacimiento';
  }
};

onMounted(() => {
  breedsStore.loadBreeds();
  contactsStore.loadContacts();
  if (livestockStore.animals.length === 0) {
    livestockStore.loadAnimals();
  }
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.animal) {
      formData.value = { ...initialFormData, ...props.animal };
    } else {
      formData.value = { ...initialFormData };
      generateName();
    }
  } else {
    form.value?.reset();
  }
});

watch(() => formData.value.sex, (newSex, oldSex) => {
  if (!isEdit.value && newSex !== oldSex) {
    generateName();
  }
});

watch(() => [formData.value.acquisition_type, formData.value.date_of_birth], ([type, birthDate]) => {
  if (type === 'Nacimiento' && birthDate) {
    formData.value.acquisition_date = birthDate as string;
    formData.value.acquisition_price = 0;
  }
});

watch(() => formData.value.status, (newStatus) => {
  if (newStatus !== 'Activo') {
    formData.value.feeding_stage = null;
  }
});

const generateName = async () => {
  try {
    isGeneratingName.value = true;
    const gender = formData.value.sex === 'Macho' ? 'male' : 'female';
    const response = await fetch(`https://randomuser.me/api/?gender=${gender}&nat=es`);
    const data = await response.json();
    const { first, last } = data.results[0].name;
    formData.value.name = `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`;
  } catch (error) {
    console.error('Error generando nombre:', error);
  } finally {
    isGeneratingName.value = false;
  }
};

const close = () => {
  internalShow.value = false;
};

const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  emit('save', { ...formData.value });
};

const confirmDelete = () => {
  deleteConfirmDialog.value = true;
};

const handleDelete = () => {
  if (props.animal?.id) {
    emit('delete', props.animal.id);
  }
  deleteConfirmDialog.value = false;
  close();
};
</script>
