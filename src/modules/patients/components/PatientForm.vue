<script setup>
import { computed, reactive, watch } from 'vue'

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
    default: 'Enregistrer patient',
  },
  prefillValue: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

//const todayIso = new Date().toISOString()

const form = reactive({
  numero_patient: '',
  numero_fiche: '',
  nom: '',
  postnom: '',
  prenom: '',
  sexe: '',
  date_naissance: '',
  age: '',
  telephone: '',
  adresse: '',
  personne_contacter: '',
  telephone_urgence: '',
  etat_civil: '',
  montant_fiche: 0,
  paiement_effectue: false,
  mode_paiement: '',
  agent_cac_id: '',
  type_relation: '',
  nom_du_beneficiaire: '',
  statut: 'active',
  lien_contact_urgence: '',
})

const errors = reactive({})

const sexeOptions = [
  { label: 'Masculin', value: 'M' },
  { label: 'Féminin', value: 'F' },
]

const etatCivilOptions = [
  { label: 'Célibataire', value: 'Célibataire' },
  { label: 'Marié(e)', value: 'Marié' },
  { label: 'Divorcé(e)', value: 'Divorcé' },
  { label: 'Veuf / Veuve', value: 'Veuf' },
]

const lienContactOptions = [
  { label: 'Père', value: 'Père' },
  { label: 'Mère', value: 'Mère' },
  { label: 'Conjoint(e)', value: 'Conjoint(e)' },
  { label: 'Frère', value: 'Frère' },
  { label: 'Sœur', value: 'Sœur' },
  { label: 'Enfant', value: 'Enfant' },
  { label: 'Tuteur', value: 'Tuteur' },
  { label: 'Ami(e)', value: 'Ami(e)' },
  { label: 'Autre', value: 'Autre' },
]

const paiementOptions = [
  { label: 'Espèces', value: 'CASH' },
  { label: 'Mobile Money', value: 'MM' },
  { label: 'Carte bancaire', value: 'CARD' },
  { label: 'Chèque', value: 'CHEQUE' },
  { label: 'Virement', value: 'VIREMENT' },
]

const relationOptions = [
  { label: 'Agent lui-même', value: 'SELF' },
  { label: 'Conjoint(e)', value: 'SPOUSE' },
  { label: 'Enfant', value: 'CHILD' },
  { label: 'Parent', value: 'PARENT' },
]

const statutOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
  { label: 'Archivé', value: 'archived' },
]

const isEdit = computed(() => Boolean(props.initialValue))
const isAgentBeneficiary = computed(() => Boolean(form.agent_cac_id))

const agentBeneficiaryLabel = computed(() => {
  if (!isAgentBeneficiary.value) return ''

  const labels = {
    SELF: 'Agent lui-même',
    SPOUSE: 'Conjoint(e)',
    CHILD: 'Enfant',
    PARENT: 'Parent',
  }

  return labels[form.type_relation] || 'Bénéficiaire agent CAC'
})

watch(
  () => props.initialValue || props.prefillValue,
  (patient) => {
    if (!patient) return

    form.numero_patient = patient.numero_patient || ''
    form.numero_fiche = patient.numero_fiche || ''
    form.nom = patient.nom || ''
    form.postnom = patient.postnom || ''
    form.prenom = patient.prenom || ''
    form.sexe = patient.sexe || ''
    form.date_naissance = patient.date_naissance || ''
    form.age = patient.age || ''
    form.telephone = patient.telephone || ''
    form.adresse = patient.adresse || ''
    form.statut = patient.statut || 'active'

    const raw = patient.raw || {}
    const identification = raw.identification_patient || {}
    const paiement = raw.paiement_fiche || {}
    const agent = raw.agent_cac || {}

    form.personne_contacter =
      patient.personne_contacter ||
      identification.personne_contacter ||
      identification.contact_urgence?.nom ||
      ''

    form.telephone_urgence =
      patient.telephone_urgence ||
      identification.telephone_urgence ||
      identification.urgence_téléphonique ||
      identification.contact_urgence?.telephone ||
      ''

    form.lien_contact_urgence =
      patient.lien_contact_urgence || identification.contact_urgence?.lien || ''

    form.etat_civil =
      patient.etat_civil || identification.etat_civil || identification.état_civil || ''

    form.montant_fiche = patient.montant_fiche ?? paiement.montant_fiche ?? 0
    form.paiement_effectue = Boolean(
      patient.paiement_effectue ??
      paiement.paiement_effectue ??
      paiement.paiement_effectuer ??
      false,
    )

    form.mode_paiement = patient.mode_paiement || paiement.mode_paiement || ''

    form.agent_cac_id = patient.agent_cac_id || agent.agent_cac_id || ''
    form.type_relation =
      patient.type_relation ||
      raw.type_relation ||
      agent.relation_to_agent ||
      agent.relation_a_agent ||
      agent.relation_à_agent ||
      ''

    form.nom_du_beneficiaire =
      patient.nom_du_beneficiaire ||
      agent.beneficiary_name ||
      agent.nom_du_beneficiaire ||
      agent.nom_du_bénéficiaire ||
      ''
  },
  {
    immediate: true,
  },
)

watch(
  () => [form.agent_cac_id, form.type_relation],
  () => {
    if (!form.agent_cac_id) return

    form.montant_fiche = 0
    form.paiement_effectue = true
    form.mode_paiement = 'AGENT_CAC'

    if (!form.nom_du_beneficiaire) {
      form.nom_du_beneficiaire = [form.nom, form.postnom, form.prenom].filter(Boolean).join(' ')
    }
  },
  {
    immediate: true,
  },
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
  if (!form.sexe) errors.sexe = 'Sexe obligatoire.'
  if (!form.age) errors.age = 'Âge obligatoire.'
  if (!form.telephone) errors.telephone = 'Téléphone obligatoire.'
  if (!form.adresse) errors.adresse = 'Adresse obligatoire.'
  if (!form.etat_civil) errors.etat_civil = 'État civil obligatoire.'
  if (!form.lien_contact_urgence) {
    errors.lien_contact_urgence = 'Lien avec le patient obligatoire.'
  }
  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  const now = new Date().toISOString()
  const today = new Date().toISOString().split('T')[0]

  const relation = form.type_relation || 'SELF'

  const contactUrgenceNom = form.personne_contacter || 'Non spécifié'
  const contactUrgenceLien = form.lien_contact_urgence || 'Famille'
  const contactUrgenceTelephone = form.telephone_urgence || form.telephone || 'Non spécifié'

  const agentConfirmed = Boolean(form.agent_cac_id)

  return {
    identification_patient: {
      numero_patient: form.numero_patient || form.numero_fiche,
      nom: form.nom,
      postnom: form.postnom || '',
      prenom: form.prenom,
      sexe: form.sexe,
      date_naissance: form.date_naissance || null,
      age: Number(form.age) || 0,
      telephone: form.telephone,
      adresse: form.adresse,
      personne_contacter: contactUrgenceNom,
      telephone_urgence: contactUrgenceTelephone,
      etat_civil: form.etat_civil || 'Célibataire',

      contact_urgence: {
        nom: contactUrgenceNom,
        lien: contactUrgenceLien,
        telephone: contactUrgenceTelephone,
      },
    },

    paiement_fiche: {
      montant_fiche: agentConfirmed ? 0 : Number(form.montant_fiche) || 0,
      paiement_effectue: agentConfirmed ? true : Boolean(form.paiement_effectue),
      mode_paiement: agentConfirmed ? 'AGENT_CAC' : form.mode_paiement || 'CASH',
      facture_numero: agentConfirmed ? 'AGENT-CAC' : 'N/A',
      recu_numero: agentConfirmed ? 'AGENT-CAC' : 'N/A',
      date_paiement: today,
      exonere: agentConfirmed,
      motif_exoneration: agentConfirmed ? 'BENEFICIAIRE_AGENT_CAC' : '',
    },

    agent_cac: agentConfirmed
      ? {
          agent_cac_id: String(form.agent_cac_id),
          relation_to_agent: relation,
          beneficiary_name:
            form.nom_du_beneficiaire ||
            [form.nom, form.postnom, form.prenom].filter(Boolean).join(' '),
          is_agent_beneficiary: true,
          frais_exoneres: true,
        }
      : {},

    created_at: props.initialValue?.raw?.created_at || now,
    numero_fiche: form.numero_fiche,
    type_relation: agentConfirmed ? relation : '',
    status: form.statut || 'active',
  }
}

function submit() {
  if (!validate()) return

  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard
      title="Identité du patient"
      subtitle="Informations civiles indispensables à l’identification du patient."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput
          v-model="form.numero_patient"
          label="Numéro patient"
          placeholder="PAT-0001"
          required
          :error="errors.numero_patient"
        />

        <BaseInput
          v-model="form.numero_fiche"
          label="Numéro fiche"
          placeholder="FICHE-0001"
          required
          :error="errors.numero_fiche"
        />

        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" required />

        <BaseInput v-model="form.nom" label="Nom" required :error="errors.nom" />

        <BaseInput v-model="form.postnom" label="Postnom" />

        <BaseInput v-model="form.prenom" label="Prénom" required :error="errors.prenom" />

        <BaseSelect
          v-model="form.sexe"
          label="Sexe"
          :options="sexeOptions"
          required
          :error="errors.sexe"
        />

        <BaseInput v-model="form.date_naissance" label="Date de naissance" type="date" />

        <BaseInput v-model="form.age" label="Âge" type="number" required :error="errors.age" />

        <BaseInput v-model="form.telephone" label="Téléphone" required :error="errors.telephone" />

        <BaseSelect
          v-model="form.etat_civil"
          label="État civil"
          :options="etatCivilOptions"
          required
          :error="errors.etat_civil"
        />

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea v-model="form.adresse" label="Adresse" required :error="errors.adresse" />
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Contact d’urgence" subtitle="Personne à contacter en cas de nécessité.">
      <div class="grid gap-4 md:grid-cols-2">
        <BaseInput v-model="form.personne_contacter" label="Personne à contacter" />
        <BaseSelect
          v-model="form.lien_contact_urgence"
          label="Lien avec le patient"
          :options="lienContactOptions"
          placeholder="Sélectionner le lien"
          required
          :error="errors.lien_contact_urgence"
        />
        <BaseInput v-model="form.telephone_urgence" label="Téléphone urgence" />
      </div>
    </BaseCard>
    <div
      v-if="isAgentBeneficiary"
      class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      <strong>{{ agentBeneficiaryLabel }}</strong> confirmé via agent CAC
      <span v-if="form.agent_cac_id">({{ form.agent_cac_id }})</span>. Frais de fiche
      automatiquement exonérés.
    </div>

    <BaseCard
      title="Paiement de la fiche"
      subtitle="Informations financières liées à l’ouverture du dossier."
    >
      <div class="grid gap-4 md:grid-cols-3">
        <BaseInput
          v-model="form.montant_fiche"
          label="Montant fiche"
          type="number"
          :disabled="isAgentBeneficiary"
        />

        <BaseSelect
          v-model="form.mode_paiement"
          label="Mode de paiement"
          :options="paiementOptions"
          :disabled="isAgentBeneficiary"
        />

        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.paiement_effectue"
            type="checkbox"
            :disabled="isAgentBeneficiary"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <span class="text-sm font-medium text-slate-700"> Paiement effectué </span>
        </label>
      </div>
    </BaseCard>

    <BaseCard title="Lien agent CAC" subtitle="Optionnel : rattachement du patient à un agent CAC.">
      <div class="grid gap-4 md:grid-cols-3">
        <BaseInput v-model="form.agent_cac_id" label="ID agent CAC" />

        <BaseSelect v-model="form.type_relation" label="Relation" :options="relationOptions" />

        <BaseInput v-model="form.nom_du_beneficiaire" label="Nom du bénéficiaire" />
      </div>
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton type="submit" :loading="loading">
        {{ isEdit ? submitLabel : submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
