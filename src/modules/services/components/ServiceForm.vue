<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

const props = defineProps({
  initialValue: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: 'Enregistrer service',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  code: '',
  nom: '',
  categorie: '',
  module_source: 'reception',
  prix_base: 0,
  devise: 'CDF',
  remise_autorisee: false,
  remise_max: 0,
  necessite_paiement: true,
  visible_dans_facturation: true,
  visible_dans_reception: false,
  statut: 'active',
  ordre: 0,
  description: '',
})

const errors = reactive({})

const moduleOptions = [
  { label: 'Réception', value: 'reception' },
  { label: 'Consultations', value: 'consultations' },
  { label: 'Laboratoire', value: 'laboratoire' },
  { label: 'Imagerie', value: 'imagerie' },
  { label: 'Pharmacie', value: 'pharmacie' },
  { label: 'Caisse', value: 'caisse' },
  { label: 'Facturation', value: 'facturation' },
  { label: 'Sorties', value: 'sorties' },
  { label: 'Autre', value: 'autre' },
]

const deviseOptions = [
  { label: 'CDF', value: 'CDF' },
  { label: 'USD', value: 'USD' },
]

const statutOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    form.code = value.code || ''
    form.nom = value.nom || ''
    form.categorie = value.categorie || ''
    form.module_source = value.module_source || 'reception'
    form.prix_base = Number(value.prix_base ?? 0)
    form.devise = value.devise || 'CDF'
    form.remise_autorisee = value.remise_autorisee === true
    form.remise_max = Number(value.remise_max ?? 0)
    form.necessite_paiement = value.necessite_paiement === true
    form.visible_dans_facturation = value.visible_dans_facturation === true
    form.visible_dans_reception = value.visible_dans_reception === true
    form.statut = value.statut || 'active'
    form.ordre = value.ordre || 0
    form.description = value.description || ''
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

  if (!form.code) errors.code = 'Code obligatoire.'
  if (!form.nom) errors.nom = 'Nom obligatoire.'
  if (!form.categorie) errors.categorie = 'Catégorie obligatoire.'
  if (!form.module_source) errors.module_source = 'Module obligatoire.'

  if (Number(form.prix_base) < 0) {
    errors.prix_base = 'Le prix ne peut pas être négatif.'
  }

  if (Number(form.remise_max) < 0 || Number(form.remise_max) > 100) {
    errors.remise_max = 'La remise maximale doit être comprise entre 0 et 100.'
  }

  if (!form.remise_autorisee) {
    form.remise_max = 0
  }

  return Object.values(errors).every((value) => !value)
}

function submit() {
  if (!validate()) return

  emit('submit', {
    code: form.code,
    nom: form.nom,
    categorie: form.categorie,
    module_source: form.module_source,
    prix_base: Number(form.prix_base ?? 0),
    remise_max: form.remise_autorisee ? Number(form.remise_max ?? 0) : 0,
    ordre: Number(form.ordre ?? 0),
    devise: form.devise,
    remise_autorisee: Boolean(form.remise_autorisee),
    necessite_paiement: Boolean(form.necessite_paiement),
    visible_dans_facturation: Boolean(form.visible_dans_facturation),
    visible_dans_reception: Boolean(form.visible_dans_reception),
    statut: form.statut,
    description: form.description,
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard title="Identification" subtitle="Nom, code et module d’utilisation du service.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput v-model="form.code" label="Code service" required :error="errors.code" />
        <BaseInput v-model="form.nom" label="Nom service" required :error="errors.nom" />
        <BaseInput v-model="form.categorie" label="Catégorie" required :error="errors.categorie" />

        <BaseSelect
          v-model="form.module_source"
          label="Module source"
          :options="moduleOptions"
          required
          :error="errors.module_source"
        />

        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />
        <BaseInput v-model="form.ordre" label="Ordre d’affichage" type="number" />
      </div>
    </BaseCard>

    <BaseCard title="Prix et remise" subtitle="Prix de base, devise et règle de remise.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BaseInput
          v-model="form.prix_base"
          label="Prix de base"
          type="number"
          :error="errors.prix_base"
        />
        <BaseSelect v-model="form.devise" label="Devise" :options="deviseOptions" />

        <BaseInput
          v-model="form.remise_max"
          label="Remise maximale (%)"
          type="number"
          :disabled="!form.remise_autorisee"
          :error="errors.remise_max"
        />

        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.remise_autorisee"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <span class="text-sm font-medium text-slate-700"> Remise autorisée </span>
        </label>
      </div>
    </BaseCard>

    <BaseCard title="Visibilité et paiement" subtitle="Où ce service peut être utilisé.">
      <div class="grid gap-4 md:grid-cols-3">
        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.necessite_paiement"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm font-medium text-slate-700">Nécessite paiement</span>
        </label>

        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.visible_dans_facturation"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm font-medium text-slate-700">Visible dans facturation</span>
        </label>

        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.visible_dans_reception"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm font-medium text-slate-700">Visible dans réception</span>
        </label>
      </div>
    </BaseCard>

    <BaseCard title="Description" subtitle="Informations internes sur le service.">
      <BaseTextarea v-model="form.description" label="Description" :rows="4" />
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton type="submit" :loading="loading">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
