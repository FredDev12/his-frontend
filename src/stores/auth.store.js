import { defineStore } from "pinia"
import { login, getProfile } from "../api/auth.api"

export const useAuthStore = defineStore("auth",{

state:()=>({
user:null,
token:localStorage.getItem("token") || null
}),

actions:{

async login(credentials){

const res = await login(credentials)

this.user = res.data.user
this.token = res.data.token

localStorage.setItem("token",res.data.token)

},

async loadProfile(){

const res = await getProfile()

this.user = res.data.user

},

logout(){

this.user=null
this.token=null

localStorage.removeItem("token")

}

}

})