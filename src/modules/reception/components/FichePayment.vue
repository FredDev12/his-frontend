<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useReceptionStore } from "../../../stores/reception.store"
import { useToastStore } from "../../../stores/toast.store"

import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseInput from "../../../components/ui/BaseInput.vue"

const reception = useReceptionStore()
const toast = useToastStore()

const loading = ref(false)

// Initialisation avec les données existantes ou valeurs par défaut
const amount = ref(reception.draft?.payment?.requiredAmount || "25000")
const facture = ref(reception.draft?.payment?.facture || "")
const recu = ref(reception.draft?.payment?.recu || "")
const datePaiement = ref(reception.draft?.payment?.paidAt || "")
const method = ref(reception.draft?.payment?.method || "CASH")

// État du paiement (basé sur paye)
const paid = computed(() => reception.draft?.payment?.paid === true)

// Fonction pour générer un numéro de facture
const generateFactureNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `FAC-${year}${month}${day}-${random}`
}

// Fonction pour générer un numéro de reçu
const generateRecuNumber = () => {
  const date = new Date()
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `REC-${timestamp}-${random}`
}

// 1. Au montage : NE générer QUE le numéro de facture si aucun n'existe
onMounted(() => {
  if (!facture.value) {
    facture.value = generateFactureNumber()  // ✓ Seulement la facture
  }
  // Le reçu n'est PAS généré ici (sera généré au moment du paiement)
})

// 2. Au moment du paiement : valider et générer le reçu si nécessaire
const pay = async () => {
  if(paid.value){
    toast.add("Paiement déjà validé", "info")
    return
  }

  // Vérifier que le montant est renseigné
  if (!amount.value || amount.value <= 0) {
    toast.add("Veuillez saisir un montant valide", "error")
    return
  }

  // Générer le reçu UNIQUEMENT au moment du paiement s'il n'existe pas
  if (!recu.value) {
    recu.value = generateRecuNumber()  // ✓ Reçu généré PENDANT le paiement
  }

  // Définir la date du jour si non renseignée
  if (!datePaiement.value) {
    datePaiement.value = new Date().toISOString().split('T')[0]
  }

  loading.value = true

  try{
    await new Promise(r => setTimeout(r, 500))

    // Utiliser setPaymentPaid qui existe dans le store
    reception.setPaymentPaid({
      amount: Number(amount.value),
      facture: facture.value,
      recu: recu.value,
      method: method.value
    })

    toast.add("Paiement fiche validé", "success")

  }catch(e){
    toast.add("Erreur paiement", "error")
    console.log("Erreur lors du paiement:", e)
  }finally{
    loading.value = false
  }
}

// Régénérer les numéros si nécessaire
const regenerateNumbers = () => {
  if (!paid.value) {
    facture.value = generateFactureNumber()
    // Ne pas régénérer le reçu automatiquement (il sera généré au paiement)
    recu.value = ""
    toast.add("Nouveau numéro de facture généré", "info")
  }
}

// Annuler le paiement
const cancelPayment = () => {
  reception.setPaymentUnpaid()
  toast.add("Paiement annulé", "warning")
}
</script>

<template>
  <div class="card space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">
        Paiement fiche
      </h2>
      <span
        v-if="paid"
        class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
      >
        PAYÉ
      </span>
    </div>

    <!-- Montant -->
    <BaseInput
      label="Montant fiche (FCFA)"
      v-model="amount"
      type="number"
      :disabled="paid"
      :readonly="paid"
    />

    <!-- Facture avec bouton de régénération -->
    <div class="relative">
      <BaseInput
        label="Numéro facture"
        v-model="facture"
        :readonly="paid"
        :disabled="paid"
      />
      <button
        v-if="!paid"
        @click="regenerateNumbers"
        class="absolute right-2 top-8 text-xs text-blue-600 hover:text-blue-800"
        title="Générer un nouveau numéro"
      >
        ↻ Générer
      </button>
    </div>

    <!-- Reçu - visible mais généré automatiquement au paiement -->
    <div class="relative">
      <BaseInput
        label="Numéro reçu"
        v-model="recu"
        :readonly="true"
        :disabled="paid"
        :placeholder="paid ? recu : 'Sera généré au moment du paiement'"
      />
      <span
        v-if="!paid && !recu"
        class="absolute right-2 top-8 text-xs text-gray-400"
      >
        (auto)
      </span>
    </div>

    <!-- Date de paiement (affichage seulement) -->
    <div v-if="paid" class="text-sm">
      <span class="text-gray-600">Date paiement:</span>
      <span class="ml-2 font-medium">{{ datePaiement || 'Non spécifiée' }}</span>
    </div>

    <!-- Méthode de paiement -->
    <select
      v-model="method"
      class="input"
      :disabled="paid"
    >
      <option value="CASH">Espèces (Cash)</option>
      <option value="CARD">Carte bancaire</option>
      <option value="MOBILE">Mobile money</option>
      <option value="CHEQUE">Chèque</option>
    </select>

    <!-- Aperçu des formats -->
    <div v-if="!paid" class="text-xs text-gray-500">
      <p>Format: FAC-AAAAMMJJ-XXXX (Facture) | REC-TIMESTAMP-XXX (Reçu)</p>
    </div>

    <div class="flex gap-3">
      <BaseButton
        variant="success"
        :loading="loading"
        @click="pay"
        :disabled="paid"
      >
        Valider paiement
      </BaseButton>

      <BaseButton
        v-if="paid"
        variant="danger"
        @click="cancelPayment"
      >
        Annuler
      </BaseButton>
    </div>

    <!-- Résumé du paiement -->
    <div v-if="paid" class="text-sm space-y-1 border-t pt-3 mt-2">
      <p class="text-green-600 font-medium">✓ Paiement validé</p>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <span class="text-gray-600">Facture:</span>
        <span class="font-mono">{{ facture }}</span>
        <span class="text-gray-600">Reçu:</span>
        <span class="font-mono">{{ recu }}</span>
        <span class="text-gray-600">Montant:</span>
        <span>{{ amount }} FCFA</span>
        <span class="text-gray-600">Méthode:</span>
        <span>{{ method }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
}

.input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.relative {
  position: relative;
}
</style>