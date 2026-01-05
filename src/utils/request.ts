import axios, {type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig} from 'axios'
import {ElMessage} from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const {code, message} = response.data

        // 成功响应
        if (code === 200 || code === 0) {
            return response.data
        }

        // 业务错误
        ElMessage.error(message || '请求失败')
        return Promise.reject(new Error(message || '请求失败'))
    },
    (error) => {
        console.error('Response error:', error)

        // 处理 HTTP 错误状态码
        if (error.response) {
            const {status} = error.response
            switch (status) {
                case 401:
                    ElMessage.error('未授权，请重新登录')
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.href = '/login'
                    break
                case 403:
                    ElMessage.error('拒绝访问')
                    break
                case 404:
                    ElMessage.error('请求资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error(error.response.data?.message || '请求失败')
            }
        } else {
            ElMessage.error('网络错误，请检查网络连接')
        }

        return Promise.reject(error)
    }
)

export default service
