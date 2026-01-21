// 加载图片并展示

export const loadImage = async (fileId: string) => {
    const res = await fetch(`/storage/file/download?file_id=${fileId}`)
    const blob = await res.blob()
    return URL.createObjectURL(blob)
}