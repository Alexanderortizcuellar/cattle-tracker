<template>
  <v-container v-if="animal">
    <!-- Header/Summary Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="$router.push('/livestock')"
          >
            Volver
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil"
            @click="openEditDialog"
          >
            Editar
          </v-btn>
        </div>
        
        <v-card elevation="2" class="rounded-lg overflow-hidden">
          <v-row no-gutters>
            <v-col cols="12" md="4" class="bg-primary d-flex flex-column align-center justify-center pa-6 text-white">
              <v-avatar size="120" color="white" class="mb-4">
                <v-icon size="80" :color="animal.sex === 'Macho' ? 'blue' : 'pink'">
                  {{ animal.sex === 'Macho' ? 'mdi-gender-male' : 'mdi-gender-female' }}
                </v-icon>
              </v-avatar>
              <h1 class="text-h4 font-weight-bold">{{ animal.name || 'Sin Nombre' }}</h1>
              <div class="text-h6 opacity-80">{{ animal.number }} • {{ animal.mark }}</div>
            </v-col>
            
            <v-col cols="12" md="8" class="pa-6">
              <v-row>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-grey">Raza</div>
                  <div class="text-subtitle-1 font-weight-bold">{{ animal.breed }}</div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-grey">Sexo</div>
                  <div class="text-subtitle-1 font-weight-bold">{{ animal.sex }}</div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-grey">Edad</div>
                  <div class="text-subtitle-1 font-weight-bold">{{ age }}</div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-caption text-grey">Estado</div>
                  <v-chip
                    :color="getStatusColor(animal.status)"
                    size="small"
                    label
                    variant="flat"
                    class="font-weight-bold mt-1"
                  >
                    {{ animal.status }}
                  </v-chip>
                </v-col>
                <v-col cols="12" sm="8" v-if="performanceIndicators.length > 0">
                  <div class="text-caption text-grey mb-1">Indicadores Clave</div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-tooltip
                      v-for="indicator in performanceIndicators"
                      :key="indicator.label"
                      :text="indicator.description"
                      location="top"
                    >
                      <template v-slot:activator="{ props }">
                        <v-chip
                          v-bind="props"
                          :color="indicator.color"
                          size="small"
                          variant="tonal"
                          class="font-weight-bold"
                          :prepend-icon="indicator.icon"
                        >
                          {{ indicator.label }}
                        </v-chip>
                      </template>
                    </v-tooltip>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Reproduction Section (For Mothers) -->
    <v-row v-if="animal.sex === 'Hembra'">
      <v-col cols="12">
        <v-card elevation="2" class="rounded-lg mb-6">
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-reproduction</v-icon>
            Reproducción
            <v-spacer></v-spacer>
            <v-chip color="primary" variant="flat">{{ offspring.length }} Crías</v-chip>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-0">
            <!-- Reproduction Metrics -->
            <v-row class="pa-4" dense>
              <v-col cols="12" sm="4">
                <v-card variant="outlined" class="pa-3 text-center">
                  <div class="text-caption text-grey">Edad al primer parto</div>
                  <div class="text-h6 font-weight-bold">{{ ageAtFirstBirth || '-' }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card variant="outlined" class="pa-3 text-center">
                  <div class="text-caption text-grey">Intervalo promedio</div>
                  <div class="text-h6 font-weight-bold">{{ averageBirthInterval || '-' }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card variant="outlined" class="pa-3 text-center">
                  <div class="text-caption text-grey">Días desde último parto</div>
                  <div class="text-h6 font-weight-bold" :class="{'text-error': isOverdue}">
                    {{ daysSinceLastBirth !== null ? `${daysSinceLastBirth} días` : '-' }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- Offspring Table -->
            <v-table class="mt-2">
              <thead>
                <tr>
                  <th class="text-left">Nombre/Número</th>
                  <th class="text-left">Fecha Nacimiento</th>
                  <th class="text-left">Estado</th>
                  <th class="text-left">Info Venta</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="child in offspring" 
                  :key="child.id" 
                  @click="$router.push(`/livestock/${child.id}`)"
                  class="clickable-row"
                >
                  <td>
                    <div class="font-weight-bold">{{ child.name || 'Sin Nombre' }}</div>
                    <div class="text-caption text-grey">{{ child.number }}</div>
                  </td>
                  <td>{{ child.date_of_birth }}</td>
                  <td>
                    <v-chip :color="getStatusColor(child.status)" size="x-small" label variant="tonal">
                      {{ child.status }}
                    </v-chip>
                  </td>
                  <td>
                    <span v-if="child.status === 'Vendido' && child.sale_price" class="text-success">
                      ${{ child.sale_price.toLocaleString() }}
                    </span>
                    <span v-else>-</span>
                  </td>
                </tr>
                <tr v-if="offspring.length === 0">
                  <td colspan="4" class="text-center py-4 text-grey">Sin registros de crías</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Financial Insights -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="rounded-lg mb-6">
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon color="success" class="mr-2">mdi-finance</v-icon>
            Análisis Financiero
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" sm="4">
                <div class="text-caption text-grey">Costo de Adquisición</div>
                <div class="text-h5 font-weight-bold">
                  ${{ animal.acquisition_price?.toLocaleString() || '0' }}
                </div>
                <div class="text-caption text-grey mt-1">
                  {{ animal.acquisition_type }} el {{ animal.acquisition_date }}
                </div>
                <div v-if="seller" class="mt-4">
                  <v-divider class="mb-2"></v-divider>
                  <div class="text-caption text-grey">Vendedor</div>
                  <div class="text-subtitle-2 font-weight-bold">{{ seller.name }}</div>
                  <div class="text-caption d-flex align-center" v-if="seller.phone">
                    <v-icon size="14" class="mr-1" color="grey">mdi-phone</v-icon>{{ seller.phone }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="4" v-if="animal.status === 'Vendido'">
                <div class="text-caption text-grey">Precio de Venta</div>
                <div class="text-h5 font-weight-bold text-success">
                  ${{ animal.sale_price?.toLocaleString() || '0' }}
                </div>
                <div class="text-caption text-grey mt-1">
                  Vendido el {{ animal.sale_date }}
                </div>
                <div v-if="buyer" class="mt-4">
                  <v-divider class="mb-2"></v-divider>
                  <div class="text-caption text-grey">Comprador</div>
                  <div class="text-subtitle-2 font-weight-bold">{{ buyer.name }}</div>
                  <div class="text-caption d-flex align-center" v-if="buyer.phone">
                    <v-icon size="14" class="mr-1" color="grey">mdi-phone</v-icon>{{ buyer.phone }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="4" v-if="animal.status === 'Vendido'">
                <div class="text-caption text-grey">Margen / ROI</div>
                <div class="text-h5 font-weight-bold" :class="financials.margin >= 0 ? 'text-success' : 'text-error'">
                  ${{ financials.margin?.toLocaleString() }} 
                  <span class="text-subtitle-1">({{ financials.roi }}%)</span>
                </div>
                <div class="text-caption text-grey mt-1">
                  En {{ financials.daysToSale }} días
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Analytics Section (Collapsible) -->
    <v-row v-if="animal.sex === 'Hembra' && offspring.length > 0">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel class="rounded-lg">
            <v-expansion-panel-title>
              <v-icon color="secondary" class="mr-2">mdi-chart-line</v-icon>
              Analítica Avanzada de Descendencia
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row class="pa-4">
                <v-col cols="12">
                  <div class="text-body-1 mb-6">
                    Este animal ha generado un valor total de 
                    <span class="text-success font-weight-bold">${{ totalOffspringValue.toLocaleString() }}</span> 
                    en ventas.
                  </div>
                </v-col>
                
                <v-col cols="12" md="6">
                  <div class="text-subtitle-2 font-weight-bold mb-2">Crecimiento Demográfico (Crías Acumuladas)</div>
                  <v-chart class="chart" :option="growthChartOption" autoresize />
                </v-col>
                
                <v-col cols="12" md="6">
                  <div class="text-subtitle-2 font-weight-bold mb-2">Evolución de Valor de Crías (Ventas)</div>
                  <v-chart class="chart" :option="valueChartOption" autoresize />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    
    <!-- Notes Section -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="rounded-lg mb-6">
          <v-card-title class="pa-4">
            <v-icon color="grey" class="mr-2">mdi-note-text</v-icon>
            Notas y Observaciones
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-4">
            {{ animal.notes || 'Sin notas registradas.' }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Animal Form Dialog -->
    <AnimalFormDialog
      v-model="editDialog"
      :animal="formData"
      @save="handleSave"
      @delete="handleDelete"
    />
  </v-container>
  
  <v-container v-else class="fill-height d-flex align-center justify-center">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLivestockStore } from '../stores/livestock';
import { useBreedsStore } from '../stores/breeds';
import { useContactsStore } from '../stores/contacts';
import type { Animal } from '../types';
import AnimalFormDialog from '../components/AnimalFormDialog.vue';

// ECharts
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);

provide(THEME_KEY, 'light');

const route = useRoute();
const router = useRouter();
const livestockStore = useLivestockStore();
const breedsStore = useBreedsStore();
const contactsStore = useContactsStore();

const editDialog = ref(false);
const formData = ref<Animal | null>(null);

onMounted(() => {
  if (livestockStore.animals.length === 0) {
    livestockStore.loadAnimals();
  }
  breedsStore.loadBreeds();
  contactsStore.loadContacts();
});

const animal = computed(() => {
  const id = route.params.id as string;
  return livestockStore.animals.find(a => a.id === id);
});

const seller = computed(() => {
  if (!animal.value?.sellerId) return null;
  return contactsStore.contacts.find(c => c.id === animal.value?.sellerId);
});

const buyer = computed(() => {
  if (!animal.value?.buyerId) return null;
  return contactsStore.contacts.find(c => c.id === animal.value?.buyerId);
});

const openEditDialog = () => {
  if (animal.value) {
    formData.value = { ...animal.value };
    editDialog.value = true;
  }
};

const handleSave = async (data: Animal) => {
  if (data.id) {
    await livestockStore.updateAnimal(data.id, data);
    editDialog.value = false;
  }
};

const handleDelete = async (id: string | number) => {
  await livestockStore.deleteAnimal(id);
  editDialog.value = false;
  router.push('/livestock');
};

const offspring = computed(() => {
  if (!animal.value) return [];
  return livestockStore.animals.filter(a => a.motherId === animal.value?.id);
});

const age = computed(() => {
  if (!animal.value?.date_of_birth) return '-';
  return calculateAge(animal.value.date_of_birth);
});

function calculateAge(birth: string) {
  const d = new Date(birth);
  const now = new Date();
  let y = now.getFullYear() - d.getFullYear();
  let m = now.getMonth() - d.getMonth();
  if (m < 0) {
    y--;
    m += 12;
  }
  return y > 0 ? `${y}a ${m}m` : `${m}m`;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Activo': return 'success';
    case 'Vendido': return 'info';
    case 'Muerto': return 'error';
    default: return 'grey';
  }
};

// Reproductive Metrics
const ageAtFirstBirth = computed(() => {
  if (offspring.value.length === 0 || !animal.value?.date_of_birth) return null;
  const birthDates = offspring.value
    .map(o => new Date(o.date_of_birth).getTime())
    .sort((a, b) => a - b);
  
  const firstBirth = new Date(birthDates[0]);
  const motherBirth = new Date(animal.value.date_of_birth);
  
  let y = firstBirth.getFullYear() - motherBirth.getFullYear();
  let m = firstBirth.getMonth() - motherBirth.getMonth();
  if (m < 0) {
    y--;
    m += 12;
  }
  return `${y}a ${m}m`;
});

const averageBirthInterval = computed(() => {
  if (offspring.value.length < 2) return null;
  const birthDates = offspring.value
    .map(o => new Date(o.date_of_birth).getTime())
    .sort((a, b) => a - b);
  
  let totalDiff = 0;
  for (let i = 1; i < birthDates.length; i++) {
    totalDiff += birthDates[i] - birthDates[i-1];
  }
  
  const avgDiffDays = Math.floor(totalDiff / (birthDates.length - 1) / (1000 * 60 * 60 * 24));
  return `${Math.floor(avgDiffDays / 30)} meses (${avgDiffDays} días)`;
});

const daysSinceLastBirth = computed(() => {
  if (offspring.value.length === 0) return null;
  const lastBirth = new Date(Math.max(...offspring.value.map(o => new Date(o.date_of_birth).getTime())));
  const now = new Date();
  return Math.floor((now.getTime() - lastBirth.getTime()) / (1000 * 60 * 60 * 24));
});

const isOverdue = computed(() => {
  if (daysSinceLastBirth.value === null) return false;
  // Threshold: more than 14 months (420 days) since last birth
  return daysSinceLastBirth.value > 420;
});

// Financials
const financials = computed(() => {
  if (!animal.value) return { margin: 0, roi: 0, daysToSale: 0 };
  const cost = animal.value.acquisition_price || 0;
  const sale = animal.value.sale_price || 0;
  const margin = sale - cost;
  const roi = cost > 0 ? ((margin / cost) * 100).toFixed(1) : '0';
  
  let daysToSale = 0;
  if (animal.value.acquisition_date && animal.value.sale_date) {
    const start = new Date(animal.value.acquisition_date);
    const end = new Date(animal.value.sale_date);
    daysToSale = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  return { margin, roi, daysToSale };
});

const totalOffspringValue = computed(() => {
  return offspring.value.reduce((sum, child) => sum + (child.sale_price || 0), 0);
});

// Chart Options
const growthChartOption = computed(() => {
  const sortedOffspring = [...offspring.value]
    .filter(o => o.date_of_birth)
    .sort((a, b) => new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime());

  const data = sortedOffspring.map((o, index) => ({
    date: o.date_of_birth,
    count: index + 1
  }));

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: 'Crías Acumuladas',
        type: 'line',
        step: 'start',
        data: data.map(d => d.count),
        color: '#1867C0',
        areaStyle: { opacity: 0.1 }
      }
    ]
  };
});

const valueChartOption = computed(() => {
  const soldOffspring = offspring.value
    .filter(o => o.status === 'Vendido' && o.sale_price)
    .sort((a, b) => new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime());

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: soldOffspring.map(o => o.name || o.number),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Precio de Venta',
        type: 'bar',
        data: soldOffspring.map(o => o.sale_price),
        color: '#4CAF50',
        label: { show: true, position: 'top', formatter: '${c}' }
      }
    ]
  };
});

// Performance Indicators
const performanceIndicators = computed(() => {
  const indicators = [];
  
  if (animal.value?.sex === 'Hembra') {
    // Reproductive Performance
    if (offspring.value.length >= 5) {
      indicators.push({
        label: 'Alta Productividad',
        description: 'Ha tenido 5 o más crías.',
        color: 'success',
        icon: 'mdi-star'
      });
    } else if (offspring.value.length === 0) {
      const animalAgeInMonths = getAgeInMonths(animal.value.date_of_birth);
      if (animalAgeInMonths > 36) {
        indicators.push({
          label: 'Inactiva / Sin Partos',
          description: 'Más de 3 años sin registros de partos.',
          color: 'error',
          icon: 'mdi-alert-circle'
        });
      } else {
        indicators.push({
          label: 'Novilla / Sin Partos',
          description: 'Aún no ha tenido su primer parto.',
          color: 'info',
          icon: 'mdi-clock-outline'
        });
      }
    }
    
    if (isOverdue.value) {
      indicators.push({
        label: 'Retraso Reproductivo',
        description: 'Más de 14 meses desde el último parto.',
        color: 'warning',
        icon: 'mdi-timer-alert'
      });
    }
    
    // Profitability from offspring
    if (totalOffspringValue.value > 10000) { // Arbitrary threshold
      indicators.push({
        label: 'Rentabilidad Alta',
        description: 'La descendencia ha generado ingresos significativos.',
        color: 'success',
        icon: 'mdi-currency-usd'
      });
    }
  }
  
  // Overall profitability
  if (animal.value?.status === 'Vendido' && parseFloat(financials.value.roi.toString()) > 50) {
    indicators.push({
      label: 'Excelente ROI',
      description: 'Retorno de inversión superior al 50%.',
      color: 'success',
      icon: 'mdi-trending-up'
    });
  }

  return indicators;
});

function getAgeInMonths(birth: string) {
  if (!birth) return 0;
  const d = new Date(birth);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.clickable-row:hover {
  background-color: rgba(0,0,0,0.05);
}
.chart {
  height: 300px;
}
</style>
