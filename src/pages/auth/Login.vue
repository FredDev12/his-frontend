<script setup>

import { ref } from "vue"
import { useRouter } from "vue-router"

import BaseButton from "../../components/ui/BaseButton.vue"
import BaseInput from "../../components/ui/BaseInput.vue"

import { useAuthStore } from "../../stores/auth.store"

const router = useRouter()

const auth = useAuthStore()

const email = ref("")
const password = ref("")

const submit = async ()=>{

await auth.login({
email:email.value,
password:password.value
})

router.push("/")

}

</script>

<template>

<div class="card w-96">

<h1 class="text-xl font-bold mb-4">

Connexion

</h1>

<BaseInput label="Email" v-model="email"/>

<BaseInput label="Password" v-model="password"/>

<BaseButton
variant="primary"
class="mt-4 w-full"
@click="submit"
>

Se connecter

</BaseButton>

</div>

</template>