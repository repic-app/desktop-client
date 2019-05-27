import { taskStatus } from 'constants/task'
import { requireRemote } from 'helpers/remote'
import { generateId, formatSize } from 'utils/base'

const { compressImage, restoreImage } = requireRemote('./compressor')
const { getAPPData } = requireRemote('./storage')

export const acceptedImageTypes = [
  'image/png', 'image/jpg', 'image/jpeg', 'image/svg', 'image/gif'
]

export const createTasks = (files, currentTaskItems) => {

  return [].filter.call(files, file => {
    return currentTaskItems.find(item => item.file.path === file.path) === undefined && acceptedImageTypes.includes(file.type.toLowerCase())
  }).map(file => ({
    id: generateId(),
    status: taskStatus.PENDING,
    originalSize: file.size,
    optimizedSize: null,
    file: file
  }))

}

export const restoreTask = restoreImage

export const executeCompress = async (taskItem, callback) => {

  const preferences = getAPPData('preferences')
  const optimizeResult = await compressImage(taskItem, preferences)

  callback(optimizeResult)

}

export const executeTasks = (taskItems, callback) => {

  const { parallelTaskCount } = getAPPData('preferences')
  const processingTasks = taskItems.filter(item => item.status === taskStatus.PROCESSING)

  const nextTaskItems = taskItems.map(item => {

    if (item.status === taskStatus.PENDING && processingTasks.length < parallelTaskCount * 1) {
      executeCompress(item, callback)
      processingTasks.push(item)
      return { ...item, status: taskStatus.PROCESSING }
    }

    return item

  })

  return nextTaskItems

}