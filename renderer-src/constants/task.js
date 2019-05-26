export const taskStatus = {
  PENDING: 0,
  PROCESSING: 1,
  COMPLETE: 2,
  FAIL: 3
}

export const tasktStatusIcons = {
  [taskStatus.PENDING]: 'icon-clock',
  [taskStatus.PROCESSING]: 'spinning',
  [taskStatus.COMPLETE]: 'icon-check',
  [taskStatus.FAIL]: 'icon-x'
}

export const taskStatusTexts = {
  [taskStatus.PENDING]: '等待压缩',
  [taskStatus.PROCESSING]: '正在压缩',
  [taskStatus.COMPLETE]: '压缩完成',
  [taskStatus.FAIL]: '压缩失败'
}