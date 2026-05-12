<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">Contactos</h1>
        <v-btn
          color="primary"
          @click="openDialog()"
          prepend-icon="mdi-plus"
          class="rounded-lg"
        >
          <span class="d-none d-sm-inline">Agregar Contacto</span>
          <v-icon class="d-inline d-sm-none">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2" class="rounded-lg overflow-hidden">
      <v-card-text class="pa-4">
        <v-row dense class="mb-2">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Buscar contactos..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              bg-color="white"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filterType"
              label="Filtrar por Tipo"
              :items="['Vendedor', 'Comprador', 'Ambos']"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              bg-color="white"
            ></v-select>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredContacts"
          :search="search"
          hover
          class="elevation-0 border rounded-lg"
        >
          <template v-slot:item.type="{ item }">
            <v-chip :color="getTypeColor(item.type)" size="x-small" label class="font-weight-bold">
              {{ item.type }}
            </v-chip>
          </template>
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
      <v-card :disabled="saving">
        <v-progress-linear v-if="saving" indeterminate color="primary" absolute top></v-progress-linear>
        <v-card-title>
          <span class="text-h5">{{
            editMode ? "Editar Contacto" : "Nuevo Contacto"
          }}</span>
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
              v-model="formData.phone"
              label="Teléfono *"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="formData.address"
              label="Dirección *"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            <v-select
              v-model="formData.type"
              label="Tipo *"
              :items="['Vendedor', 'Comprador', 'Ambos']"
              :rules="[rules.required]"
              variant="outlined"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog" :disabled="saving">Cancelar</v-btn>
          <v-btn color="primary" @click="saveContact" :loading="saving">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px" persistent>
      <v-card :disabled="saving">
        <v-progress-linear v-if="saving" indeterminate color="error" absolute top></v-progress-linear>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar este contacto?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog = false" :disabled="saving">Cancelar</v-btn>
          <v-btn color="error" @click="deleteContact" :loading="saving">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useContactsStore } from "../stores/contacts";
import type { Contact } from "../types";

const contactsStore = useContactsStore();

const search = ref("");
const filterType = ref("");
const dialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
const currentId = ref<string | undefined>();
const saving = ref(false);

const form = ref();
onMounted(() => {
  contactsStore.loadContacts();
});
const formData = ref<Contact>({
  name: "",
  phone: "",
  address: "",
  type: "Vendedor",
});

const headers = [
  { title: "Nombre", key: "name" },
  { title: "Teléfono", key: "phone" },
  { title: "Dirección", key: "address" },
  { title: "Tipo", key: "type" },
  { title: "Acciones", key: "actions", sortable: false },
];

const rules = {
  required: (v: string) => !!v || "Este campo es requerido",
};

const filteredContacts = computed(() => {
  if (!filterType.value) {
    return contactsStore.contacts;
  }
  return contactsStore.contacts.filter((c) => c.type === filterType.value);
});

const getTypeColor = (type: string) => {
  switch (type) {
    case "Vendedor":
      return "info";
    case "Comprador":
      return "success";
    case "Ambos":
      return "warning";
    default:
      return "grey";
  }
};

const openDialog = (contact?: Contact) => {
  if (contact && contact.id) {
    editMode.value = true;
    currentId.value = contact.id;
    formData.value = { ...contact };
  } else {
    editMode.value = false;
    currentId.value = undefined;
    formData.value = {
      name: "",
      phone: "",
      address: "",
      type: "Vendedor",
    };
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  form.value?.reset();
};

const saveContact = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (editMode.value && currentId.value) {
      await contactsStore.updateContact(currentId.value.toString(), formData.value);
    } else {
      await contactsStore.addContact(formData.value);
    }
    closeDialog();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (contact: Contact) => {
  currentId.value = contact.id;
  deleteDialog.value = true;
};

const deleteContact = async () => {
  if (currentId.value) {
    saving.value = true;
    try {
      await contactsStore.deleteContact(currentId.value.toString());
      deleteDialog.value = false;
    } finally {
      saving.value = false;
    }
  }
};
</script>
