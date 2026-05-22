<script setup>
import { onMounted, ref } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import SettingsSummaryCard from '@/modules/settings/components/SettingsSummaryCard.vue'
import SettingsForm from '@/modules/settings/components/SettingsForm.vue'

import { useSettingsStore } from '@/modules/settings/stores/settings.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useSettingsStore()
const toast = useToastStore()

const saveOpen = ref(false)
const resetOpen = ref(false)
const pendingPayload = ref(null)

onMounted(() => {
  loadSettings()
})

async function loadSettings() {
  try {
    await store.fetchSettings()
  } catch (error) {
    console.error('[Settings] Chargement impossible:', error)
    toast.error(error.message || 'Impossible de charger les paramètres.')
  }
}

function askSave(payload) {
  pendingPayload.value = payload
  saveOpen.value = true
}

function closeSave() {
  pendingPayload.value = null
  saveOpen.value = false
}

async function confirmSave() {
  if (!pendingPayload.value) return

  try {
    await store.updateSettings(pendingPayload.value)
    closeSave()
  } catch (error) {
    console.error('[Settings] Enregistrement impossible:', error)
  }
}

function askReset() {
  resetOpen.value = true
}

function closeReset() {
  resetOpen.value = false
}

async function confirmReset() {
  try {
    await store.resetSettings()
    closeReset()
  } catch (error) {
    console.error('[Settings] Réinitialisation impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Paramètres système</h1>

        <p class="his-page-subtitle">
          Configuration générale du HIS, référentiels métier et règles frontend.
        </p>
      </div>

      <BaseButton variant="secondary" :loading="store.loading" @click="loadSettings">
        Recharger
      </BaseButton>
    </header>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement des paramètres système...
    </div>

    <template v-else-if="store.settings">
      <SettingsSummaryCard :settings="store.settings" />

      <SettingsForm
        :initial-value="store.settings"
        :loading="store.saving"
        @submit="askSave"
        @reset="askReset"
      />
    </template>

    <ConfirmDialog
      :open="saveOpen"
      title="Enregistrer les paramètres système"
      message="Cette action va modifier les paramètres utilisés par plusieurs modules du HIS. Vérifie que les valeurs sont correctes avant validation."
      confirm-label="Enregistrer paramètres"
      cancel-label="Annuler"
      variant="success"
      :loading="store.saving"
      @cancel="closeSave"
      @confirm="confirmSave"
    />

    <ConfirmDialog
      :open="resetOpen"
      title="Réinitialiser les paramètres système"
      message="Cette action va restaurer les paramètres par défaut du HIS dans le référentiel local. Les valeurs personnalisées seront perdues."
      confirm-label="Réinitialiser"
      cancel-label="Annuler"
      variant="warning"
      :loading="store.resetting"
      @cancel="closeReset"
      @confirm="confirmReset"
    />
  </div>
</template>
