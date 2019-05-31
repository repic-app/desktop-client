import { taskStatus } from 'constants/task'
import { acceptImageTypes } from 'constants/image'
import { requireRemote } from 'helpers/remote'
import { generateId } from 'utils/base'
import { compressTask, restoreTask } from 'helpers/compressor'

const { getAPPData } = requireRemote('./helpers/storage')

export const appendTasks = (currentTaskItems, newTaskFiles) => {

  const newTaskItems = [].filter.call(newTaskFiles, file => {
    return currentTaskItems.find(item => item.file.path === file.path) === undefined && acceptImageTypes.includes(file.type.toLowerCase())
  }).map(file => ({
    id: generateId(),
    status: taskStatus.PENDING,
    originalSize: file.size,
    optimizedSize: null,
    file: file
  }))

  return [ ...currentTaskItems, ...newTaskItems ]
}

export { restoreTask }

export const executeTask = async (task, preferences, optimizedCallback, thumbCreatedCallback) => {

  const optimizeResult = await compressTask(task, preferences, thumbCreatedCallback)
  optimizedCallback(optimizeResult)
}

export const executeTasks = (taskList, optimizedCallback, thumbCreatedCallback) => {

  const preferences = getAPPData('preferences')
  const processingTasks = taskList.filter(item => item.status === taskStatus.PROCESSING)

  const nextTaskList = taskList.map(item => {

    if (item.status === taskStatus.PENDING && processingTasks.length < preferences.parallelTaskCount * 1) {
      executeTask(item, preferences, optimizedCallback, thumbCreatedCallback)
      processingTasks.push(item)
      return { ...item, status: taskStatus.PROCESSING }
    }

    return item

  })

  return nextTaskList
}