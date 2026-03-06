<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getPatient } from "../../api/patients.api"
import { useToastStore } from "../../stores/toast.store"

import BaseButton from "../../components/ui/BaseButton.vue"
import BaseBadge from "../../components/ui/BaseBadge.vue"

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const loading = ref(false)
const fiche = ref(null)
const activeTab = ref("resume") // resume | json

const safe = (v) => {
  const s = (v ?? "").toString().trim()
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return "-"
  return s
}

const fmtDate = (d) => {
  if (!d) return "-"
  try {
    return new Date(d).toLocaleString()
  } catch {
    return "-"
  }
}

const getActiveKey = (obj) => {
  if (!obj) return null
  const key = Object.keys(obj).find((k) => obj[k] === true)
  if (!key) return null
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

/** Data slices */
const identification = computed(() => fiche.value?.identification || {})
const paiement = computed(() => fiche.value?.paiement_fiche || {})

/** Paiement */
const paiementOk = computed(() => paiement.value?.paye === true)

const montantFiche = computed(() => {
  const montant = paiement.value?.montant_fiche
  if (montant === null || montant === undefined || montant === "") return "-"
  const n = Number(montant)
  if (Number.isNaN(n)) return safe(montant)
  return new Intl.NumberFormat("fr-FR").format(n) + " FC"
})

/** Badges */
const statusLabel = computed(() => safe(fiche.value?.status))
const statusType = computed(() => {
  const s = (fiche.value?.status || "").toString().toLowerCase()
  if (s.includes("active") || s.includes("ouvert")) return "success"
  if (s.includes("close") || s.includes("fermé") || s.includes("term")) return "secondary"
  if (s.includes("annul") || s.includes("rejet")) return "danger"
  return "primary"
})

/** Load */
const load = async () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    const res = await getPatient(id)
    fiche.value = res?.data?.data || null
    if (!fiche.value) toast.add("Fiche introuvable", "error")
  } catch (e) {
    fiche.value = null
    toast.add("Fiche introuvable", "error")
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.params.id, load)

const back = () => router.push({ name: "reception.fiches.list" })
</script>
<template>
  <div class="p-6 space-y-5">
    <!-- HEADER -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">Fiche Patient</h1>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-500">ID: #{{ route.params.id }}</span>

          <BaseBadge :type="statusType">{{ statusLabel }}</BaseBadge>

          <BaseBadge :type="paiementOk ? 'success' : 'danger'">
            Paiement: {{ paiementOk ? "PAYÉ" : "NON PAYÉ" }}
          </BaseBadge>
        </div>

        <p class="text-sm text-gray-500">
          Détail complet de la fiche de consultation (réception).
        </p>
      </div>

      <div class="flex gap-2">
        <BaseButton variant="secondary" @click="back">← Retour</BaseButton>
        <BaseButton variant="primary" :loading="loading" @click="load">Actualiser</BaseButton>
      </div>
    </div>

    <!-- LOADING / EMPTY -->
    <div v-if="loading" class="card text-gray-500">Chargement...</div>
    <div v-else-if="!fiche" class="card text-gray-500">Aucune donnée.</div>

    <div v-else class="space-y-5">
      <!-- TABS -->
      <div class="flex gap-2">
        <button
          class="px-3 py-2 rounded border text-sm"
          :class="activeTab === 'resume' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'"
          @click="activeTab = 'resume'"
        >
          Résumé
        </button>

        <button
          class="px-3 py-2 rounded border text-sm"
          :class="activeTab === 'json' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'"
          @click="activeTab = 'json'"
        >
          JSON (debug)
        </button>
      </div>

      <!-- =========================
           TAB: RESUME
      ========================== -->
      <div v-if="activeTab === 'resume'" class="space-y-5">
        <!-- METADATA -->
        <div class="grid gap-4 lg:grid-cols-3">
          <div class="card space-y-2">
            <div class="font-semibold">Horodatage</div>
            <div class="text-sm text-gray-700 space-y-1">
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Créé</span>
                <span class="font-medium">{{ fmtDate(fiche.created_at) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Modifié</span>
                <span class="font-medium">{{ fmtDate(fiche.updated_at) }}</span>
              </div>
            </div>
          </div>

          <div class="card space-y-2">
            <div class="font-semibold">Passage</div>
            <div class="text-sm text-gray-700 space-y-1">
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Type</span>
                <span class="font-medium">{{ safe(getActiveKey(fiche?.type_passage)) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Service d’entrée</span>
                <span class="font-medium">{{ safe(getActiveKey(fiche?.service_entree)) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Priorité</span>
                <span class="font-medium">{{ safe(getActiveKey(fiche?.priorite)) }}</span>
              </div>
            </div>
          </div>

          <div class="card space-y-2">
            <div class="font-semibold">Paiement fiche</div>
            <div class="text-sm text-gray-700 space-y-1">
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Statut</span>
                <span
                    class="font-medium"
                    :class="paiementOk ? 'text-green-600' : 'text-red-600'"
                >
                    {{ paiementOk ? "PAYÉ" : "NON PAYÉ" }}
                </span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Montant</span>
                <span class="font-medium">{{ safe(montantFiche) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Facture</span>
                <span class="font-medium">{{ safe(paiement?.facture_numero) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Reçu</span>
                <span class="font-medium">{{ safe(paiement?.recu_numero) }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span class="text-gray-500">Méthode</span>
                <span class="font-medium">{{ safe(paiement?.date_paiement) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- IDENTIFICATION -->
        <div class="card space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="font-semibold">Identification patient</div>
            <span class="text-xs text-gray-500">Informations administratives</span>
          </div>

          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <div class="space-y-1">
              <div class="text-gray-500">Nom</div>
              <div class="font-medium">{{ safe(identification?.nom) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">Prénom</div>
              <div class="font-medium">{{ safe(identification?.prenom) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">Postnom</div>
              <div class="font-medium">{{ safe(identification?.postnom) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">Sexe</div>
              <div class="font-medium">{{ safe(identification?.sexe) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">Téléphone</div>
              <div class="font-medium">{{ safe(identification?.telephone) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">Adresse</div>
              <div class="font-medium">{{ safe(identification?.adresse) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">Date de naissance</div>
              <div class="font-medium">{{ safe(identification?.date_naissance) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">Âge</div>
              <div class="font-medium">{{ safe(identification?.age || identification?.âge) }}</div>
            </div>

            <div class="space-y-1">
              <div class="text-gray-500">État civil</div>
              <div class="font-medium">{{ safe(identification?.etat_civil) }}</div>
            </div>
          </div>

          <!-- CONTACT URGENCE -->
          <div class="border-t pt-3">
            <div class="font-medium text-sm mb-2">Contact urgence</div>
            <div class="grid gap-3 md:grid-cols-3 text-sm">
              <div class="space-y-1">
                <div class="text-gray-500">Nom</div>
                <div class="font-medium">{{ safe(identification?.contact_urgence?.nom || identification?.personne_a_contacter) }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-gray-500">Lien</div>
                <div class="font-medium">{{ safe(identification?.contact_urgence?.lien) }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-gray-500">Téléphone</div>
                <div class="font-medium">{{ safe(identification?.contact_urgence?.telephone || identification?.telephone_urgence) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="card">
          <div class="font-semibold mb-2">Actions</div>
          <div class="flex flex-wrap gap-2">
            <BaseButton variant="primary" @click="router.push({ name: 'reception.patient' })">
              Nouvelle admission (réception)
            </BaseButton>

            <BaseButton variant="secondary" @click="router.push({ name: 'reception.fiches.list' })">
              Retour liste des fiches
            </BaseButton>
          </div>

          <p class="text-xs text-gray-500 mt-3">
            NB: La modification de la fiche se fait via le workflow Réception (paiement + formulaire).
          </p>
        </div>
      </div>

      <!-- =========================
           TAB: JSON
      ========================== -->
      <div v-else class="card">
        <div class="font-semibold mb-2">Détails JSON</div>
        <pre class="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-[70vh]">{{ fiche }}</pre>
      </div>
    </div>
  </div>
</template>