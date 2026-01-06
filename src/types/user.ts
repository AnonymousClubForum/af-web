// 用户相关类型定义
export interface User {
    id: number
    username: string
    gender?: string
    avatarId?: number
    avatarThumbnailId?: number
}

export interface SaveUserRequest {
    username?: string
    password?: string
    gender?: string
    avatar?: File
    avatarHeight?: number
    avatarWidth?: number
}

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
}
