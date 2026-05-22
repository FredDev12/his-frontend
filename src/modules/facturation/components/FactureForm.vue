<script setup>
import { computed, reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import FactureLineEditor from '@/modules/facturation/components/FactureLineEditor.vue'

const props = defineProps({
  initialValue: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  prefillContext: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: 'Créer facture',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  numero_patient: '',
  numero_fiche: '',
  nom: '',
  postnom: '',
  prenom: '',
  telephone: '',
  statut: 'draft',
  devise: 'CDF',
  lignes: [],
  remise: 0,
  taxe: 0,
  notes: '',
})

const errors = reactive({})

const statutOptions = [
  { label: 'Brouillon', value: 'draft' },
  { label: 'Émise', value: 'issued' },
  { label: 'Payée', value: 'paid' },
  { label: 'Annulée', value: 'cancelled' },
]

const deviseOptions = [
  { label: 'CDF', value: 'CDF' },
  { label: 'USD', value: 'USD' },
]

const sousTotal = computed(() =>
  form.lignes.reduce((sum, line) => sum + Number(line.total || 0), 0),
)

const total = computed(() =>
  Math.max(0, Number(sousTotal.value || 0) - Number(form.remise || 0) + Number(form.taxe || 0)),
)

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    form.numero_patient = value.numero_patient || ''
    form.numero_fiche = value.numero_fiche || ''
    form.nom = value.nom || ''
    form.postnom = value.postnom || ''
    form.prenom = value.prenom || ''
    form.telephone = value.telephone || ''
    form.statut = value.statut || 'draft'
    form.devise = value.devise || 'CDF'
    form.lignes = Array.isArray(value.lignes) ? [...value.lignes] : []
    form.remise = value.remise || 0
    form.taxe = value.taxe || 0
    form.notes = value.notes || ''
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validate() {
  clearErrors()

  if (!form.numero_patient) errors.numero_patient = 'Numéro patient obligatoire.'
  if (!form.numero_fiche) errors.numero_fiche = 'Numéro fiche obligatoire.'
  if (!form.nom) errors.nom = 'Nom obligatoire.'
  if (!form.prenom) errors.prenom = 'Prénom obligatoire.'
  if (form.lignes.length === 0) errors.lignes = 'Au moins une ligne facture est obligatoire.'

  return Object.values(errors).every((value) => !value)
}

function submit() {
  if (!validate()) return

  emit('submit', {
    numero_patient: form.numero_patient,
    numero_fiche: form.numero_fiche,
    nom: form.nom,
    postnom: form.postnom,
    prenom: form.prenom,
    telephone: form.telephone,
    statut: form.statut,
    devise: form.devise,
    lignes: form.lignes,
    remise: Number(form.remise || 0),
    taxe: Number(form.taxe || 0),
    notes: form.notes,
  })
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} ${form.devise}`
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard title="Patient facturé" subtitle="Identification du patient concerné par la facture.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput
          v-model="form.numero_patient"
          label="Numéro patient"
          required
          :error="errors.numero_patient"
        />
        <BaseInput
          v-model="form.numero_fiche"
          label="Numéro fiche"
          required
          :error="errors.numero_fiche"
        />
        <BaseInput v-model="form.nom" label="Nom" required :error="errors.nom" />
        <BaseInput v-model="form.postnom" label="Postnom" />
        <BaseInput v-model="form.prenom" label="Prénom" required :error="errors.prenom" />
        <BaseInput v-model="form.telephone" label="Téléphone" />
      </div>
    </BaseCard>

    <BaseCard title="Lignes facture" subtitle="Prestations, examens, médicaments ou autres frais.">
      <FactureLineEditor v-model="form.lignes" />

      <p v-if="errors.lignes" class="mt-3 text-sm font-medium text-red-600">
        {{ errors.lignes }}
      </p>
    </BaseCard>

    <BaseCard title="Totaux" subtitle="Calcul automatique du montant à payer.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BaseSelect v-model="form.devise" label="Devise" :options="deviseOptions" />
        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />
        <BaseInput v-model="form.remise" label="Remise" type="number" />
        <BaseInput v-model="form.taxe" label="Taxe / frais" type="number" />
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">Sous-total</p>
          <p class="mt-2 text-lg font-bold text-slate-950">{{ formatMoney(sousTotal) }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">Remise + taxe</p>
          <p class="mt-2 text-lg font-bold text-slate-950">
            -{{ formatMoney(form.remise) }} / +{{ formatMoney(form.taxe) }}
          </p>
        </div>

        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p class="text-sm text-emerald-700">Total à payer</p>
          <p class="mt-2 text-xl font-bold text-emerald-800">{{ formatMoney(total) }}</p>
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Notes" subtitle="Informations internes sur la facture.">
      <BaseTextarea v-model="form.notes" label="Notes" :rows="4" />
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton type="submit" :loading="loading">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
