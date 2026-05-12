<template>
  <v-card border flat class="rounded-lg h-100">
    <v-card-text class="pa-3">
      <div class="text-caption text-grey-darken-1 text-truncate">{{ title }}</div>
      <div class="text-h6 font-weight-bold" :class="color">{{ value }}</div>
      <v-icon :color="iconColor" size="18" class="mt-1">{{ icon }}</v-icon>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  color?: string
  iconColor?: string
}>()
</script>
