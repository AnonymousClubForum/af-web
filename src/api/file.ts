import request from '../utils/request'
import type {ApiResponse} from '../types'
import axios from "axios";

// 上传文件
export function uploadFile(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append("file", file);

    return axios.post("/storage/file/upload", formData)
}

// 下载文件
export function downloadFile(id: string): Promise<Blob> {
    return request({
        url: `/storage/file/download?id=${id}`,
        method: 'get'
    })
}
