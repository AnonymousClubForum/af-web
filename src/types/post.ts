// 帖子相关类型定义

export interface Post {
    id: number
    title: string
    content: string
    userId: number
    author: string
    authorAvatar?: string
    viewCount: number
    createTime?: string
    updateTime?: string
}

export interface SimplePost {
    id: number
    title: string
    content: string
    userId: number
    author: string
    authorAvatar?: string
    viewCount: number
    createTime?: string
}

export interface SavePostRequest {
    title: string
    content: string
    id?: number // 更新时需要id
}

export interface QueryPostPageRequest {
    pageNum: number
    pageSize: number
    keyword?: string
    authorId?: number
}

export interface PageResult<T> {
    records: T[]
    total: number
    size: number
    current: number
    pages: number
}
