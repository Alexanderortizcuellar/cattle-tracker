<template>
  <v-app>
    <v-navigation-drawer 
      v-model="drawer" 
      :temporary="mobile"
      :permanent="!mobile && !drawerIsCollapsed"
      elevation="2"
    >
      <v-list-item class="px-2 py-4">
        <v-list-item-title class="text-h6 text-primary font-weight-bold">
          Sistema Ganadero
        </v-list-item-title>
        <v-list-item-subtitle>Administración</v-list-item-subtitle>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          active-class="bg-primary"
          rounded="lg"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4 text-caption text-center text-medium-emphasis">
          v1.0.0
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="1" color="white">
      <v-app-bar-nav-icon 
        variant="text" 
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <v-toolbar-title class="text-subtitle-1 text-sm-h6 font-weight-bold text-primary">
        {{ currentTitle }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-chip 
        color="primary" 
        variant="outlined" 
        class="d-none d-sm-flex mr-2"
      >
        <v-icon start>mdi-calendar</v-icon>
        {{ currentDate }}
      </v-chip>

      <v-menu offset-y transition="scale-transition">
        <template #activator="{ isActive, props }">
          <v-btn
            v-bind="props"
            icon
            class="ml-1"
            :color="isActive ? 'primary' : undefined"
          >
            <v-avatar color="primary" size="32" variant="tonal">
              <v-icon size="20">mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list width="200">
            <v-list-item class="d-sm-none">
                <template v-slot:prepend>
                    <v-icon size="small">mdi-calendar</v-icon>
                </template>
                <v-list-item-title class="text-caption">{{ currentDate }}</v-list-item-title>
            </v-list-item>
            <v-divider class="d-sm-none my-2"></v-divider>
            
            <v-list-item @click="downloadAllData" density="compact">
                <template v-slot:prepend>
                    <v-icon icon="mdi-download" color="primary"></v-icon>
                </template>
                <v-list-item-title>Exportar Datos (JSON)</v-list-item-title>
            </v-list-item>

            <v-list-item @click="triggerImport" density="compact">
                <template v-slot:prepend>
                    <v-icon icon="mdi-upload" color="secondary"></v-icon>
                </template>
                <v-list-item-title>Importar Datos (JSON)</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item @click="logout" density="compact">
                <template v-slot:prepend>
                    <v-icon icon="mdi-logout" color="error"></v-icon>
                </template>
                <v-list-item-title class="text-error">Cerrar Sesión</v-list-item-title>
            </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <!-- Input oculto para importación -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleImport"
      />
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify' // Importante para responsive
import { useAuthStore } from '../stores/useAuthStore'
import { useDataExport } from '../utils/dataExport'
import { useDataImport } from '../utils/dataImport'
import { useLivestockStore } from '../stores/livestock'
import { useBreedsStore } from '../stores/breeds'
import { useContactsStore } from '../stores/contacts'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { downloadAllData } = useDataExport()
const { importData } = useDataImport()
const livestockStore = useLivestockStore()
const breedsStore = useBreedsStore()
const contactsStore = useContactsStore()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerImport = () => {
  fileInput.value?.click()
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const result = await importData(file)
  alert(result.message)
  
  // Clear input
  target.value = ''
}

onMounted(() => {
  livestockStore.loadAnimals()
  breedsStore.loadBreeds()
  contactsStore.loadContacts()
})

// 1. Hook de Vuetify para detectar tamaño de pantalla
const { mobile } = useDisplay()

// 2. Estado del drawer
// Si es móvil, inicia cerrado (false). Si es escritorio, inicia abierto (true)
const drawer = ref(!mobile.value)
// Estado opcional para colapsar (mini variante) en escritorio si quisieras
const drawerIsCollapsed = ref(false) 

// 3. Watcher inteligente
// Si el usuario cambia de tamaño de ventana (gira el celular o redimensiona),
// ajustamos el drawer automáticamente.
watch(mobile, (isMobile) => {
  drawer.value = !isMobile
})

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'Ganado', icon: 'mdi-cow', to: '/livestock' },
  { title: 'Razas', icon: 'mdi-dna', to: '/breeds' },
  { title: 'Contactos', icon: 'mdi-account-multiple', to: '/contacts' },
]

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const currentTitle = computed(() => {
  const item = menuItems.find(item => item.to === route.path)
  return item?.title || 'Sistema Ganadero'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>