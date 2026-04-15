<script setup>
import { reactive, computed, watch, onMounted, onBeforeUnmount, nextTick, ref } from "vue"
import BaseButton from "../../../../components/ui/BaseButton.vue"
import BaseInput from "../../../../components/ui/BaseInput.vue"
import RadioGroup from "../../../../components/ui/RadioGroup.vue"
import { useToastStore } from "../../../../stores/toast.store"

const props = defineProps({
  show: Boolean,
  reception_id: Number
})

const toast = useToastStore()
const emit = defineEmits(["close", "validate"])

// ==========================
// REF SCROLL CONTAINER
// ==========================
const actesContainer = ref(null)

// ==========================
// FORM
// ==========================
const form = reactive({
  reception_id: null,
  actes: [
    { libelle: "", montant: 0 , devise: "USD" }
  ],
  mode_paiement: "CASH",
  paiement_effectue: true,
  observations: ""
})

// ==========================
// RESET FORM
// ==========================
watch(
  () => props.show,
  (val) => {
    if (val) {
      form.reception_id = props.reception_id || null
      form.actes = [{ libelle: "", montant: 0 }]
      form.mode_paiement = "CASH"
      form.paiement_effectue = true
      form.observations = ""
    }
  }
)

// ==========================
// TOTAL
// ==========================
const montant_total = computed(() =>
  form.actes.reduce((sum, a) => sum + Number(a.montant || 0), 0)
)

const totalUSD = computed(() =>
  form.actes
    .filter(a => a.devise === "USD")
    .reduce((s, a) => s + Number(a.montant || 0), 0)
)

const totalCDF = computed(() =>
  form.actes
    .filter(a => a.devise === "CDF")
    .reduce((s, a) => s + Number(a.montant || 0), 0)
)

// ==========================
// UX SCROLL AUTO
// ==========================
const addActe = async () => {
  form.actes.push({ libelle: "", montant: 0, devise: "USD"})

  await nextTick()

  if (actesContainer.value) {
    actesContainer.value.scrollTop = actesContainer.value.scrollHeight
  }
}

const cleanActe = async () => {
  if (!confirm("Voulez-vous vraiment vider tous les actes ?")) return

  form.actes = [{ libelle: "", montant: 0 }]

  await nextTick()

  if (actesContainer.value) {
    actesContainer.value.scrollTop = 0
  }
}


const removeActe = (index) => {
  form.actes.splice(index, 1)
}

const validate = () => {
  // =========================
  // 1. VALIDATION ACTES
  // =========================
  if (!form.actes.length) {
    toast.add("Veuillez ajouter au moins un acte", "warning", "center", 40000)
    return
  }

  for (const [index, acte] of form.actes.entries()) {
    if (!acte.libelle || acte.libelle.trim() === "") {
      toast.add(`L'acte #${index + 1} doit avoir un libellé`, "warning", "center", 40000)
      return
    }

    if (acte.montant === null || acte.montant === undefined || Number(acte.montant) <= 0) {
      toast.add(`Le montant de l'acte "${acte.libelle}" doit être supérieur à 0`, "warning", "center", 40000)
      return
    }

    if (!acte.devise) {
      toast.add(`La devise est obligatoire pour l'acte "${acte.libelle}"`, "warning", "center", 40000)
      return
    }
  }

  // =========================
  // 2. VALIDATION MODE PAIEMENT
  // =========================
  if (!form.mode_paiement) {
    toast.add("Veuillez sélectionner un mode de paiement", "warning", "center", 40000)
    return
  }

  // =========================
  // 3. VALIDATION OK → CLEAN DATA
  // =========================
  const payload = {
    ...form,
    actes: form.actes.map(a => ({
      libelle: a.libelle.trim(),
      montant: Number(a.montant),
      devise: a.devise
    })),
    montant_total: montant_total.value
  }

  emit("validate", payload)
}

// ==========================
// SCROLL LOGIC UX
// ==========================
const isScrollable = computed(() => form.actes.length > 3)

// ==========================
// ESC CLOSE
// ==========================
const handleEsc = (e) => {
  if (e.key === "Escape") emit("close")
}

onMounted(() => window.addEventListener("keydown", handleEsc))
onBeforeUnmount(() => window.removeEventListener("keydown", handleEsc))
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click="$emit('close')"
  >

    <!-- MODALE -->
    <div
      class="bg-white p-6 rounded-lg w-full max-w-xl space-y-4"
      @click.stop
    >

      <h2 class="text-lg font-bold">Facturation</h2>

      <!-- ACTES -->
      <div class="space-y-3">

        <!-- SCROLL AREA -->
        <div
          ref="actesContainer"
          class="space-y-3 pr-2 transition-all"
          :class="isScrollable ? 'max-h-64 overflow-y-auto border rounded p-2' : ''"
        >

          <div
            v-for="(acte, index) in form.actes"
            :key="index"
            class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end border-b pb-3"
          >
            <BaseInput
              v-model="acte.libelle"
              label="Acte"
              placeholder="Ex: Consultation"
            />

            <BaseInput
              v-model="acte.montant"
              type="number"
              label="Montant"
            />
            <div class="flex items-end gap-2">
              <RadioGroup
                label="Devise"
                v-model="acte.devise"
                :options="[
                  { label: 'USD', value: 'USD', color: 'blue' },
                  { label: 'CDF', value: 'CDF', color: 'pink' }
                ]"
              />

              <BaseButton
                v-if="form.actes.length > 1"
                variant="danger"
                @click="removeActe(index)"
              >
                ✕
              </BaseButton>
            </div>
           
          </div>

        </div>

        <div class="flex flex-wrap gap-2 justify-between pt-2">

            <BaseButton
            variant="secondary"
            class="flex-1 sm:flex-none"
            @click="addActe"
            >
            ➕ Ajouter un acte
            </BaseButton>

            <BaseButton
            variant="danger"
            class="flex-1 sm:flex-none"
            @click="cleanActe"
            >
            🧹 Vider actes
            </BaseButton>

        </div>
      </div>
      <div class="text-sm text-gray-500">
        {{ form.actes.length }} acte(s)
      </div>

      <!-- TOTAL -->
      <div class="flex justify-between border-t pt-3 space-y-1">
        <p><strong>Total USD :</strong> {{ totalUSD }} USD</p>
        <p><strong>Total CDF :</strong> {{ totalCDF }} CDF</p>
      </div>

      <!-- MODE PAIEMENT -->
      <RadioGroup
        label="Mode de paiement"
        v-model="form.mode_paiement"
        :options="[
          { label: 'Cash', value: 'CASH', color: 'green' },
          { label: 'Carte', value: 'CARD', color: 'blue' },
          { label: 'Mobile Money', value: 'MOBILE', color: 'yellow' }
        ]"
      />

      <!-- PAIEMENT -->
      <div class="flex items-center gap-2">
        <input type="checkbox" v-model="form.paiement_effectue" />
        <span>Paiement effectué</span>
      </div>

      <!-- OBSERVATIONS -->
      <BaseInput
        v-model="form.observations"
        label="Observations"
        placeholder="Notes..."
      />

      <!-- ACTIONS -->
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="$emit('close')">
          Annuler
        </BaseButton>

        <BaseButton variant="success" @click="validate">
          Valider
        </BaseButton>
      </div>

    </div>
  </div>
</template>