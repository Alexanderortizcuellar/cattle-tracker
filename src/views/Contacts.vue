<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Gestión de Vendedores y Compradores</span>
        <v-btn color="primary" @click="openDialog()">
          <v-icon start>mdi-plus</v-icon>
          Agregar Contacto
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
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
            ></v-select>
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="filteredContacts"
          :search="search"
          class="elevation-1"
        >
          <template v-slot:item.type="{ item }">
            <v-chip :color="getTypeColor(item.type)" size="small">
              {{ item.type }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" @click="openDialog(item)" class="mr-2">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click="confirmDelete(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
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
          <v-btn @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveContact">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar este contacto?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteContact">Eliminar</v-btn>
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
  console.log(contactsStore.contacts);
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

  if (editMode.value && currentId.value) {
    contactsStore.updateContact(currentId.value.toString(), formData.value);
  } else {
    contactsStore.addContact(formData.value);
  }

  closeDialog();
};

const confirmDelete = (contact: Contact) => {
  currentId.value = contact.id;
  deleteDialog.value = true;
};

const deleteContact = () => {
  if (currentId.value) {
    contactsStore.deleteContact(currentId.value.toString());
  }
  deleteDialog.value = false;
};
</script>
