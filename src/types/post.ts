// 帖子相关类型定义
export interface Post {
    id: number
    username: number
    title: string
    content: string
    cTime?: string
    uTime?: string
}

export interface SimplePost {
    id: number
    username: string
    title: string
    cTime?: string
    uTime?: string
}

export interface SavePostRequest {
    id?: number
    title?: string
    content?: string
}

export interface QueryPostPageRequest {
    pageNum: number
    pageSize: number
    username?: string
    title?: string
    content?: string
}

