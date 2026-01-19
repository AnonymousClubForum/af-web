import request from '../utils/request'
import type {ApiResponse, PageResult, Comment, QueryCommentPageRequest, SaveCommentRequest} from "../types";

/**
 * 发布评论
 * @param data - 评论参数
 */
export function createComment(data: SaveCommentRequest): Promise<ApiResponse<string>> {
    return request({
        url: '/comment/save',
        method: 'post',
        data
    })
}

/**
 * 删除评论
 * @param id - 评论ID
 */
export function deleteComment(id: string): Promise<ApiResponse<string>> {
    return request({
        url: '/comment/delete',
        method: 'delete',
        params: {id}
    })
}

/**
 * 分页获取评论
 * @param params - 分页参数
 */
export function getCommentPage(params: QueryCommentPageRequest): Promise<ApiResponse<PageResult<Comment>>> {
    return request({
        url: '/comment/get_page',
        method: 'get',
        params
    })
}