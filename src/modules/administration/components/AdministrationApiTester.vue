<script setup>
import { computed, reactive, ref } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import { useToastStore } from '@/shared/stores/toast.store'
import { adminRouteTestService } from '@/modules/administration/services/admin-route-test.service'

const toast = useToastStore()

const loading = ref(false)
const confirmOpen = ref(false)
const result = ref(null)
const error = ref('')

const form = reactive({
  method: 'GET',
  path: '/api/patients',
  body: '',
})

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
]

const isWriteMethod = computed(() => adminRouteTestService.isWriteMethod(form.method))

const formattedResult = computed(() => {
  if (!result.value) return ''

  return JSON.stringify(result.value, null, 2)
})

function setExample(type) {
  if (type === 'GET_PATIENTS') {
    form.method = 'GET'
    form.path = '/api/patients'
    form.body = JSON.stringify(
      {
        page: 1,
        limit: 5,
      },
      null,
      2,
    )
    return
  }

  if (type === 'TRIAGE_STATUS') {
    form.method = 'POST'
    form.path = '/api/triage/1/status'
    form.body = JSON.stringify(
      {
        status: 'TRIAGE_URGENT',
        details: {
          numero_fiche: 'FIC-TEST-001',
          action: 'ADMIN_TEST_TRIAGE_STATUS',
          message: 'Test diffusion statut depuis console admin',
        },
      },
      null,
      2,
    )
    return
  }

  if (type === 'AUDIT') {
    form.method = 'GET'
    form.path = '/api/audit'
    form.body = JSON.stringify(
      {
        page: 1,
        limit: 5,
      },
      null,
      2,
    )
  }
}

function validate() {
  error.value = ''

  try {
    return adminRouteTestService.validateBeforeConfirm({
      method: form.method,
      path: form.path,
    })
  } catch (validationError) {
    error.value = validationError.message
    toast.error(error.value)
    return null
  }
}

async function submit() {
  const validation = validate()

  if (!validation) return

  if (validation.needsConfirmation) {
    confirmOpen.value = true
    return
  }

  await runTest()
}

async function runTest() {
  loading.value = true
  error.value = ''
  confirmOpen.value = false
  result.value = null

  try {
    const response = await adminRouteTestService.testRoute({
      method: form.method,
      path: form.path,
      body: form.body,
    })

    result.value = response

    if (response.ok) {
      toast.success(`Route testée avec succès : HTTP ${response.status}`)
      return
    }

    toast.error(`Test API échoué : HTTP ${response.status || 'N/A'}`)
  } catch (runError) {
    error.value = runError.message || 'Test API impossible.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

function cancelConfirm() {
  confirmOpen.value = false
}
</script>

<template>
  <BaseCard
    title="Test route API"
    subtitle="Outil administrateur pour tester une route API sans exposer le token."
  >
    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 md:grid-cols-4">
        <BaseSelect v-model="form.method" label="Méthode" :options="methodOptions" />

        <BaseInput
          v-model="form.path"
          class="md:col-span-3"
          label="Route API"
          placeholder="/api/patients"
        />
      </div>

      <BaseTextarea
        v-model="form.body"
        label="Payload JSON / paramètres GET"
        :rows="8"
        placeholder='{"page":1,"limit":5}'
      />

      <div class="flex flex-wrap gap-2">
        <BaseButton type="button" variant="secondary" size="sm" @click="setExample('GET_PATIENTS')">
          Exemple GET patients
        </BaseButton>

        <BaseButton
          type="button"
          variant="secondary"
          size="sm"
          @click="setExample('TRIAGE_STATUS')"
        >
          Exemple statut triage
        </BaseButton>

        <BaseButton type="button" variant="secondary" size="sm" @click="setExample('AUDIT')">
          Exemple audit
        </BaseButton>
      </div>

      <div
        v-if="isWriteMethod"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        Cette méthode peut modifier les données. Une confirmation est obligatoire avant exécution.
      </div>

      <div
        v-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <div class="flex justify-end">
        <BaseButton type="submit" :loading="loading"> Tester route </BaseButton>
      </div>
    </form>

    <div v-if="result" class="mt-6 space-y-3">
      <div class="grid gap-3 md:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Statut HTTP</p>

          <p
            class="mt-1 text-lg font-bold"
            :class="result.ok ? 'text-emerald-700' : 'text-red-700'"
          >
            {{ result.status || 'N/A' }}
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Durée</p>

          <p class="mt-1 text-lg font-bold text-slate-950">{{ result.durationMs }} ms</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Méthode</p>

          <p class="mt-1 text-lg font-bold text-slate-950">
            {{ result.method }}
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Résultat</p>

          <p
            class="mt-1 text-lg font-bold"
            :class="result.ok ? 'text-emerald-700' : 'text-red-700'"
          >
            {{ result.ok ? 'Succès' : 'Échec' }}
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-950 p-4">
        <pre class="max-h-96 overflow-auto text-xs leading-5 text-slate-100">{{
          formattedResult
        }}</pre>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="Confirmer le test de route API"
      :message="`La méthode ${form.method} peut modifier les données sur ${form.path}. Cette action sera auditée.`"
      confirm-label="Tester cette route"
      cancel-label="Annuler"
      variant="warning"
      :loading="loading"
      @cancel="cancelConfirm"
      @confirm="runTest"
    />
  </BaseCard>
</template>
