// 用户相关类型定义
export interface User {
    id: string
    username: string
    gender?: string
    avatarId?: string
    avatarUrl?: string
}

export interface SaveUserRequest {
    username?: string
    password?: string
    gender?: string
}

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
}
