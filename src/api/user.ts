import request from '../utils/request'
import type {ApiResponse, LoginRequest, LoginResponse, SaveUserRequest, User} from '../types'

// 用户注册
export function register(data: SaveUserRequest): Promise<ApiResponse<User>> {
    return request({
        url: '/platform/user/register',
        method: 'post',
        data
    })
}

// 用户登录
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return request({
        url: '/platform/user/login',
        method: 'post',
        data
    })
}

// 更新用户信息
export function updateUser(data: SaveUserRequest): Promise<ApiResponse<string>> {
    return request({
        url: '/platform/user/update',
        method: 'post',
        data
    })
}

// 获取当前用户信息
export function getUser(userId: string | null | undefined): Promise<ApiResponse<User>> {
    return request({
        url: '/platform/user/get',
        method: 'get',
        params: {userId}
    })
}

// 上传文件
export function uploadAvatar(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append("file", file);

    return request({
        url: '/platform/user/avatar/upload',
        method: 'post',
        data: formData
    })
}
