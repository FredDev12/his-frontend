import { ref, computed } from "vue"
import { useToastStore } from "../../../stores/toast.store"
import { useReceptionStore } from "../../../stores/reception.store"
import { smartFindExistingPatient } from "../../../modules/reception/services/reception.service"
import { getPatient } from "../../../api/patients.api"

export function useReceptionWizard() {
  const toast = useToastStore()
  const reception = useReceptionStore()

  // État
  const step = ref(1)
  const patientType = ref("public")
  const selectedAgent = ref(null)
  const selectedPatient = ref(null)
  const relation = ref("SELF")
  const typedChildName = ref("")
  const existingMatches = ref([])
  const checkingExisting = ref(false)
  const openingPatient = ref(false)

  // Computed
  const paymentOk = computed(() => reception.paymentValidated)
  
  const patientAlreadyPaid = computed(() => {
    const p = selectedPatient.value
    if (!p) return false
    if (p.paiement_effectue === true) return true
    if (p.paiement_fiche?.status === "PAID") return true
    if (p.paiement_fiche?.paid === true) return true
    if (p.paiement_fiche?.date_paiement) return true
    return false
  })

  // Le paiement n'est requis que pour les patients PUBLICS
  const requiresPayment = computed(() => patientType.value === "public")
  
  // Le paiement est nécessaire seulement si :
  // 1. C'est un patient PUBLIC
  // 2. Le patient n'est pas déjà payé
  // 3. On est en mode création (pas de patient sélectionné ou patient non payé)
  const paymentRequiredNow = computed(() => {
    // Les agents n'ont jamais besoin de paiement
    if (patientType.value === "agent") return false
    
    // Pour les publics : besoin de paiement seulement si pas déjà payé
    return requiresPayment.value && !patientAlreadyPaid.value
  })
  
  // Accès au formulaire :
  const canAccessForm = computed(() => {
    // Les agents ont toujours accès au formulaire
    if (patientType.value === "agent") return true
    
    // Pour les publics : besoin que le paiement soit OK ou que le patient soit déjà payé
    return patientAlreadyPaid.value || paymentOk.value
  })

  const totalSteps = computed(() => 4)

  const stepTitle = computed(() => {
    if (patientType.value === "agent") {
      const map = {
        1: "Type de patient",
        2: "Recherche agent CAC",
        3: "Ayant-droit & vérification",
        4: "Création fiche patient"
      }
      return map[step.value] || "Admission"
    }
    const map = {
      1: "Type de patient",
      2: "Recherche patient",
      3: "Paiement",
      4: "Création fiche patient"
    }
    return map[step.value] || "Admission"
  })

  const stepDescription = computed(() => {
    if (patientType.value === "agent") {
      const map = {
        1: "Choisissez le type de patient pour commencer",
        2: "Recherchez et sélectionnez l'agent CAC",
        3: "Définissez le lien de parenté et vérifiez les doublons",
        4: "Complétez les informations du patient"
      }
      return map[step.value] || ""
    }
    const map = {
      1: "Choisissez le type de patient pour commencer",
      2: "Recherchez un patient existant ou préparez-vous à en créer un nouveau",
      3: "Effectuez le paiement de la fiche de réception",
      4: "Complétez les informations du patient"
    }
    return map[step.value] || ""
  })

  // Méthodes
  const resetFlow = () => {
    step.value = 1
    patientType.value = "public"
    selectedAgent.value = null
    selectedPatient.value = null
    relation.value = "SELF"
    typedChildName.value = ""
    existingMatches.value = []
    checkingExisting.value = false
    openingPatient.value = false

    if (reception.resetPayment) reception.resetPayment()
    if (reception.resetDraft) reception.resetDraft()

    toast.add("Admission terminée. Prêt pour une nouvelle fiche ✅", "success")
  }

  const goNext = () => {
    if (step.value === 1) {
      step.value = 2
      return
    }

    if (step.value === 2) {
      if (patientType.value === "agent") {
        if (!selectedAgent.value) return toast.add("Sélectionnez un agent CAC", "info")
        step.value = 3
        return
      } else {
        if (selectedPatient.value && patientAlreadyPaid.value) {
          step.value = 4
          return
        }
        step.value = 3
        return
      }
    }

    // Agent: étape 3 -> 4 (pas de vérification de paiement)
    if (patientType.value === "agent" && step.value === 3) {
      step.value = 4
      return
    }

    // Public: étape 3 (paiement) -> 4
    if (patientType.value === "public" && step.value === 3) {
      // Vérifier le paiement seulement pour les publics
      if (!canAccessForm.value) {
        return toast.add("Paiement obligatoire avant de continuer", "warning")
      }
      step.value = 4
      return
    }
  }

  const goBack = () => {
    if (step.value === 1) return
    step.value -= 1
  }

  const handleAgent = (agent) => {
    selectedAgent.value = agent
    selectedPatient.value = null
    existingMatches.value = []
    toast.add("Agent sélectionné", "success")
    step.value = 3
  }

  const handlePatient = async (patient) => {
    openingPatient.value = true
    try {
      const res = await getPatient(patient.id)
      selectedPatient.value = res.data.data
      toast.add("Fiche patient ouverte", "success")

      if (patientType.value === "public") {
        step.value = patientAlreadyPaid.value ? 4 : 3
      }
      if (patientType.value === "agent") {
        step.value = 4
      }
    } catch (e) {
      toast.add("Impossible d’ouvrir la fiche patient", "error")
    } finally {
      openingPatient.value = false
    }
  }

  const chooseRelation = async (rel) => {
    relation.value = rel
    existingMatches.value = []
    selectedPatient.value = null

    if (!selectedAgent.value) return

    if (rel === "CHILD" && !typedChildName.value.trim()) {
      toast.add("Saisissez le nom de l’enfant puis cliquez sur Vérifier", "info")
      return
    }

    await checkExisting()
  }

  const checkExisting = async () => {
    if (!selectedAgent.value) return

    checkingExisting.value = true
    try {
      const res = await smartFindExistingPatient({
        relation: relation.value,
        agent: selectedAgent.value,
        typedName: typedChildName.value
      })

      existingMatches.value = res.matches || []

      if (existingMatches.value.length > 0) {
        toast.add("Fiches existantes possibles trouvées", "info")
      } else {
        toast.add("Aucune fiche existante trouvée, vous pouvez créer", "success")
      }
    } catch (e) {
      toast.add("Erreur lors de la vérification des fiches", "error")
    } finally {
      checkingExisting.value = false
    }
  }

  const forceCreateNew = () => {
    selectedPatient.value = null
    toast.add("Mode création activé (attention aux doublons)", "warning")
  }

  // Watch
  const watchPatientType = (val) => {
    selectedAgent.value = null
    selectedPatient.value = null
    existingMatches.value = []
    relation.value = "SELF"
    typedChildName.value = ""
    if (reception.setPatientType) reception.setPatientType(val)
    step.value = 1
  }

  return {
    // État
    step,
    patientType,
    selectedAgent,
    selectedPatient,
    relation,
    typedChildName,
    existingMatches,
    checkingExisting,
    openingPatient,
    
    // Computed
    paymentOk,
    patientAlreadyPaid,
    requiresPayment,
    paymentRequiredNow,
    canAccessForm,
    totalSteps,
    stepTitle,
    stepDescription,
    
    // Méthodes
    resetFlow,
    goNext,
    goBack,
    handleAgent,
    handlePatient,
    chooseRelation,
    checkExisting,
    forceCreateNew,
    watchPatientType
  }
}