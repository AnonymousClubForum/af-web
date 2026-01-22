// import {downloadFile} from "../api/file.ts";

// 加载图片并展示
export const loadImage = async (id: string) => {
    // const blob = await downloadFile(id)
    // return URL.createObjectURL(blob)
    return `/storage/file/download?id=${id}`
}