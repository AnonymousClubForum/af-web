import request from '../utils/request'
import type {ApiResponse, LoginRequest, LoginResponse, SaveUserRequest, UpdateUserRequest, User} from '../types'

// 用户注册
export function register(data: SaveUserRequest): Promise<ApiResponse<User>> {
    return request({
        url: '/user/register',
        method: 'post',
        data
    })
}

// 用户登录
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return request({
        url: '/user/login',
        method: 'post',
        data
    })
}

// 获取当前用户信息
export function getCurrentUser(): Promise<ApiResponse<User>> {
    return request({
        url: '/user/current',
        method: 'get'
    })
}

// 更新用户信息
export function updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return request({
        url: '/user/update',
        method: 'put',
        data
    })
}

// 上传头像
export function uploadAvatar(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData()
    formData.append('file', file)
    return request({
        url: '/user/upload/avatar',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
