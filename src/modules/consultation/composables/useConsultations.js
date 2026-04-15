import { ref, computed } from 'vue'
import { useConsultationStore } from '../stores/consultation.store'
import { ConsultationStatus, ConsultationType } from '../types/consultation'

/**
 * Composable for managing consultation-related logic
 */
export function useConsultations() {
  const store = useConsultationStore()

  // Local state
  const searchQuery = ref('')
  const selectedStatus = ref('')
  const selectedType = ref('')
  const dateRange = ref({ start: null, end: null })

  // Computed
  const filteredConsultations = computed(() => {
    let filtered = store.consultationsList

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(consultation =>
        consultation.patient?.nom?.toLowerCase().includes(query) ||
        consultation.patient?.prenom?.toLowerCase().includes(query) ||
        consultation.motif?.toLowerCase().includes(query) ||
        consultation.diagnostic?.toLowerCase().includes(query)
      )
    }

    if (selectedStatus.value) {
      filtered = filtered.filter(consultation => consultation.statut === selectedStatus.value)
    }

    if (selectedType.value) {
      filtered = filtered.filter(consultation => consultation.type === selectedType.value)
    }

    if (dateRange.value.start && dateRange.value.end) {
      filtered = filtered.filter(consultation => {
        const consultationDate = new Date(consultation.dateConsultation)
        return consultationDate >= dateRange.value.start && consultationDate <= dateRange.value.end
      })
    }

    return filtered
  })

  const statusOptions = computed(() => [
    { value: '', label: 'Tous les statuts' },
    { value: ConsultationStatus.EN_ATTENTE, label: 'En attente' },
    { value: ConsultationStatus.EN_COURS, label: 'En cours' },
    { value: ConsultationStatus.TERMINEE, label: 'Terminée' },
    { value: ConsultationStatus.ANNULEE, label: 'Annulée' }
  ])

  const typeOptions = computed(() => [
    { value: '', label: 'Tous les types' },
    { value: ConsultationType.GENERALE, label: 'Générale' },
    { value: ConsultationType.SPECIALISEE, label: 'Spécialisée' },
    { value: ConsultationType.URGENCE, label: 'Urgence' },
    { value: ConsultationType.SUIVI, label: 'Suivi' }
  ])

  // Methods
  const searchConsultations = async (params = {}) => {
    const searchParams = {
      ...params,
      q: searchQuery.value,
      statut: selectedStatus.value,
      type: selectedType.value,
      dateDebut: dateRange.value.start?.toISOString(),
      dateFin: dateRange.value.end?.toISOString()
    }

    await store.fetchConsultations(searchParams)
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedStatus.value = ''
    selectedType.value = ''
    dateRange.value = { start: null, end: null }
  }

  const getStatusBadgeType = (status) => {
    switch (status) {
      case ConsultationStatus.EN_ATTENTE:
        return 'warning'
      case ConsultationStatus.EN_COURS:
        return 'info'
      case ConsultationStatus.TERMINEE:
        return 'success'
      case ConsultationStatus.ANNULEE:
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status) => {
    return statusOptions.value.find(option => option.value === status)?.label || status
  }

  const getTypeLabel = (type) => {
    return typeOptions.value.find(option => option.value === type)?.label || type
  }

  const calculateIMC = (poids, taille) => {
    if (!poids || !taille) return null
    const tailleM = taille / 100
    return (poids / (tailleM * tailleM)).toFixed(1)
  }

  const getIMCCategory = (imc) => {
    if (!imc) return ''
    if (imc < 18.5) return 'Insuffisance pondérale'
    if (imc < 25) return 'Poids normal'
    if (imc < 30) return 'Surpoids'
    if (imc < 35) return 'Obésité modérée'
    if (imc < 40) return 'Obésité sévère'
    return 'Obésité morbide'
  }

  return {
    // State
    searchQuery,
    selectedStatus,
    selectedType,
    dateRange,

    // Computed
    filteredConsultations,
    statusOptions,
    typeOptions,

    // Store access
    consultations: store.consultations,
    consultation: store.consultation,
    isLoading: store.isLoading,
    hasError: store.hasError,

    // Methods
    searchConsultations,
    resetFilters,
    getStatusBadgeType,
    getStatusLabel,
    getTypeLabel,
    calculateIMC,
    getIMCCategory,

    // Store actions
    fetchConsultations: store.fetchConsultations,
    fetchConsultation: store.fetchConsultation,
    createConsultation: store.createNewConsultation,
    updateConsultation: store.updateConsultation,
    deleteConsultation: store.deleteConsultation
  }
}