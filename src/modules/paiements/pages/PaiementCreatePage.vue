<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import BaseInput from "@/shared/ui/base/BaseInput.vue";
import BaseSelect from "@/shared/ui/base/BaseSelect.vue";

import { usePaiementsStore } from "@/modules/paiements/stores/paiements.store";
import { useToastStore } from "@/shared/stores/toast.store";

const router = useRouter();
const store = usePaiementsStore();
const toast = useToastStore();

const serverError = ref("");

const form = ref({
  factureId: "",
  amount: "",
  currency: "CDF",
  method: "cash",
  reference: "",
  notes: "",
});

const methodOptions = [
  { label: "Espèces", value: "cash" },
  { label: "Mobile Money", value: "mobile_money" },
  { label: "Banque", value: "bank" },
];

async function submit() {
  serverError.value = "";

  try {
    const payload = {
      factureId: form.value.factureId,
      amount: Number(form.value.amount),
      currency: form.value.currency,
      method: form.value.method,
      reference: form.value.reference || undefined,
      notes: form.value.notes || undefined,
    };

    const created = await store.createPaiement(payload);

    if (created?.id) {
      router.push("/paiements");
      return;
    }

    router.push("/paiements");
  } catch (error) {
    serverError.value =
      error.response?.data?.message || error.message || "Enregistrement paiement impossible.";
    toast.error(serverError.value);
  }
}

function cancel() {
  router.push("/paiements");
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Enregistrer paiement</h1>
      <p class="his-page-subtitle">
        Création d’un paiement réel lié à une facture.
      </p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <BaseCard title="Informations paiement" subtitle="Montant, facture et mode de paiement.">
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="submit">
        <BaseInput
          v-model="form.factureId"
          label="ID facture"
          placeholder="Ex: 1"
          required
        />

        <BaseInput
          v-model="form.amount"
          label="Montant"
          type="number"
          min="0"
          required
        />

        <BaseInput
          v-model="form.currency"
          label="Devise"
          required
        />

        <BaseSelect
          v-model="form.method"
          label="Méthode"
          :options="methodOptions"
          required
        />

        <BaseInput
          v-model="form.reference"
          label="Référence transaction"
          placeholder="Optionnel"
        />

        <BaseInput
          v-model="form.notes"
          label="Notes"
          placeholder="Optionnel"
        />

        <div class="flex justify-end gap-3 md:col-span-2">
          <BaseButton type="button" variant="secondary" @click="cancel">
            Annuler
          </BaseButton>

          <BaseButton type="submit" :loading="store.saving">
            Enregistrer paiement
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>
