// 用户相关类型定义

export interface User {
    id: number
    username: string
    password?: string
    avatar?: string
    email?: string
    bio?: string
    createTime?: string
    updateTime?: string
}

export interface SaveUserRequest {
    username: string
    password: string
    avatar?: string
    email?: string
    bio?: string
}

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
}

export interface UpdateUserRequest {
    avatar?: string
    email?: string
    bio?: string
}
