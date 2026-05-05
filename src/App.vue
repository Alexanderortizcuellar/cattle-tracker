<script setup lang="ts">
import { onMounted } from 'vue'
import MainLayout from './layouts/MainLayout.vue'
import { useRoute } from 'vue-router'
import { useLivestockStore } from './stores/livestock'
import { useBreedsStore } from './stores/breeds'
import { useContactsStore } from './stores/contacts'

const route = useRoute()
const livestockStore = useLivestockStore()
const breedsStore = useBreedsStore()
const contactsStore = useContactsStore()

onMounted(() => {
  livestockStore.loadAnimals()
  breedsStore.loadBreeds()
  contactsStore.loadContacts()
})
</script>

<template>
  <!-- Si la ruta actual es /login, no mostrar el layout -->
  <MainLayout v-if="route.path !== '/login'" />
  <router-view v-else />
</template>
