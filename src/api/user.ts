import request from '../utils/request'
import type {ApiResponse, LoginRequest, LoginResponse, SaveUserRequest, User} from '../types'

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

// 更新用户信息
export function updateUser(data: SaveUserRequest): Promise<ApiResponse<string>> {
    return request({
        url: '/user/update',
        method: 'post',
        data
    })
}
