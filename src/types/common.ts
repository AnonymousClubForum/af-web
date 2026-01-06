// 通用响应类型定义

export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}


export interface PageResult<T> {
    records: T[]
    total: number
    size: number
    current: number
}