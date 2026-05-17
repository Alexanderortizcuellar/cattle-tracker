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

    <v-card elevation="2" class="rounded-lg overflow-hidden">
      <div class="pa-4">
        <v-row align="center" dense>
          <!-- Search Field -->
          <v-col cols="12" md="6" lg="7">
            <v-text-field
              v-model="livestockStore.filters.search"
              label="Buscar nombre, marca, número..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              bg-color="white"
            >
              <template v-slot:append-inner v-if="mobile">
                <v-btn
                  icon="mdi-filter-variant"
                  variant="text"
                  density="compact"
                  color="primary"
                  @click="livestockStore.filters.showFilters = !livestockStore.filters.showFilters"
                ></v-btn>
              </template>
            </v-text-field>
          </v-col>

          <!-- Actions Row -->
          <v-col cols="12" md="6" lg="5" class="d-flex align-center ga-3 mt-2 mt-md-0">
            <!-- View Toggle -->
            <v-btn-toggle
              v-model="livestockStore.filters.viewMode"
              mandatory
              color="primary"
              variant="tonal"
              density="compact"
              class="rounded-lg border-sm"
              style="height: 40px; overflow: hidden"
            >
              <v-btn value="grid" icon="mdi-view-grid" width="48"></v-btn>
              <v-btn value="table" icon="mdi-view-list" width="48"></v-btn>
            </v-btn-toggle>

            <v-spacer class="d-flex d-md-none"></v-spacer>

            <!-- New Animal Button -->
            <v-btn
              color="primary"
              elevation="2"
              @click="openDialog()"
              prepend-icon="mdi-plus"
              class="flex-grow-1 flex-md-grow-0 rounded-lg"
              height="40"
            >
              <span class="d-none d-sm-inline">Nuevo Animal</span>
              <v-icon class="d-inline d-sm-none">mdi-plus</v-icon>
            </v-btn>

            <!-- Desktop Filter Toggle -->
            <v-btn
              v-if="!mobile"
              icon="mdi-filter-variant"
              variant="tonal"
              :color="livestockStore.filters.showFilters ? 'primary' : 'grey-darken-1'"
              @click="livestockStore.filters.showFilters = !livestockStore.filters.showFilters"
              class="rounded-lg"
              height="40"
              width="40"
            ></v-btn>
          </v-col>
        </v-row>
      </div>

      <v-divider v-if="!mobile || livestockStore.filters.showFilters"></v-divider>

      <!-- Filters Section -->
      <v-expand-transition>
        <div v-show="!mobile || livestockStore.filters.showFilters">
          <v-card-text class="bg-grey-lighten-5 pt-4 pb-2">
            <v-row dense>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="livestockStore.filters.breed"
                  label="Raza"
                  :items="breedOptions"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="6" sm="3">
                <v-select
                  v-model="livestockStore.filters.sex"
                  label="Sexo"
                  :items="['Macho', 'Hembra']"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="6" sm="3">
                <v-select
                  v-model="livestockStore.filters.status"
                  label="Estado"
                  :items="['Activo', 'Vendido', 'Muerto']"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="livestockStore.filters.feedingStage"
                  label="Etapa"
                  :items="['Potrero', 'Leche']"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="livestockStore.filters.ageRange"
                  label="Edad"
                  :items="['< 1 año', '1 - 2 años', '2 - 3 años', '> 3 años']"
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  clearable
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="livestockStore.filters.acquisitionType"
                  label="Adquisición"
                  :items="['Compra', 'Nacimiento', 'Donación', 'Negocio']"
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

      <v-card-text class="bg-grey-lighten-5 pa-0 pa-sm-4">
        <!-- GRID VIEW -->
        <v-row v-if="livestockStore.filters.viewMode === 'grid'">
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
              @click="$router.push(`/livestock/${animal.id}`)"
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
                    ><v-icon size="14" class="mr-1">mdi-cake-variant</v-icon
                    >{{ getAge(animal.date_of_birth) }}</span
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
        </v-row>

        <!-- TABLE VIEW -->
        <v-card v-else border flat class="rounded-lg overflow-hidden">
          <v-data-table
            :headers="tableHeaders"
            :items="filteredAnimals"
            hover
            class="elevation-0"
            @click:row="navigateToProfile"
          >
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  :icon="
                    item.sex === 'Macho'
                      ? 'mdi-gender-male'
                      : 'mdi-gender-female'
                  "
                  :color="item.sex === 'Macho' ? 'blue' : 'pink'"
                  size="18"
                  class="mr-2"
                ></v-icon>
                <div>
                  <div class="font-weight-bold">
                    {{ item.name || "Sin Nombre" }}
                  </div>
                  <div class="text-caption text-grey">{{ item.number }}</div>
                </div>
              </div>
            </template>
            <template v-slot:item.ageMonths="{ item }">
              {{ getAge(item.date_of_birth) }}
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="x-small"
                label
                variant="tonal"
                class="font-weight-bold"
              >
                {{ item.status }}
              </v-chip>
            </template>
            <template v-slot:item.acquisition_price="{ item }">
              ${{ item.acquisition_price?.toLocaleString() || "0" }}
            </template>
          </v-data-table>
        </v-card>

        <v-row v-if="filteredAnimals.length === 0">
          <v-col cols="12" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-2">mdi-cow-off</v-icon>
            <div class="text-h6 text-grey mt-2">No se encontraron animales</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <AnimalFormDialog
      v-model="dialog"
      :animal="editMode ? formData : null"
      :loading="saving"
      @save="handleSave"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useLivestockStore } from "../stores/livestock";
import { useBreedsStore } from "../stores/breeds";
import { useContactsStore } from "../stores/contacts";
import { useExpensesStore } from "../stores/expenses";
import type { Animal } from "../types";
import AnimalFormDialog from "../components/AnimalFormDialog.vue";
import { calculateAgeMonths } from "../utils/dashboardHelpers";

const router = useRouter();
const { mobile } = useDisplay();

const navigateToProfile = (_: any, { item }: { item: Animal }) => {
  router.push(`/livestock/${item.id}`);
};
import { syncAnimalExpenses } from '../utils/expenseSync';

const livestockStore = useLivestockStore();
const breedsStore = useBreedsStore();
const contactsStore = useContactsStore();
const expensesStore = useExpensesStore();

const dialog = ref(false);
const editMode = ref(false);
const formData = ref<Animal | null>(null);
const saving = ref(false);

const tableHeaders = [
  { title: "Animal", key: "name", sortable: true },
  { title: "Marca", key: "mark", sortable: true },
  { title: "Raza", key: "breed", sortable: true },
  { title: "Sexo", key: "sex", sortable: true },
  { title: "Edad", key: "ageMonths", sortable: true },
  { title: "Estado", key: "status", sortable: true },
  {
    title: "Costo",
    key: "acquisition_price",
    align: "end" as const,
    sortable: true,
  },
];

onMounted(() => {
  livestockStore.loadAnimals();
  breedsStore.loadBreeds();
  contactsStore.loadContacts();
  expensesStore.loadExpenses();
  expensesStore.loadAssociations();
});

const breedOptions = computed(() => breedsStore.breeds.map((b) => b.name));

const filteredAnimals = computed(() => {
  let animals = livestockStore.animals.map(a => ({
    ...a,
    ageMonths: calculateAgeMonths(a.date_of_birth)
  }));
  const f = livestockStore.filters;

  if (f.breed)
    animals = animals.filter((a) => a.breed === f.breed);
  if (f.sex)
    animals = animals.filter((a) => a.sex === f.sex);
  if (f.status)
    animals = animals.filter((a) => a.status === f.status);
  if (f.feedingStage)
    animals = animals.filter((a) => a.feeding_stage === f.feedingStage);
  if (f.ageRange) {
    animals = animals.filter((a) => {
      const age = a.ageMonths;
      if (f.ageRange === '< 1 año') return age < 12;
      if (f.ageRange === '1 - 2 años') return age >= 12 && age < 24;
      if (f.ageRange === '2 - 3 años') return age >= 24 && age < 36;
      if (f.ageRange === '> 3 años') return age >= 36;
      return true;
    });
  }
  if (f.acquisitionType)
    animals = animals.filter((a) => a.acquisition_type === f.acquisitionType);
  if (f.search) {
    const q = f.search.toLowerCase();
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
  if (animal && animal.id) {
    editMode.value = true;
    formData.value = { ...animal };
  } else {
    editMode.value = false;
    formData.value = null;
  }
  dialog.value = true;
};

const handleSave = async (data: Animal) => {
  saving.value = true;
  try {
    let animalId = data.id as string;
    if (editMode.value && animalId) {
      await livestockStore.updateAnimal(animalId, data);
    } else {
      animalId = await livestockStore.addAnimal(data);
    }

    // --- AUTOMATIC EXPENSES LOGIC ---
    await syncAnimalExpenses(animalId, data);

    dialog.value = false;
  } catch (error) {
    console.error("Error saving animal:", error);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id: string | number) => {
  saving.value = true;
  try {
    await livestockStore.deleteAnimal(id);
    dialog.value = false;
  } catch (error) {
    console.error("Error deleting animal:", error);
  } finally {
    saving.value = false;
  }
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
