<script setup>
import { ref, computed } from "vue"
import { useReceptionStore } from "../../../stores/reception.store"
import { useToastStore } from "../../../stores/toast.store"

import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseInput from "../../../components/ui/BaseInput.vue"

const reception = useReceptionStore()
const toast = useToastStore()

const loading = ref(false)

const amount = ref(reception.draft?.payment?.requiredAmount || "5000")
const facture = ref("")
const recu = ref("")
const method = ref("CASH")

const paid = computed(() => reception.paymentValidated)

const pay = async () => {

    if(paid.value){
        toast.add("Paiement déjà validé", "info")
        return
    }

    loading.value = true

    try{

        // simulation paiement
        await new Promise(r => setTimeout(r, 500))

        reception.setPaymentPaid({
            amount: amount.value,
            facture: facture.value,
            recu: recu.value,
            method: method.value
        })

        toast.add("Paiement fiche validé", "success")

    }catch(e){

        toast.add("Erreur paiement", "error")

    }finally{

        loading.value = false

    }

}

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
            label="Montant fiche"
            v-model="amount"
        />

        <!-- Facture -->
        <BaseInput
            label="Numéro facture"
            v-model="facture"
        />

        <!-- Reçu -->
        <BaseInput
            label="Numéro reçu"
            v-model="recu"
        />

        <!-- Méthode -->
        <select
            v-model="method"
            class="input"
        >
            <option value="CASH">Cash</option>
            <option value="CARD">Carte</option>
            <option value="MOBILE">Mobile money</option>
        </select>

        <div class="flex gap-3">

            <BaseButton
                variant="success"
                :loading="loading"
                @click="pay"
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

        <p
            v-if="paid"
            class="text-green-600 text-sm"
        >
            Paiement enregistré
        </p>

    </div>

</template>