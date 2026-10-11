const MAX_SIDE = 1600
const QUALITY = 0.85

/**
 * 傳送前把圖片縮到長邊 1600px 並重新編碼成 JPEG。
 * 手機照片動輒好幾 MB，縮小後通常只剩幾百 KB；重新編碼也會清掉 EXIF 裡的 GPS 位置。
 */
export async function prepareImage(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    try {
      await img.decode()
    } catch {
      throw new Error('無法讀取這張圖片，請改傳 JPG 或 PNG')
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    // PNG 透明的地方轉 JPEG 會變黑，先鋪白底
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
    if (!blob) throw new Error('圖片處理失敗，請換一張再試')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}
