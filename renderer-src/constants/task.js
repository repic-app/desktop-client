export const taskStatus = {
  CREATING: 0,
  PENDING: 1,
  PROCESSING: 2,
  COMPLETE: 3,
  FAIL: 4,
  RESTORED: 5
}

export const tasktStatusIcons = {
  [taskStatus.CREATING]: 'icon-clock',
  [taskStatus.PENDING]: 'icon-clock',
  [taskStatus.PROCESSING]: 'spinning',
  [taskStatus.COMPLETE]: 'icon-check',
  [taskStatus.FAIL]: 'icon-x',
  [taskStatus.RESTORED]: 'icon-shield'
}

export const taskStatusTexts = {
  [taskStatus.CREATING]: '等待压缩',
  [taskStatus.PENDING]: '等待压缩',
  [taskStatus.PROCESSING]: '正在压缩',
  [taskStatus.COMPLETE]: '压缩完成',
  [taskStatus.FAIL]: '压缩失败',
  [taskStatus.RESTORED]: '已还原'
}