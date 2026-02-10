<template>
  <v-container class="fill-height d-flex justify-center align-center login-background pa-4">
    <v-card
      class="pa-6 rounded-xl text-center fade-in"
      max-width="420"
      elevation="12"
    >
      <v-form autocomplete="off">
        <v-card-title class="justify-center mb-6">
          <v-avatar color="primary" size="56" class="mb-3">
            <v-icon color="white">mdi-account</v-icon>
          </v-avatar>
        </v-card-title>

        <h2 class="text-h6 text-md-h5 font-weight-medium mb-6 text-primary">
          {{ isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}
        </h2>

        <!-- Nombre (solo registro) -->
        <v-text-field
          v-if="!isLogin"
          v-model="displayName"
          label="Nombre"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          density="comfortable"
          hide-details
          class="mb-4"
          autocomplete="name"
        />

        <!-- Correo -->
        <v-text-field
          v-model="email"
          label="Correo electrónico"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          density="comfortable"
          hide-details
          class="mb-4"
          autocomplete="username"
        />

        <!-- Contraseña -->
        <v-text-field
          v-model="password"
          label="Contraseña"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          density="comfortable"
          type="password"
          hide-details
          class="mb-4"
          :autocomplete="isLogin ? 'current-password' : 'new-password'"
        />

        <!-- Confirmar contraseña (solo registro) -->
        <v-text-field
          v-if="!isLogin"
          v-model="confirmPassword"
          label="Confirmar contraseña"
          prepend-inner-icon="mdi-lock-check-outline"
          variant="outlined"
          density="comfortable"
          type="password"
          hide-details
          class="mb-4"
          autocomplete="new-password"
        />

        <!-- Olvidó contraseña -->
        <div v-if="isLogin" class="text-right text-caption mb-4">
          <v-btn variant="text" size="small" color="primary">
            ¿Olvidaste tu contraseña?
          </v-btn>
        </div>

        <!-- Botón principal -->
        <v-btn
          block
          color="primary"
          size="large"
          rounded="xl"
          class="btn-responsive"
          @click="isLogin ? handleLogin() : handleRegister()"
          :loading="loading"
        >
          {{ isLogin ? 'Iniciar sesión' : 'Registrarse' }}
        </v-btn>

        <!-- Separador visual -->
        <div class="d-flex align-center my-6">
          <v-divider class="flex-grow-1"></v-divider>
          <span class="mx-4 text-body-2 text-grey">o</span>
          <v-divider class="flex-grow-1"></v-divider>
        </div>

        <!-- Botón de Google -->
        <v-btn
          block
          color="white"
          size="large"
          class="google-btn btn-responsive"
          rounded="xl"
          elevation="4"
          @click="handleGoogleLogin"
          :loading="loadingGoogle"
        >
          <template #prepend>
            <v-img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              width="22"
              height="22"
              class="me-2"
            />
          </template>
          {{ isLogin ? 'Google' : 'Google' }}
        </v-btn>

        <!-- Mensaje de error -->
        <v-alert
          v-if="authStore.error"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          {{ authStore.error }}
        </v-alert>

        <!-- Alternar entre login y registro -->
        <div class="mt-6 text-body-2">
          {{ isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?' }}
          <v-btn variant="text" size="small" color="primary" @click="toggleMode">
            {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>



<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')
const loading = ref(false)
const loadingGoogle = ref(false)
const isLogin = ref(true)

const router = useRouter()
const authStore = useAuthStore()

const toggleMode = () => {
  isLogin.value = !isLogin.value
  authStore.error = null // limpiar errores al cambiar de modo
}

// Iniciar sesión
const handleLogin = async () => {
  loading.value = true
  authStore.error = null
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch {
    // El error ya fue asignado en el store
  } finally {
    loading.value = false
  }
}

// Registro
const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.error = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true
  authStore.error = null
  try {
    await authStore.register(email.value, password.value, displayName.value)
    router.push('/')
  } catch {
    // Error ya gestionado en el store
  } finally {
    loading.value = false
  }
}

// Iniciar sesión con Google
const handleGoogleLogin = async () => {
  loadingGoogle.value = true
  authStore.error = null
  try {
    await authStore.loginWithGoogle()
    router.push('/')
  } catch {
    // Error ya gestionado en el store
  } finally {
    loadingGoogle.value = false
  }
}
</script>

<style scoped>
/* --- Ajustes de botones en móviles --- */
.btn-responsive {
  font-size: 1rem;
  white-space: normal; /* Permite salto de línea si el texto es largo */
  line-height: 1.2;
  padding-top: 10px;
  padding-bottom: 10px;
}

/* Texto más pequeño en pantallas chicas */
@media (max-width: 600px) {
  .btn-responsive {
    font-size: 0.85rem !important;
  }

  h2 {
    font-size: 1.1rem !important;
  }

  .v-card {
    padding: 1.2rem !important;
  }
}
</style>