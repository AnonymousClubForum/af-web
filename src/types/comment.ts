// 帖子相关类型定义
export interface Comment {
    id: string
    userId: string
    username: string
    avatarId?: string
    content: string
    parentComment?: {
        userId?: string
        username?: string
        content?: string
        ctime?: string
    }
    ctime?: string
}

export interface SaveCommentRequest {
    postId?: string
    parentId?: string
    content?: string
}

export interface QueryCommentPageRequest {
    pageNum: number
    pageSize: number
    postId: string
    userId?: string
    isDesc: boolean
}

