import type {ApiResponse} from '../types'
import request from "../utils/request.ts";

// 上传文件
export function uploadFile(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append("file", file);

    return request({
        url: '/storage/file/upload',
        method: 'post',
        data: formData
    })
}
