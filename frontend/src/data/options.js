// 網站共用的選項；budget id 與 mockServer 的種子資料一致（b0–b4）
export const CITIES = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '新竹市']

export const RELATIONSHIP_TYPES = ['長期穩定', '短期體驗', '旅伴', '飯局 / 聊天', '導師型']

export const BUDGETS = [
  { id: 'b1', label: '每月 3 萬以下' },
  { id: 'b2', label: '每月 3–6 萬' },
  { id: 'b3', label: '每月 6–10 萬' },
  { id: 'b4', label: '每月 10 萬以上' },
  { id: 'b0', label: '面議 / 視情況' },
]

export const FREQUENCIES = ['每週 1 次', '每週 2–3 次', '每月 2–3 次', '彈性安排']

export const VERIFICATIONS = {
  photo: { label: '真人認證', desc: '即時自拍比對照片，確認是本人' },
  id: { label: '身分認證', desc: '證件驗證已滿 18 歲，資料不公開' },
  income: { label: '財力認證', desc: '提供薪資 / 存款 / 報稅證明，由人工審核' },
  phone: { label: '手機認證', desc: '台灣門號簡訊驗證' },
}

export function budgetLabel(id) {
  return BUDGETS.find((b) => b.id === id)?.label ?? '面議'
}
