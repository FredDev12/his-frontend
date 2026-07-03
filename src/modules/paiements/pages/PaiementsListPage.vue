<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import ConfirmDialog from "@/shared/ui/overlay/ConfirmDialog.vue";

import PaiementTable from "@/modules/paiements/components/PaiementTable.vue";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { usePaiementsStore } from "@/modules/paiements/stores/paiements.store";
import { useToastStore } from "@/shared/stores/toast.store";

const auth = useAuthStore();
const store = usePaiementsStore();
const toast = useToastStore();

const paiementToCancel = ref(null);
const cancelOpen = ref(false);

const totalLabel = computed(() => `${store.pagination.total || 0} paiement(s)`);

onMounted(() => {
  loadPaiements({ page: 1 });
});

async function loadPaiements(params = {}) {
  try {
    await store.fetchPaiements({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    });
  } catch (error) {
    toast.error(error.response?.data?.message || "Impossible de charger les paiements.");
  }
}

async function goToPage(page) {
  await loadPaiements({ page, limit: store.pagination.limite });
}

function openCancel(paiement) {
  paiementToCancel.value = paiement;
  cancelOpen.value = true;
}

function closeCancel() {
  paiementToCancel.value = null;
  cancelOpen.value = false;
}

async function confirmCancel() {
  if (!paiementToCancel.value?.id) return;

  await store.cancelPaiement(paiementToCancel.value.id, {
    reason: "Annulation depuis l’interface caisse",
  });

  closeCancel();
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Paiements / Caisse</h1>
        <p class="his-page-subtitle">
          Encaissements, paiements validés et annulations caisse.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('paiement:create')" to="/paiements/create">
        <BaseButton>Enregistrer paiement</BaseButton>
      </RouterLink>
    </header>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">{{ totalLabel }}</span>
      </template>

      <PaiementTable
        :paiements="store.paiements"
        :loading="store.loading"
        :can-cancel="auth.hasPermission('paiement:cancel')"
        @cancel="openCancel"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || store.pagination.page <= 1"
            @click="goToPage(store.pagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasNext"
            @click="goToPage(store.pagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <ConfirmDialog
      :open="cancelOpen"
      title="Annuler ce paiement"
      :message="`Cette action va annuler le paiement ${paiementToCancel?.paiementCode || ''}. Cette action doit rester auditée côté serveur.`"
      confirm-label="Annuler paiement"
      cancel-label="Retour"
      variant="warning"
      :loading="store.cancelling"
      @cancel="closeCancel"
      @confirm="confirmCancel"
    />
  </div>
</template>
