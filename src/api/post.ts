import request from '../utils/request'
import type {ApiResponse, PageResult, Post, QueryPostPageRequest, SavePostRequest} from '../types'

// 分页查询帖子列表
export function getPostList(params: QueryPostPageRequest): Promise<ApiResponse<PageResult<Post>>> {
    return request({
        url: '/post/page',
        method: 'get',
        params
    })
}

// 获取帖子详情
export function getPostDetail(id: number): Promise<ApiResponse<Post>> {
    return request({
        url: `/post/${id}`,
        method: 'get'
    })
}

// 创建帖子
export function createPost(data: SavePostRequest): Promise<ApiResponse<Post>> {
    return request({
        url: '/post/create',
        method: 'post',
        data
    })
}

// 更新帖子
export function updatePost(data: SavePostRequest): Promise<ApiResponse<Post>> {
    return request({
        url: '/post/update',
        method: 'put',
        data
    })
}

// 删除帖子
export function deletePost(id: number): Promise<ApiResponse<void>> {
    return request({
        url: `/post/${id}`,
        method: 'delete'
    })
}
