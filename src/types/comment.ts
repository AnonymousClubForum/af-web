// 帖子相关类型定义
export interface Comment {
    id: string
    userId: string
    username: string
    content: string
    ctime?: string
    utime?: string
}

export interface SaveCommentRequest {
    postId?: string
    parentId?: string
    content?: string
}

export interface QueryCommentPageRequest {
    pageNum: number
    pageSize: number
    postId?: string
    parentId?: string
}

