<script setup lang="ts">
import { onMounted } from 'vue'
import MainLayout from './layouts/MainLayout.vue'
import { useRoute } from 'vue-router'
import { useLivestockStore } from './stores/livestock'
import { useBreedsStore } from './stores/breeds'
import { useContactsStore } from './stores/contacts'
import { useAuthStore } from './stores/useAuthStore'

const route = useRoute()
const livestockStore = useLivestockStore()
const breedsStore = useBreedsStore()
const contactsStore = useContactsStore()
const authStore = useAuthStore()

onMounted(() => {
  livestockStore.loadAnimals()
  breedsStore.loadBreeds()
  contactsStore.loadContacts()
})
</script>

<template>
  <v-app v-if="authStore.loading">
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="auto" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            width="6"
            class="mb-4"
          ></v-progress-circular>
          <div class="text-h6 text-primary font-weight-medium">Cargando aplicación...</div>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
  <template v-else>
    <!-- Si la ruta actual es /login, no mostrar el layout -->
    <MainLayout v-if="route.path !== '/login'" />
    <router-view v-else />
  </template>
</template>
