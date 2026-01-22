import type {ApiResponse} from '../types'
import axios from "axios";

// 上传文件
export function uploadFile(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append("file", file);

    return axios.post("/storage/file/upload", formData)
}
