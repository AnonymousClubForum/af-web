import type {UploadRawFile} from "element-plus";


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

const DEFAULT_COMPRESS_OPTIONS = {
    initialQuality: 0.8, // 初始压缩质量
    outputType: 'image/webp' as 'image/jpeg' | 'image/png' | 'image/webp', // 输出格式（锁定类型）
    targetSize: 128 * 1024, // 目标大小128KB
    minQuality: 0.1, // 最小质量
    maxLoop: 256, // 最大循环次数
    scaleRatio: 0.8 // 尺寸缩放比例
};

// 2. 定义配置类型（基于默认配置推导，确保类型和默认值一致）
type CompressImageOptions = Partial<typeof DEFAULT_COMPRESS_OPTIONS>;

/**
 * 压缩图片到指定大小以内
 * @param file 原始文件
 * @param options 基础配置
 * @returns 压缩后的 Blob
 */
export async function compressImage(
    file: File | UploadRawFile,
    options: CompressImageOptions
): Promise<Blob> {
    const config = {...DEFAULT_COMPRESS_OPTIONS, ...options};
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
                    if (compressedResult.size <= config.targetSize) break;

                    // 未达标：先降低质量，质量到最低则缩小尺寸
                    loopCount++;
                    if (currentQuality > config.minQuality) {
                        currentQuality -= 0.1; // 每次降低0.1质量
                        currentQuality = Math.max(currentQuality, config.minQuality); // 不低于最小质量
                    } else {
                        // 质量到最低仍超标，缩小尺寸
                        img.width *= config.scaleRatio;
                        img.height *= config.scaleRatio;
                    }
                    // 防止无限循环
                    if (loopCount >= config.maxLoop) {
                        console.warn('已达到最大压缩次数，文件仍可能超过128KB');
                        break;
                    }
                } while (compressedResult.size > config.targetSize);
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
