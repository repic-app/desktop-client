export const taskStatus = {
  CREATING: 0,
  PENDING: 1,
  PROCESSING: 2,
  COMPLETE: 3,
  FAIL: 4,
  RESTORED: 5
}

export const tasktStatusIcons = {
  [taskStatus.CREATING]: 'mdi mdi-progress-clock',
  [taskStatus.PENDING]: 'mdi mdi-progress-clock',
  [taskStatus.PROCESSING]: 'spinning',
  [taskStatus.COMPLETE]: 'mdi mdi-check',
  [taskStatus.FAIL]: 'mdi mdi-alert-circle-outline',
  [taskStatus.RESTORED]: 'mdi mdi-rotate-left'
}

export const taskStatusTexts = {
  [taskStatus.CREATING]: '等待压缩',
  [taskStatus.PENDING]: '等待压缩',
  [taskStatus.PROCESSING]: '正在压缩',
  [taskStatus.COMPLETE]: '压缩完成',
  [taskStatus.FAIL]: '压缩失败',
  [taskStatus.RESTORED]: '已还原'
}