import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {User} from '../types'
import {getUser} from "../api";

export const useUserStore = defineStore('user', () => {
    const token = ref<string>(localStorage.getItem('token') || '')
    const user = ref<User | null>(
        localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
    )

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
        localStorage.setItem('user', JSON.stringify(userData))
        user.value = userData
    }

    // 清除用户信息
    function clear() {
        user.value = null
        token.value = ''
        localStorage.removeItem('user')
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

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref<boolean>(
        localStorage.getItem('theme') ?
            localStorage.getItem('theme') === 'dark' :
            window.matchMedia('(prefers-color-scheme: dark)').matches
    )

    // 获取用户信息
    async function toggleDarkMode() {
        // 更新 html 根元素的 dark 类
        document.documentElement.classList.toggle('dark', isDark.value)
        // 保存到本地存储，刷新页面不丢失
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }

    return {
        isDark,
        toggleDarkMode
    }
})
