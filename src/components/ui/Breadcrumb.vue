<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

// Configuration des routes avec libellés et templates
const routeConfig = {
  "/": { label: "Accueil", icon: "📊" },
  "/reception": { label: "Réception", icon: "🏥" },
  "/fiches": { label: "Fiches de Patient", icon: "📋" },
  "/fiches/:id": { 
    label: "Détail fiche",
    icon: "📄",
    getLabel: (route) => `Fiche #${route.params.id}`
  },
  "/profile": { label: "Mon Profil", icon: "👤" }
}

// Détecter si une route correspond avec paramètres
const findMatchingRoute = (path) => {
  if (routeConfig[path]) {
    return { config: routeConfig[path], params: {} }
  }
  
  for (const [pattern, config] of Object.entries(routeConfig)) {
    if (pattern.includes(":")) {
      const patternParts = pattern.split("/")
      const pathParts = path.split("/")
      
      if (patternParts.length === pathParts.length) {
        const params = {}
        let match = true
        
        for (let i = 0; i < patternParts.length; i++) {
          if (patternParts[i].startsWith(":")) {
            const paramName = patternParts[i].slice(1)
            params[paramName] = pathParts[i]
          } else if (patternParts[i] !== pathParts[i]) {
            match = false
            break
          }
        }
        
        if (match) {
          return { config, params }
        }
      }
    }
  }
  
  return null
}

const breadcrumbs = computed(() => {
  const pathSegments = route.path.split("/").filter(segment => segment !== "")
  const items = []
  let currentPath = ""

  // Ajouter toujours l'accueil
  items.push({
    label: "Accueil",
    icon: "🏠",
    path: "/",
    isLast: pathSegments.length === 0
  })

  // Construire les segments
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    const match = findMatchingRoute(currentPath)
    
    let label = segment
    let icon = "📁"
    if (match) {
      if (match.config.getLabel) {
        label = match.config.getLabel({ params: match.params, path: currentPath })
      } else {
        label = match.config.label
      }
      icon = match.config.icon || "📁"
    } else {
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    }
    
    items.push({
      label,
      icon,
      path: currentPath,
      isLast: index === pathSegments.length - 1
    })
  })

  return items
})

const navigate = (path) => {
  router.push(path)
}
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex items-center flex-wrap gap-1 text-sm">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
        class="flex items-center"
      >
        <!-- Séparateur (sauf pour le premier) -->
        <span v-if="index > 0" class="mx-1 text-gray-400 select-none">/</span>
        
        <!-- Lien cliquable ou texte selon si dernier élément -->
        <button
          v-if="!item.isLast"
          @click="navigate(item.path)"
          class="text-blue-600 hover:text-blue-800 hover:underline transition flex items-center gap-1 px-1 py-0.5 rounded"
        >
          <span>{{ item.icon }}</span>
          <span class="truncate max-w-[150px] md:max-w-none">{{ item.label }}</span>
        </button>
        <span
          v-else
          class="text-gray-700 font-medium flex items-center gap-1 px-1"
        >
          <span>{{ item.icon }}</span>
          <span class="truncate max-w-[150px] md:max-w-none">{{ item.label }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>