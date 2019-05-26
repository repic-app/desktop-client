/**
 * 
 * 基础AJAX请求函数
 * @author 王刚(Margox Wang) <wanggang@rainbowcn.com>
 * @date 2019-04-15
 */

import qs from 'query-string'

// 默认的响应数据解析器
const defaultResponseParser = (responseText) => {

  let responseData = null

  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw {
      code: -1,
      message: '无法解析接口返回结果'
    }
  }

  if (responseData && responseData.code === 200) {
    return responseData.data
  }

  throw responseData || {
    code: -2,
    message: '接口返回数据无效'
  }

}

const request = ({
  url,
  data,
  headers,
  timeout,
  method,
  responseParser
}) => new Promise((resolve, reject) => {

  const xhr = new XMLHttpRequest()

  // 参数和默认参数处理
  method = (method || request.defaultOptions.method).toUpperCase()
  timeout = timeout || request.defaultOptions.timeout
  responseParser = responseParser || request.defaultOptions.responseParser
  data = { ...request.defaultOptions.data, ...data }
  headers = { ...request.defaultOptions.headers, ...headers }

  // get请求需要重新处理data和url
  if (method === 'GET') {
    url = `${url}?${qs.stringify(data)}`
    data = null
  }

  // 开启请求连接
  xhr.open(method, url, true)
  xhr.timeout = timeout

  // 设置请求头
  Object.keys(headers).forEach(name => xhr.setRequestHeader(name, headers[name]))

  // 监听请求状态变更
  xhr.onreadystatechange = () => {

    if (xhr.readyState === XMLHttpRequest.DONE) {

      if (xhr.status === 200) {
        try {
          resolve(responseParser(xhr.responseText, { url, data, headers, method }))
        } catch (error) {
          reject(error)
        }
      } else {
        reject({
          code: xhr.status,
          message: '接口请求失败'
        })
      }

    }

  }

  // 监听接口请求超时
  xhr.ontimeout = () => {
    reject({
      code: 408,
      message: '接口请求超时'
    })
  }

  // 发送请求
  xhr.send(JSON.stringify(data))

})

request.defaultOptions = {
  method: 'GET',
  timeout: 5000,
  data: {},
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  responseParser: defaultResponseParser
}

request.get = (url, data) => request({ url, data, method: 'GET' })
request.post = (url, data) => request({ url, data, method: 'POST' })

export default request