import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {User} from '../types'

export const useUserStore = defineStore('user', () => {
    const token = ref<string>(localStorage.getItem('token') || '')
    const user = ref<User | null>(
        localStorage.getItem('user')
            ? JSON.parse(localStorage.getItem('user')!)
            : null
    )

    const isLoggedIn = computed(() => !!token.value)

    // 设置用户信息
    function setUser(userData: User, userToken: string) {
        user.value = userData
        token.value = userToken
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userToken)
    }

    // 清除用户信息
    function clearUser() {
        user.value = null
        token.value = ''
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    // 更新用户信息
    function updateUser(userData: User) {
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
    }

    return {
        token,
        user,
        isLoggedIn,
        setUser,
        clearUser,
        updateUser
    }
})
