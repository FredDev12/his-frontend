import {
  readFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import {
  describe,
  expect,
  it,
} from 'vitest'

function source(path) {
  return readFileSync(
    resolve(process.cwd(), path),
    'utf8',
  )
}

describe(
  'R4.4G3 — UI Imagerie',
  () => {
    it('la liste est une file de traitement sans création locale', () => {
      const page = source(
        'src/modules/imagerie/pages/ImagerieListPage.vue',
      )

      expect(page).toContain(
        'Radiologie, échographie, scanner et IRM demandés depuis les consultations.',
      )
      expect(page).not.toContain(
        'Nouvelle demande',
      )
    })

    it('la table ne propose ni modifier ni supprimer', () => {
      const table = source(
        'src/modules/imagerie/components/ImagerieTable.vue',
      )

      expect(table).toContain(
        'Voir / traiter',
      )
      expect(table).not.toContain(
        'Modifier',
      )
      expect(table).not.toContain(
        'Supprimer',
      )
      expect(table).not.toContain(
        'variant="danger"',
      )
    })

    it('le détail exige la permission résultat', () => {
      const page = source(
        'src/modules/imagerie/pages/ImagerieDetailsPage.vue',
      )

      expect(page).toContain(
        "auth.hasPermission(",
      )
      expect(page).toContain(
        "'examen:update_result'",
      )
    })

    it('le résultat est protégé par ConfirmDialog CONFIRMER', () => {
      const page = source(
        'src/modules/imagerie/pages/ImagerieDetailsPage.vue',
      )

      expect(page).toContain(
        '<ConfirmDialog',
      )
      expect(page).toContain(
        'require-text="CONFIRMER"',
      )
      expect(page).toContain(
        'variant="success"',
      )
      expect(page).toContain(
        ':patient-name="patientName"',
      )
    })

    it('le compte rendu validé devient en lecture seule', () => {
      const page = source(
        'src/modules/imagerie/pages/ImagerieDetailsPage.vue',
      )

      expect(page).toContain(
        "examen.statut ===",
      )
      expect(page).toContain(
        "'RESULTAT_DISPONIBLE'",
      )
      expect(page).toContain(
        'Compte rendu validé',
      )
    })

    it('les statuts utilisent le vocabulaire officiel backend', () => {
      const badge = source(
        'src/modules/imagerie/components/ImagerieStatusBadge.vue',
      )

      expect(badge).toContain(
        'DEMANDE',
      )
      expect(badge).toContain(
        'EN_COURS',
      )
      expect(badge).toContain(
        'RESULTAT_DISPONIBLE',
      )
      expect(badge).toContain(
        'ANNULE',
      )
    })
  },
)
