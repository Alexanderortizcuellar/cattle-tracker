<script setup lang="ts">
import { computed } from "vue";
import type { Cattle } from "../types/cattle";

const props = defineProps<{
  cattle: Cattle;
}>();

const emit = defineEmits<{
  (e: "click", id: number): void;
}>();

const displayName = computed(() => {
  return (
    props.cattle.name || props.cattle.number || props.cattle.mark || "Unknown"
  );
});

const age = computed(() => {
  if (!props.cattle.date_of_birth) return "Unknown";

  const birthDate = new Date(props.cattle.date_of_birth);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years}y ${months}m`;
  }
  return `${months}m`;
});

const statusColor = computed(() => {
  switch (props.cattle.status) {
    case "ACTIVE":
      return "success";
    case "SOLD":
      return "warning";
    case "DEAD":
      return "error";
    default:
      return "grey";
  }
});

const sexIcon = computed(() => {
  return props.cattle.sex === "MALE" ? "mdi-gender-male" : "mdi-gender-female";
});

const sexColor = computed(() => {
  return props.cattle.sex === "MALE" ? "#2196F3" : "#E91E63";
});

const formattedDate = (dateString: string | null) => {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const handleClick = () => {
  emit("click", props.cattle.id);
};
</script>

<template>
  <v-card
    class="cattle-card"
    elevation="2"
    rounded="lg"
    hover
    @click="handleClick"
  >
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <span class="text-h6 font-weight-bold">{{ displayName }}</span>
      <v-icon :color="sexColor" size="28">{{ sexIcon }}</v-icon>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <div class="info-grid">
        <div v-if="cattle.number" class="info-item">
          <v-icon size="20" class="mr-2" color="grey-darken-1"
            >mdi-tag-outline</v-icon
          >
          <span class="text-body-2">
            <span class="text-grey-darken-2">Number:</span>
            <span class="font-weight-medium ml-1">{{ cattle.number }}</span>
          </span>
        </div>

        <div v-if="cattle.mark" class="info-item">
          <v-icon size="20" class="mr-2" color="grey-darken-1"
            >mdi-label-outline</v-icon
          >
          <span class="text-body-2">
            <span class="text-grey-darken-2">Mark:</span>
            <span class="font-weight-medium ml-1">{{ cattle.mark }}</span>
          </span>
        </div>

        <div v-if="cattle.breed" class="info-item">
          <v-icon size="20" class="mr-2" color="grey-darken-1">mdi-cow</v-icon>
          <span class="text-body-2">
            <span class="text-grey-darken-2">Breed:</span>
            <span class="font-weight-medium ml-1">{{ cattle.breed }}</span>
          </span>
        </div>

        <div class="info-item">
          <v-icon size="20" class="mr-2" color="grey-darken-1"
            >mdi-calendar</v-icon
          >
          <span class="text-body-2">
            <span class="text-grey-darken-2">Age:</span>
            <span class="font-weight-medium ml-1">{{ age }}</span>
          </span>
        </div>

        <div v-if="cattle.acquisition_type" class="info-item">
          <v-icon size="20" class="mr-2" color="grey-darken-1"
            >mdi-plus-circle-outline</v-icon
          >
          <span class="text-body-2">
            <span class="text-grey-darken-2">Acquisition:</span>
            <span class="font-weight-medium ml-1">{{
              cattle.acquisition_type
            }}</span>
          </span>
        </div>

        <div class="info-item mt-2">
          <v-chip :color="statusColor" size="small" label>
            {{ cattle.status }}
          </v-chip>
        </div>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4 d-flex justify-space-between align-center">
      <span class="text-caption text-grey">
        Updated {{ formattedDate(cattle.updated_at) }}
      </span>
      <v-btn
        color="primary"
        variant="text"
        size="small"
        append-icon="mdi-arrow-right"
      >
        Details
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.cattle-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  background-color: #fff;
}

.cattle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}
</style>
