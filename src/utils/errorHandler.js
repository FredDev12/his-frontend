// src/utils/errorHandler.js
export const setupErrorHandler = () => {
  // Intercepter les erreurs non gérées
  window.addEventListener('error', (event) => {
    if (isExtensionError(event.message || event.error)) {
      event.preventDefault()
      return false
    }
  })

  // Intercepter les rejets de promesses non gérés
  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(event.reason)) {
      event.preventDefault()
      return false
    }
  })

  // Override console.error
  const originalError = console.error
  console.error = function(...args) {
    const message = args[0]?.toString?.() || ''
    if (isExtensionError(message)) {
      return
    }
    originalError.apply(console, args)
  }

  // Override console.warn
  const originalWarn = console.warn
  console.warn = function(...args) {
    const message = args[0]?.toString?.() || ''
    if (isExtensionError(message)) {
      return
    }
    originalWarn.apply(console, args)
  }
}

// Fonction pour détecter les erreurs d'extension
const isExtensionError = (error) => {
  const errorStr = error?.toString?.() || error || ''
  
  const patterns = [
    'Could not establish connection',
    'Receiving end does not exist',
    'Unchecked runtime.lastError',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://',
    'content-all.js',
    'all-frames.js',
    'content.js',
    'runtime.lastError'
  ]
  
  return patterns.some(pattern => errorStr.includes(pattern))
}