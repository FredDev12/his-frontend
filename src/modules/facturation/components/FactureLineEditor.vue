<script setup>
import { reactive } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const form = reactive({
  libelle: '',
  module: 'Consultation',
  quantite: 1,
  prix_unitaire: 0,
})

const moduleOptions = [
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Laboratoire', value: 'Laboratoire' },
  { label: 'Imagerie', value: 'Imagerie' },
  { label: 'Pharmacie', value: 'Pharmacie' },
  { label: 'Hospitalisation', value: 'Hospitalisation' },
  { label: 'Autre', value: 'Autre' },
]

function addLine() {
  if (!form.libelle || Number(form.quantite) <= 0) return

  const quantite = Number(form.quantite || 0)
  const prixUnitaire = Number(form.prix_unitaire || 0)

  const line = {
    id: Date.now(),
    libelle: form.libelle,
    module: form.module,
    quantite,
    prix_unitaire: prixUnitaire,
    total: quantite * prixUnitaire,
  }

  emit('update:modelValue', [...props.modelValue, line])

  form.libelle = ''
  form.module = 'Consultation'
  form.quantite = 1
  form.prix_unitaire = 0
}

function removeLine(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, itemIndex) => itemIndex !== index),
  )
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('fr-FR')
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 md:grid-cols-5">
      <BaseInput
        v-model="form.libelle"
        label="Libellé"
        placeholder="Consultation, examen..."
        class="md:col-span-2"
      />

      <BaseSelect v-model="form.module" label="Module" :options="moduleOptions" />

      <BaseInput v-model="form.quantite" label="Qté" type="number" />

      <BaseInput v-model="form.prix_unitaire" label="Prix unitaire" type="number" />
    </div>

    <BaseButton type="button" variant="secondary" @click="addLine"> Ajouter ligne </BaseButton>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Libellé
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Module
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Qté
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Prix
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Total
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Action
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="modelValue.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucune ligne facture.
            </td>
          </tr>

          <tr v-for="(line, index) in modelValue" v-else :key="line.id || index">
            <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ line.libelle }}</td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ line.module }}</td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ line.quantite }}</td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ formatMoney(line.prix_unitaire) }}</td>
            <td class="px-4 py-4 text-sm font-semibold text-slate-950">
              {{ formatMoney(line.total) }}
            </td>
            <td class="px-4 py-4 text-right">
              <BaseButton type="button" variant="danger" size="sm" @click="removeLine(index)">
                Retirer
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
