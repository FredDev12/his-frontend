// src/modules/triage/stores/triage.store.js

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { PaginatedType, QueryParamsType } from "../../../utils/pagination"

import {
  getUser,
  registerUser

} from "../../../api/auth.api"

export const useAdminStore = defineStore("admin", () => {
  // =========================
  // STATE
  // =========================
  const users = ref()
  
  const loading = ref(false)
  const error = ref(null)

  // =========================
  // GET ALL (pagination)
  // =========================
  const fetchUsers = async (params = {PaginatedType}) => {
    loading.value = true
    try {
      const res = await getUser(params)
      console.log("get ",res);
      
      users.value = res.data.users

      return res.data.users
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data) => {
    loading.value = true
    try {
      const res = await registerUser(data)
      console.log("create", res.data);

      this.users.value.unshift(res.data)

      return res.data
      
      
    } catch (err) {
      error.value = err
    } finally{
      loading.value = false
    }

  }

  
  return {
    // state
    users,
    loading,
    error,

    // actions
    fetchUsers,
    createUser
    
  }
})