import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R4.4G2 — contrat frontend Laboratoire', () => {
  it('utilise le module officiel examens avec type LABORATOIRE', () => {
    const service = source(
      'src/modules/laboratoire/services/laboratoire.service.js',
    )

    expect(service).toMatch(
      /api\.get\(\s*['"]\/examens['"]/,
    )
    expect(service).toContain(
      "const EXAMEN_TYPE = 'LABORATOIRE'",
    )
    expect(service).toMatch(
      /api\.get\(\s*`\/examens\/\$\{id\}`/,
    )
    expect(service).toMatch(
      /api\.patch\(\s*`\/examens\/\$\{id\}\/result`/,
    )
    expect(service).not.toContain("api.get('/laboratoire'")
    expect(service).not.toContain("api.post('/laboratoire'")
    expect(service).not.toContain("api.delete('/laboratoire'")
  })

  it('n’envoie jamais nextEpisodeStatus depuis le frontend Laboratoire', () => {
    const service = source(
      'src/modules/laboratoire/services/laboratoire.service.js',
    )
    const store = source(
      'src/modules/laboratoire/stores/laboratoire.store.js',
    )

    expect(service).not.toContain('nextEpisodeStatus')
    expect(store).not.toContain('nextEpisodeStatus')
  })

  it('traduit le filtre UI statut vers le contrat backend status', () => {
    const service = source(
      'src/modules/laboratoire/services/laboratoire.service.js',
    )
    const store = source(
      'src/modules/laboratoire/stores/laboratoire.store.js',
    )

    expect(service).toContain('const normalizedStatus =')
    expect(service).toContain('{ status: normalizedStatus }')
    expect(store).toContain(
      'status: params.statut ?? this.filters.statut',
    )
  })

  it('utilise uniquement les statuts officiels du backend', () => {
    const search = source(
      'src/modules/laboratoire/components/LaboratoireSearchBar.vue',
    )

    expect(search).toContain("value: 'DEMANDE'")
    expect(search).toContain("value: 'EN_COURS'")
    expect(search).toContain(
      "value: 'RESULTAT_DISPONIBLE'",
    )
    expect(search).toContain("value: 'ANNULE'")
    expect(search).not.toContain("value: 'pending'")
    expect(search).not.toContain("value: 'completed'")
    expect(search).not.toContain("value: 'cancelled'")
  })

  it('calcule les KPI avec les compteurs backend indépendants de la page', () => {
    const service = source(
      'src/modules/laboratoire/services/laboratoire.service.js',
    )
    const store = source(
      'src/modules/laboratoire/stores/laboratoire.store.js',
    )

    expect(service).toContain('countExamens()')
    expect(service).toContain("countExamens('DEMANDE')")
    expect(service).toContain("countExamens('EN_COURS')")
    expect(service).toContain(
      "countExamens('RESULTAT_DISPONIBLE')",
    )
    expect(service).toContain('resultatsDisponibles')
    expect(store).toContain('async fetchKpis()')
    expect(store).toContain('state.kpis.demandes')
    expect(store).toContain('state.kpis.enCours')
  })

  it('valide le résultat via la méthode de service réellement exposée', () => {
    const service = source(
      'src/modules/laboratoire/services/laboratoire.service.js',
    )
    const store = source(
      'src/modules/laboratoire/stores/laboratoire.store.js',
    )

    expect(service).toContain('async updateResult(id, payload)')
    expect(store).toContain(
      'laboratoireService.updateResult(id, payload)',
    )
    expect(store).not.toContain(
      'laboratoireService.validateResult',
    )
  })

  it('refuse dans le store un détail qui n’est pas LABORATOIRE', () => {
    const store = source(
      'src/modules/laboratoire/stores/laboratoire.store.js',
    )

    expect(store).toContain(
      "normalized.type !== 'LABORATOIRE'",
    )
    expect(store).toContain(
      'LABORATOIRE_TYPE_SCOPE_DENIED',
    )
  })

  it('supprime le vieux CRUD Laboratoire du store', () => {
    const store = source(
      'src/modules/laboratoire/stores/laboratoire.store.js',
    )

    expect(store).not.toContain('createExamen(')
    expect(store).not.toContain('removeExamen(')
    expect(store).not.toContain('updateExamen(')
    expect(store).not.toContain('statusBroadcastService')
  })
})
