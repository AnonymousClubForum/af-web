import type {UploadRawFile} from "element-plus";

// 目标大小：128KB = 128 * 1024 字节
const TARGET_SIZE = 128 * 1024;
// 最小压缩质量（避免无限循环，保底值）
const MIN_QUALITY = 0.1;
// 最大循环次数（防止性能问题）
const MAX_LOOP = 10;
// 每次尺寸缩放比例（质量到最低仍超限时，缩小尺寸）
const SCALE_RATIO = 0.8;

// 加载图片并展示
export const getImageUrl = (id: string | null | undefined) => {
    return id ? `/storage/file/download?id=${id}` : '/defaultAvatar.png'
}

/**
 * 核心压缩方法（内部使用，单次压缩）
 * @param img Image 对象
 * @param quality 压缩质量
 * @param width 目标宽度
 * @param height 目标高度
 * @param outputType 输出格式
 * @returns Blob
 */
async function compressOnce(
    img: HTMLImageElement,
    quality: number,
    width: number,
    height: number,
    outputType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<{ blob: Blob; size: number }> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas 上下文创建失败');
        }

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
            (blob) => {
                if (!blob) throw new Error('压缩失败');
                resolve({blob, size: blob.size});
            },
            outputType,
            quality
        );
    });
}

/**
 * 压缩图片到指定大小以内
 * @param file 原始文件
 * @param options 基础配置
 * @returns 压缩后的 Blob
 */
export async function compressImage(
    file: File | UploadRawFile,
    options: {
        initialQuality?: number; // 初始压缩质量（默认0.8）
        outputType?: 'image/jpeg' | 'image/png' | 'image/webp';
    } = {
        initialQuality: 0.8,
        outputType: 'image/webp' // 输出格式（默认webp，体积最小）
    }
): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('请选择图片文件！'));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            try {
                const img = new Image();
                img.src = e.target?.result as string;
                await new Promise((res) => (img.onload = res));

                let currentQuality = options.initialQuality!;
                let compressedResult: { blob: Blob; size: number };
                let loopCount = 0;

                // 循环压缩直到达标/达到限制
                do {
                    // 单次压缩
                    compressedResult = await compressOnce(
                        img,
                        currentQuality,
                        img.width,
                        img.height,
                        options.outputType!
                    );

                    // 检查是否达标
                    if (compressedResult.size <= TARGET_SIZE) break;

                    // 未达标：先降低质量，质量到最低则缩小尺寸
                    loopCount++;
                    if (currentQuality > MIN_QUALITY) {
                        currentQuality -= 0.1; // 每次降低0.1质量
                        currentQuality = Math.max(currentQuality, MIN_QUALITY); // 不低于最小质量
                    } else {
                        // 质量到最低仍超标，缩小尺寸
                        img.width *= SCALE_RATIO;
                        img.height *= SCALE_RATIO;
                    }
                    // 防止无限循环
                    if (loopCount >= MAX_LOOP) {
                        console.warn('已达到最大压缩次数，文件仍可能超过128KB');
                        break;
                    }
                } while (compressedResult.size > TARGET_SIZE);
                resolve(compressedResult.blob);
            } catch (error) {
                reject(new Error(`压缩失败：${(error as Error).message}`));
            }
        };

        reader.onerror = () => reject(new Error('文件读取失败！'));
    });
}

/**
 * Blob 转 File（适配 Element Plus Upload）
 */
export function blobToFile(
    blob: Blob,
    originalFile: File | UploadRawFile
): File {
    const fileName = originalFile.name.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        `.${blob.type.split('/')[1]}`
    );
    return new File([blob], fileName, {
        type: blob.type,
        lastModified: Date.now()
    });
}
