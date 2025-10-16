// src/lib/download.ts

/** 將 Date 轉成適合檔名的 ISO 字串（把 : 和 . 換成 -） */
export function timestampSuffix(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

/** 回傳「基底檔名 + 時間戳 + 副檔名」 */
export function withTimestamp(base: string, ext = "json", date = new Date()) {
  return `${base}-${timestampSuffix(date)}.${ext}`;
}

/** 下載 JSON；若未提供檔名，預設使用 srl-log-YYYY...Z.json */
export function downloadJSON(obj: any, filename = withTimestamp("srl-log")) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
