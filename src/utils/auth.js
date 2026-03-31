// Vérifie si l'utilisateur est authentifié
export const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  
  // Vérifier si le token existe
  if (!token) return false
  
  // Optionnel: Vérifier si le token est expiré
  try {
    // Décoder le token JWT (si c'est un JWT)
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      const exp = payload.exp * 1000 // Convertir en millisecondes
      
      // Si le token a une date d'expiration et qu'elle est dépassée
      if (exp && Date.now() > exp) {
        // Nettoyer le token expiré
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return false
      }
    }
  } catch (e) {
    // Si ce n'est pas un JWT ou si erreur de décodage
    console.warn("Token non-JWT ou invalide, mais présent")
  }
  
  return true
}

// Récupérer le token
export const getToken = () => {
  return localStorage.getItem("token")
}

// Récupérer l'utilisateur
export const getUser = () => {
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Définir l'utilisateur et le token
export const setAuth = (token, user) => {
  if (token) localStorage.setItem("token", token)
  if (user) localStorage.setItem("user", JSON.stringify(user))
}

// Nettoyer l'authentification
export const clearAuth = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}