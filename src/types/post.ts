// 帖子相关类型定义
export interface Post {
    id: string
    userId: string
    username: string
    avatarId?: string
    title: string
    content: string
    sectionId?: number
    isTop?: number
    ctime?: string
    utime?: string
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
    sectionId?: number
}

