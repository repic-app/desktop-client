import { taskStatus } from 'constants/task'
import { acceptImageTypes } from 'constants/image'
import { requireRemote } from 'helpers/remote'
import { generateId } from 'utils/base'
import { createThumbnail } from 'utils/image'
import { compressTask, restoreTask as _restoreTask } from 'helpers/compressor'

const { getAPPData } = requireRemote('./storage')

export const appendTasks = (currentTaskItems, newTaskFiles, onThumbCreate) => {

  const newTaskItems = [].filter.call(newTaskFiles, file => {
    return currentTaskItems.find(item => item.file.path === file.path) === undefined && acceptImageTypes.includes(file.type.toLowerCase())
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