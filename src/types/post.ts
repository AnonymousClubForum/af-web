// 帖子相关类型定义
export interface Post {
    id: string
    userId: string
    username: string
    title: string
    content: string
    cTime?: string
    uTime?: string
}

export interface SimplePost {
    id: string
    username: string
    title: string
    cTime?: string
    uTime?: string
}

export interface SavePostRequest {
    id?: string
    title?: string
    content?: string
}

export interface QueryPostPageRequest {
    pageNum: number
    pageSize: number
    userId?: string
    searchContent?: string
}

