import { taskStatus } from 'constants/task'
import { requireRemote } from 'helpers/remote'
import { generateId } from 'utils/base'
import { compressTask, restoreTask, cleanTempFiles } from 'helpers/compressor'

const { getCompressors } = requireRemote('./helpers/plugin')
const { getAPPData } = requireRemote('./helpers/storage')

export const appendTasks = (currentTaskItems, newTaskFiles) => {
  const acceptImageTypes = getCompressors()
    .map((item) => item.accepts)
    .flat()

  const newTaskItems = [].filter
    .call(newTaskFiles, ({ file, path }) => {
      return (
        currentTaskItems.find((item) => item.path === path) === undefined &&
        acceptImageTypes.includes(file.type.toLowerCase())
      )
    })
    .map(({ file, path }) => ({
      id: generateId(),
      status: taskStatus.PENDING,
      originalSize: file.size,
      optimizedSize: null,
      file: file,
      path: path,
      ext: file.name.split('.').slice(-1)[0],
    }))

  return [...currentTaskItems, ...newTaskItems]
}

export { restoreTask, cleanTempFiles }

export const restoreTasks = (taskList) =>
  new Promise((resolve) => {
    const nextTaskList = taskList.map((task) => {
      return task.status === taskStatus.COMPLETE
        ? {
            ...task,
            ...restoreTask(task),
          }
        : task
    })
    resolve(nextTaskList)
  })

export const reexecuteTasks = (taskList) =>
  taskList.map((task) => {
    return task.status === taskStatus.RESTORED
      ? {
          ...task,
          status: taskStatus.PENDING,
        }
      : task
  })

export const executeTask = async (task, preferences, optimizedCallback, thumbCreatedCallback) => {
  const optimizeResult = await compressTask(task, preferences, thumbCreatedCallback)
  optimizedCallback(optimizeResult)
}

export const executeTasks = (taskList, optimizedCallback, thumbCreatedCallback) => {
  const preferences = getAPPData('preferences')
  const processingTasks = taskList.filter((item) => item.status === taskStatus.PROCESSING)

  const nextTaskList = taskList.map((item) => {
    if (
      item.status === taskStatus.PENDING &&
      processingTasks.length < preferences.parallelTaskCount * 1
    ) {
      executeTask(item, preferences, optimizedCallback, thumbCreatedCallback)
      processingTasks.push(item)
      return { ...item, status: taskStatus.PROCESSING }
    }

    return item
  })

  return nextTaskList
}
