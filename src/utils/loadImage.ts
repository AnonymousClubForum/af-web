// 加载图片并展示
import {downloadFile} from "../api";

export const loadImage = async (fileId: string) => {
    const blob = await downloadFile(fileId)
    return URL.createObjectURL(blob)
}