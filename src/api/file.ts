import request from '../utils/request'


/**
 * 获取文件
 * @param id - 评论ID
 */
export function downloadFile(id: string): Promise<Blob> {
    return request({
        url: '/file/download',
        method: 'get',
        params: {id}
    })
}
