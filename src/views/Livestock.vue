<template>
  <div>
    <v-row class="mb-4 mb-md-6">
      <v-col cols="12">
        <h1 class="text-h4 text-md-h3 font-weight-bold text-grey-darken-3">
          Gestión de Ganado
        </h1>
        <p class="text-body-1 text-md-h6 text-grey-darken-1 mt-1">
          Administra y rastrea tu hato
        </p>
      </v-col>
    </v-row>

    <v-card elevation="2" class="rounded-lg">
      <div class="d-flex flex-column flex-md-row align-center pa-4 ga-3">
        <v-text-field
          v-model="search"
          label="Buscar nombre, marca..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1 w-100"
          bg-color="white"
        >
          <template v-slot:append-inner v-if="mobile">
            <v-btn
              icon="mdi-filter-variant"
              variant="text"
              density="compact"
              color="primary"
              @click="showFilters = !showFilters"
            ></v-btn>
          </template>
        </v-text-field>

        <div class="d-none d-md-flex align-center ga-2">
          <v-file-input
            v-model="csvFile"
            label="Cargar CSV"
            accept=".csv"
            hide-details
            prepend-inner-icon="mdi-upload"
            density="compact"
            variant="outlined"
            style="width: 200px"
            @change="handleCsvUpload"
          ></v-file-input>

          <v-btn
            color="secondary"
            variant="tonal"
            @click="downloadCsvTemplate"
            prepend-icon="mdi-download"
          >
            Plantilla
          </v-btn>

          <v-btn
            color="primary"
            elevation="2"
            @click="openDialog()"
            prepend-icon="mdi-cow"
          >
            Nuevo Animal
          </v-btn>
        </div>

        <div class="d-flex d-md-none w-100 justify-space-between align-center">
          <span class="text-caption text-grey"
            >{{ filteredAnimals.length }} resultados</span
          >

          <div class="d-flex ga-2">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  variant="text"
                  color="grey-darken-1"
                ></v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="triggerFileInput">
                  <template v-slot:prepend
                    ><v-icon>mdi-upload</v-icon></template
                  >
                  <v-list-item-title>Cargar CSV</v-list-item-title>
                </v-list-item>
                <v-list-item @click="downloadCsvTemplate">
                  <template v-slot:prepend
                    ><v-icon>mdi-download</v-icon></template
                  >
                  <v-list-item-title>Bajar Plantilla</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-btn color="primary" size="small" @click="openDialog()">
              <v-icon start>mdi-plus</v-icon>
              Agregar
            </v-btn>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref="hiddenFileInput"
        class="d-none"
        accept=".csv"
        @change="
          (e: any) => {
            csvFile = e.target.files[0];
            handleCsvUpload();
          }
        "
      />

      <v-progress-linear
        v-if="loadingCsv"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <v-divider v-if="!mobile || showFilters"></v-divider>

      <v-expand-transition>
        <div v-show="!mobile || showFilters">
          <v-card-text class="bg-grey-lighten-5 pt-4 pb-2">
            <v-row dense>
              <v-col cols="12" sm="4">
                <v-select
                  v-model="filterBreed"
                  label="Raza"
                  :items="breedOptions"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="6" sm="4">
                <v-select
                  v-model="filterSex"
                  label="Sexo"
                  :items="['Macho', 'Hembra']"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="6" sm="4">
                <v-select
                  v-model="filterStatus"
                  label="Estado"
                  :items="['Activo', 'Vendido', 'Muerto']"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </div>
      </v-expand-transition>

      <v-card-text class="bg-grey-lighten-5">
        <v-row>
          <v-col
            v-for="animal in filteredAnimals"
            :key="animal.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="cattle-card mx-auto"
              elevation="1"
              rounded="lg"
              hover
              @click="openDialog(animal)"
            >
              <div
                class="d-flex justify-space-between align-center pa-3 bg-white"
              >
                <div>
                  <div
                    class="text-subtitle-1 font-weight-bold text-truncate"
                    style="max-width: 180px"
                  >
                    {{ animal.name || "Sin Nombre" }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ animal.number }} • {{ animal.mark }}
                  </div>
                </div>
                <v-avatar
                  size="36"
                  :color="
                    animal.sex === 'Macho' ? 'blue-lighten-5' : 'pink-lighten-5'
                  "
                >
                  <v-icon
                    :color="animal.sex === 'Macho' ? 'blue' : 'pink'"
                    size="20"
                  >
                    {{
                      animal.sex === "Macho"
                        ? "mdi-gender-male"
                        : "mdi-gender-female"
                    }}
                  </v-icon>
                </v-avatar>
              </div>

              <v-divider></v-divider>

              <v-card-text class="pa-3 pt-2">
                <div class="d-flex justify-space-between align-center mb-2">
                  <v-chip
                    size="x-small"
                    variant="flat"
                    color="grey-lighten-3"
                    class="text-grey-darken-3 font-weight-medium"
                  >
                    {{ animal.breed }}
                  </v-chip>
                  <v-chip
                    :color="getStatusColor(animal.status)"
                    size="x-small"
                    label
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ animal.status }}
                  </v-chip>
                </div>

                <div
                  class="d-flex justify-space-between text-caption text-grey-darken-1"
                >
                  <span
                    ><v-icon size="14" class="mr-1">mdi-cake-variant</v-icon>
                    {{ getAge(animal.date_of_birth) }}</span
                  >
                  <span
                    v-if="animal.acquisition_price"
                    class="text-success font-weight-medium"
                  >
                    ${{ animal.acquisition_price.toLocaleString() }}
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            v-if="filteredAnimals.length === 0"
            class="text-center py-8"
          >
            <v-icon size="64" color="grey-lighten-2">mdi-cow-off</v-icon>
            <div class="text-h6 text-grey mt-2">No se encontraron animales</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="dialog"
      max-width="800px"
      :fullscreen="mobile"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar color="white" elevation="1">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{
            editMode ? "Editar Animal" : "Nuevo Animal"
          }}</v-toolbar-title>
          <v-toolbar-items>
            <v-btn variant="text" color="primary" @click="saveAnimal"
              >Guardar</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="pa-4 bg-grey-lighten-5">
          <v-form ref="form">
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

            <v-card elevation="0" border class="pa-4 mb-4">
              <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
                Detalles & Estado
              </div>
              <v-row dense>
                <v-col cols="12" md="6">
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
                <v-col cols="12" md="6">
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
            <v-expand-transition>
              <div v-show="formData.status === 'Vendido'">
                <v-card elevation="0" border class="pa-4 mb-4 bg-white">
                  <div class="text-subtitle-2 font-weight-bold text-error mb-3">
                    Detalles de la Venta
                  </div>
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.buyer_name"
                        label="Comprador *"
                        :rules="[
                          rules.requiredIfStatus(
                            'Vendido',
                            'Este campo es obligatorio si está vendido',
                          ),
                        ]"
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
                          rules.requiredIfStatus(
                            'Vendido',
                            'Este campo es obligatorio si está vendido',
                          ),
                          rules.nonNegativeStatus,
                        ]"
                        variant="outlined"
                        prefix="$"
                        density="comfortable"
                        bg-color="white"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-expand-transition>

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
                        :rules="[
                          rules.requiredIfStatus(
                            'Muerto',
                            'Este campo es obligatorio si está muerto',
                          ),
                        ]"
                        variant="outlined"
                        density="comfortable"
                        bg-color="white"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.death_reason"
                        label="Causa de Muerte *"
                        :rules="[
                          rules.requiredIfStatus(
                            'Muerto',
                            'Este campo es obligatorio si está muerto',
                          ),
                        ]"
                        variant="outlined"
                        density="comfortable"
                        bg-color="white"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-expand-transition>
            <v-card elevation="0" border class="pa-4">
              <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
                Adquisición
              </div>
              <v-row dense>
                <v-col cols="6">
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

                <v-col cols="6">
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
                <v-col cols="12">
                  <v-select
                    v-if="formData.acquisition_type === 'Nacimiento'"
                    v-model="formData.motherId"
                    :items="
                      livestockStore.animals.filter((a) => a.sex === 'Hembra')
                    "
                    item-title="name"
                    item-value="id"
                    label="Madre"
                    :rules="[rules.requiredIfMother]"
                  ></v-select>
                </v-col>
                <v-col cols="12">
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

            <div class="mt-6 mb-4" v-if="editMode">
              <v-btn
                block
                color="error"
                variant="tonal"
                prepend-icon="mdi-delete"
                @click="confirmDelete(formData)"
              >
                Eliminar Registro
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar Animal?</v-card-title>
        <v-card-text class="text-body-2">
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false" variant="plain">Cancelar</v-btn>
          <v-btn color="error" @click="deleteAnimal">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useDisplay } from "vuetify"; // Importante para responsive
import Papa from "papaparse";
import { useLivestockStore } from "../stores/livestock";
import { useBreedsStore } from "../stores/breeds";
import type { Animal } from "../types";

// UTILIDADES RESPONSIVE
const { mobile } = useDisplay();
const showFilters = ref(false); // Controla visibilidad de filtros en móvil
const hiddenFileInput = ref<HTMLInputElement | null>(null); // Referencia al input file oculto

// ... Resto de lógica idéntica (Stores, Funciones CSV, etc.) ...
const csvFile = ref<File | null>(null);
const loadingCsv = ref(false);

// Función auxiliar para disparar el input file desde el menú móvil
const triggerFileInput = () => {
  hiddenFileInput.value?.click();
};

const downloadCsvTemplate = () => {
  const headers = [
    "mark",
    "number",
    "name",
    "sex",
    "date_of_birth",
    "breed",
    "acquisition_type",
    "acquisition_date",
    "acquisition_price",
    "status",
    "notes",
  ];
  const csvContent = headers.join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "plantilla_animales.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleCsvUpload = async () => {
  if (!csvFile.value) return;
  loadingCsv.value = true;

  Papa.parse(csvFile.value, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const data = results.data as Record<string, any>[];
      try {
        await insertBulkToFirestore(data);
        // Notificación simple en lugar de alert para mejor UX (opcional)
        alert("✅ Carga masiva completada");
      } catch (err) {
        console.error(err);
        alert("❌ Error durante la carga masiva");
      } finally {
        loadingCsv.value = false;
        csvFile.value = null;
      }
    },
  });
};

async function insertBulkToFirestore(data: any[]) {
  const CHUNK_SIZE = 500;
  const promises: Promise<void>[] = [];
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const batchPromises = chunk.map(async (row) => {
      const formatted = {
        mark: row.mark || "",
        number: row.number || "",
        name: row.name || "",
        sex: row.sex || "Hembra",
        date_of_birth: row.date_of_birth || "",
        breed: row.breed || "",
        acquisition_type: row.acquisition_type || "Compra",
        acquisition_date: row.acquisition_date || "",
        acquisition_price: Number(row.acquisition_price) || 0,
        status: row.status || "Activo",
        notes: row.notes || "",

        // 🆕 CAMPOS DE VENTA (Añadidos en la solicitud anterior)
        buyer_name: row.buyer_name || "",
        sale_price: Number(row.sale_price) || 0,

        // 🆕 CAMPOS DECESO (Añadidos en la solicitud anterior)
        death_reason: row.death_reason || "",
        death_date: row.death_date || "",
      };
      await livestockStore.addAnimal(formatted);
    });
    promises.push(Promise.all(batchPromises).then(() => undefined));
  }
  await Promise.all(promises);
  await livestockStore.loadAnimals();
}

const isGeneratingName = ref(false);
const livestockStore = useLivestockStore();
const breedsStore = useBreedsStore();

const search = ref("");
const filterBreed = ref("");
const filterSex = ref("");
const filterStatus = ref("");
const dialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
const currentId = ref<string | number | undefined>();
const form = ref();

onMounted(() => {
  livestockStore.loadAnimals();
});

const formData = ref<Animal>({
  mark: "",
  number: "",
  name: "",
  sex: "Macho",
  date_of_birth: "",
  breed: "",
  acquisition_type: "Compra",
  acquisition_date: "",
  acquisition_price: 0,
  status: "Activo",
  notes: "",
  // CAMPOS DE VENTA
  buyer_name: "",
  sale_price: 0,
  // 🆕 CAMPOS DECESO
  death_reason: "",
  death_date: "",
  motherId: null,
});

const rules = {
  // Regla simple que requiere un valor (para campos fijos)
  required: (v: string | number) => !!v || v === 0 || "Requerido",
  nonNegative: (v: number) => v >= 0 || "Inválido",
  nonNegativeStatus: (v: any) =>
    v === null || v === undefined || v === "" || Number(v) >= 0 || "Inválido",
  // 🆕 Regla Condicional de Requerido
  requiredIfStatus:
    (status: "Vendido" | "Muerto", message: string) => (v: string | number) => {
      // Si el estado *no* coincide con el requerido, siempre es válido.
      if (formData.value.status !== status) {
        return true;
      }
      // Si el estado *coincide*, aplica la regla "Requerido".
      return !!v || v === 0 || message;
    },
  requiredIfMother: (v: string | number) => {
    if (formData.value.acquisition_type !== "Nacimiento") {
      return true;
    }
    return !!v || "Se necesita la madre si es por nacimiento";
  },
};

const generateName = async () => {
  try {
    isGeneratingName.value = true;
    const gender = formData.value.sex === "Macho" ? "male" : "female";
    const response = await fetch(
      `https://randomuser.me/api/?gender=${gender}&nat=es`,
    );
    const data = await response.json();
    const { first, last } = data.results[0].name;
    formData.value.name = `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`;
  } catch (error) {
    console.error("Error generando nombre:", error);
  } finally {
    isGeneratingName.value = false;
  }
};

watch(
  () => formData.value.sex,
  (newSex, oldSex) => {
    if (!editMode.value && newSex !== oldSex) {
      generateName();
    }
  },
);

const breedOptions = computed(() => breedsStore.breeds.map((b) => b.name));

const filteredAnimals = computed(() => {
  let animals = livestockStore.animals;
  if (filterBreed.value)
    animals = animals.filter((a) => a.breed === filterBreed.value);
  if (filterSex.value)
    animals = animals.filter((a) => a.sex === filterSex.value);
  if (filterStatus.value)
    animals = animals.filter((a) => a.status === filterStatus.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    animals = animals.filter((a) =>
      [a.name, a.mark, a.number, a.breed].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }
  return animals;
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "Activo":
      return "success";
    case "Vendido":
      return "info";
    case "Muerto":
      return "error";
    default:
      return "grey";
  }
};

const getAge = (birth: string) => {
  if (!birth) return "-";
  const d = new Date(birth);
  const now = new Date();
  let y = now.getFullYear() - d.getFullYear();
  let m = now.getMonth() - d.getMonth();
  if (m < 0) {
    y--;
    m += 12;
  }
  return y > 0 ? `${y}a ${m}m` : `${m}m`;
};

const openDialog = (animal?: Animal) => {
  console.log(livestockStore.animals);
  if (animal && animal.id) {
    editMode.value = true;
    currentId.value = animal.id;
    formData.value = { ...animal };
  } else {
    editMode.value = false;
    currentId.value = undefined;
    formData.value = {
      mark: "",
      number: "",
      name: "",
      sex: "Hembra",
      date_of_birth: "",
      breed: "",
      acquisition_type: "Compra",
      acquisition_date: "",
      acquisition_price: 0,
      status: "Activo",
      notes: "",
    };
  }
  dialog.value = true;
};

const confirmDelete = (animal: Animal) => {
  // Si llamamos desde el form (formData), pasamos el ID correcto
  currentId.value = animal.id;
  deleteDialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  form.value?.reset();
};

const saveAnimal = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  if (editMode.value && currentId.value)
    livestockStore.updateAnimal(currentId.value, formData.value);
  else livestockStore.addAnimal(formData.value);
  console.log(formData.value);
  closeDialog();
};

const deleteAnimal = () => {
  if (currentId.value) livestockStore.deleteAnimal(currentId.value);
  deleteDialog.value = false;
  closeDialog();
};
</script>

<style scoped>
.cattle-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 1px solid #e0e0e0;
}

.cattle-card:hover {
  border-color: var(--v-primary-base);
  transform: translateY(-2px);
}
</style>
