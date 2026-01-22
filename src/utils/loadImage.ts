// 加载图片并展示
export const getImageUrl = (id: string | null | undefined) => {
    return id ? `/storage/file/download?id=${id}` : '/defaultAvatar.png'
}