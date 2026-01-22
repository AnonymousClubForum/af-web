import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {SaveUserRequest, User} from '../types'
import {ElMessage} from "element-plus";
import {getImageUrl} from "../utils/image.ts";

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
        user.value.avatarUrl = getImageUrl(userData.avatarId)
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
    function updateUser(userData: SaveUserRequest) {
        if (!user.value) {
            ElMessage.error('登录过期')
            return
        }
        if (userData.username)
            user.value.username = userData.username
        if (userData.gender)
            user.value.gender = userData.gender
        localStorage.setItem('user', JSON.stringify(user.value))
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
