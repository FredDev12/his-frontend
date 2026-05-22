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
    default: 'Créer produit',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  code: '',
  nom: '',
  categorie: '',
  forme: '',
  unite: 'boîte',
  quantite: 0,
  seuil_alerte: 10,
  prix_unitaire: 0,
  devise: 'CDF',
  fournisseur: '',
  emplacement: '',
  statut: 'active',
  description: '',
})

const errors = reactive({})

const uniteOptions = [
  { label: 'Boîte', value: 'boîte' },
  { label: 'Plaquette', value: 'plaquette' },
  { label: 'Flacon', value: 'flacon' },
  { label: 'Ampoule', value: 'ampoule' },
  { label: 'Unité', value: 'unité' },
]

const statutOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    Object.assign(form, {
      code: value.code || '',
      nom: value.nom || '',
      categorie: value.categorie || '',
      forme: value.forme || '',
      unite: value.unite || 'boîte',
      quantite: value.quantite || 0,
      seuil_alerte: value.seuil_alerte || 0,
      prix_unitaire: value.prix_unitaire || 0,
      devise: value.devise || 'CDF',
      fournisseur: value.fournisseur || '',
      emplacement: value.emplacement || '',
      statut: value.statut || 'active',
      description: value.description || '',
    })
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
  if (Number(form.quantite) < 0) errors.quantite = 'Quantité invalide.'
  if (Number(form.seuil_alerte) < 0) errors.seuil_alerte = 'Seuil invalide.'

  return Object.values(errors).every((value) => !value)
}

function submit() {
  if (!validate()) return

  emit('submit', {
    code: form.code.trim().toUpperCase().replaceAll(' ', '-'),
    nom: form.nom,
    categorie: form.categorie,
    forme: form.forme,
    unite: form.unite,
    quantite: Number(form.quantite || 0),
    seuil_alerte: Number(form.seuil_alerte || 0),
    prix_unitaire: Number(form.prix_unitaire || 0),
    devise: form.devise,
    fournisseur: form.fournisseur,
    emplacement: form.emplacement,
    statut: form.statut,
    description: form.description,
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard
      title="Produit pharmacie"
      subtitle="Informations d’identification du médicament ou consommable."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput v-model="form.code" label="Code produit" required :error="errors.code" />
        <BaseInput v-model="form.nom" label="Nom produit" required :error="errors.nom" />
        <BaseInput v-model="form.categorie" label="Catégorie" required :error="errors.categorie" />
        <BaseInput v-model="form.forme" label="Forme" placeholder="Comprimé, sirop..." />
        <BaseSelect v-model="form.unite" label="Unité" :options="uniteOptions" />
        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />
      </div>
    </BaseCard>

    <BaseCard
      title="Stock et prix"
      subtitle="Quantité disponible, seuil d’alerte et valeur estimée."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput
          v-model="form.quantite"
          label="Quantité"
          type="number"
          required
          :error="errors.quantite"
        />
        <BaseInput
          v-model="form.seuil_alerte"
          label="Seuil d’alerte"
          type="number"
          required
          :error="errors.seuil_alerte"
        />
        <BaseInput v-model="form.prix_unitaire" label="Prix unitaire" type="number" />
        <BaseInput v-model="form.devise" label="Devise" />
        <BaseInput v-model="form.fournisseur" label="Fournisseur" />
        <BaseInput v-model="form.emplacement" label="Emplacement" />
      </div>
    </BaseCard>

    <BaseCard title="Description" subtitle="Notes internes pharmacie.">
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
