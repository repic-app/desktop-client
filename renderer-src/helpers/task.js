import { taskStatus } from 'constants/task'
import { requireRemote } from 'helpers/remote'
import { generateId } from 'utils/base'
import { createThumbnail } from 'utils/image'

const { compressTask, restoreTask: _restoreTask } = requireRemote('./compressor')
const { getAPPData } = requireRemote('./storage')

export const acceptedImageTypes = [
  'image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml', 'image/svg', 'image/gif'
]

export const appendTasks = (currentTaskItems, newTaskFiles, onThumbCreate) => {

  const newTaskItems = [].filter.call(newTaskFiles, file => {
    return currentTaskItems.find(item => item.file.path === file.path) === undefined && acceptedImageTypes.includes(file.type.toLowerCase())
  }).map(file => {

    const taskId = generateId()
    const taskData = {
      id: taskId,
      status: taskStatus.CREATING,
      originalSize: file.size,
      optimizedSize: null,
      file: file
    }

    createThumbnail(URL.createObjectURL(file), 120, 120).then(({ url }) => {
      onThumbCreate({
        id: taskId,
        thumbUrl: url,
        status: taskStatus.PENDING
      })
    }).catch(() => {
      onThumbCreate({
        id: taskId,
        status: taskStatus.PENDING
      })
    })

    return taskData

  })

  return [ ...currentTaskItems, ...newTaskItems ]
  
}

export const restoreTask = _restoreTask

export const executeTask = async (task, callback) => {

  const preferences = getAPPData('preferences')
  const optimizeResult = await compressTask(task, preferences)

  callback(optimizeResult)

}

export const executeTasks = (taskList, callback) => {

  const { parallelTaskCount } = getAPPData('preferences')
  const processingTasks = taskList.filter(item => item.status === taskStatus.PROCESSING)

  const nextTaskList = taskList.map(item => {

    if (item.status === taskStatus.PENDING && processingTasks.length < parallelTaskCount * 1) {
      executeTask(item, callback)
      processingTasks.push(item)
      return { ...item, status: taskStatus.PROCESSING }
    }

    return item

  })

  return nextTaskList

}