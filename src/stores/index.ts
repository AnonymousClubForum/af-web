import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {User} from '../types'
import {getUser} from "../api";

export const useUserStore = defineStore('user', () => {
    const token = ref<string>(localStorage.getItem('token') || '')
    const user = ref<User | null>(null)

    const isLoggedIn = computed(() => !!token.value)

    // 获取用户信息
    async function loadFromServer() {
        if (isLoggedIn.value) {
            const userApiResponse = await getUser(null)
            setUser(userApiResponse.data)
        }
    }

    // 设置token
    function setToken(tokenStr: string) {
        localStorage.setItem('token', tokenStr)
        token.value = tokenStr
    }

    // 设置用户信息
    function setUser(userData: User) {
        user.value = userData
    }

    // 清除用户信息
    function clear() {
        user.value = null
        token.value = ''
        localStorage.removeItem('token')
    }

    return {
        token,
        user,
        isLoggedIn,
        loadFromServer,
        setToken,
        setUser,
        clear
    }
})
