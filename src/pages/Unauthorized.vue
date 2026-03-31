<!-- pages/Unauthorized.vue -->
<template>
  <div class="h-screen flex items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-red-600">403</h1>
      <p>Accès refusé</p>
      <button @click="$router.push('/')" class="px-4 py-2 bg-blue-600 text-white rounded">
        Retour accueil
      </button>
    </div>
  </div>
</template>