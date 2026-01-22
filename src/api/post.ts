import request from '../utils/request'
import type {ApiResponse, PageResult, Post, QueryPostPageRequest, SavePostRequest, SimplePost} from '../types'

// 创建帖子
export function createPost(data: SavePostRequest): Promise<ApiResponse<string>> {
    return request({
        url: '/platform/post/save',
        method: 'post',
        data
    })
}

// 更新帖子
export function updatePost(data: SavePostRequest): Promise<ApiResponse<string>> {
    return request({
        url: '/platform/post/update',
        method: 'post',
        data
    })
}

// 删除帖子
export function deletePost(id: string): Promise<ApiResponse<string>> {
    return request({
        url: `/platform/post/delete?id=${id}`,
        method: 'delete'
    })
}

// 获取帖子详情
export function getPost(id: string): Promise<ApiResponse<Post>> {
    return request({
        url: `/platform/post/get?id=${id}`,
        method: 'get'
    })
}

// 分页查询帖子列表
export function getPostPage(params: QueryPostPageRequest): Promise<ApiResponse<PageResult<SimplePost>>> {
    return request({
        url: '/platform/post/get_page',
        method: 'get',
        params
    })
}
