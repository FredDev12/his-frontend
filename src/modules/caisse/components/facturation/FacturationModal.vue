<script setup>
import { reactive, computed, watch, onMounted, onBeforeUnmount, nextTick, ref } from "vue"
import BaseButton from "../../../../components/ui/BaseButton.vue"
import BaseInput from "../../../../components/ui/BaseInput.vue"
import RadioGroup from "../../../../components/ui/RadioGroup.vue"

const props = defineProps({
  show: Boolean,
  reception_id: Number
})

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
  actes: [{ libelle: "", montant: 0 }],
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

// ==========================
// UX SCROLL AUTO
// ==========================
const addActe = async () => {
  form.actes.push({ libelle: "", montant: 0 })

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
  emit("validate", {
    ...form,
    montant_total: montant_total.value
  })
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
            class="grid grid-cols-2 gap-2 items-end"
          >
            <BaseInput
              v-model="acte.libelle"
              label="Acte"
              placeholder="Ex: Consultation"
            />

            <div class="flex gap-2">
              <BaseInput
                v-model="acte.montant"
                type="number"
                label="Montant"
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
      <div class="flex justify-between border-t pt-3">
        <strong>Total :</strong>
        <strong>{{ montant_total }} USD</strong>
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