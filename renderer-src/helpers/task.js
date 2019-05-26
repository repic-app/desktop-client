import electron from 'electron'
import { generateId, sleep } from 'utils/base'
import { taskStatus } from 'constants/task'

const { getAPPData } = electron.remote.require('./storage')

export const acceptedImageTypes = [
  'image/png', 'image/jpg', 'image/jpeg', 'image/svg', 'image/gif'
]

export const createTasks = (files, currentTaskItems) => {

  return [].filter.call(files, file => {
    return currentTaskItems.find(item => item.file.path === file.path) === undefined && acceptedImageTypes.includes(file.type.toLowerCase())
  }).map(file => ({
    id: generateId(),
    status: taskStatus.PENDING,
    file: file
  }))

}

export const executeCompress = async (taskItem, callback) => {
  await sleep(1000 + Math.random() * 3000)
  callback({ ...taskItem, status: taskStatus.COMPLETE })
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