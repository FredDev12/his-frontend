// src/utils/errorFilter.js
export const setupErrorFilter = () => {
  if (process.env.NODE_ENV === 'production') {
    // En production, on peut complètement supprimer ces erreurs
    const originalError = console.error
    console.error = function(...args) {
      const message = args[0]?.toString?.() || ''
      
      if (
        message.includes('extension') ||
        message.includes('runtime') ||
        message.includes('Could not establish connection')
      ) {
        return
      }
      
      originalError.apply(console, args)
    }
  }
  
  // Intercepter les erreurs non gérées
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.toString?.() || event.reason?.message || ''
    
    if (
      message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Extension context invalidated')
    ) {
      event.preventDefault()
      return
    }
  })
}