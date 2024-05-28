// @name            cross-origin-storage
// @name:zh         跨域本地存储
// @namespace       https://github.com/pansong291/
// @version         1.0.1
// @author          paso
// @license         Apache-2.0

;(function () {
  'use strict'

  const __msgType = 'cross-origin-storage'

  /**
   * 生成随机ID
   */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  function createStorageClient(middlewareUrl) {
    const iframe = document.createElement('iframe')
    iframe.src = middlewareUrl
    iframe.setAttribute('style', 'display: none !important;')
    window.document.body.appendChild(iframe)
    return startStorageClient(iframe.contentWindow)
  }

  function startStorageClient(iframeWindow) {
    const _requests = {} // 所有请求消息数据映射
    // Server 是否已准备完成以及缓存的请求队列
    const _cache = {
      ready: false,
      queue: []
    }
    // 监听 Server 发来的消息
    window.addEventListener('message', (e) => {
      if (e?.data?.__msgType !== __msgType) return
      if (e.data.ready) {
        // Server 已准备完成, 发送队列中的全部请求
        _cache.ready = true
        while (_cache.queue.length) {
          iframeWindow.postMessage(_cache.queue.shift(), '*')
        }
        return
      }
      let { id, response } = e.data

      // 找到消息对应的回调函数
      let currentCallback = _requests[id]
      if (!currentCallback) return
      // 调用并返回数据
      currentCallback(response, e.data)
      delete _requests[id]
    })

    /**
     * 发起请求函数
     * @param method 请求方式
     * @param key
     * @param value
     */
    function _requestFn(method, key, value) {
      return new Promise((resolve) => {
        const req = {
          id: uuid(),
          method,
          key,
          value,
          __msgType
        }

        // 请求唯一标识 id 和回调函数的映射
        _requests[req.id] = resolve

        if (_cache.ready) {
          // Server 已准备完成时直接发请求
          iframeWindow.postMessage(req, '*')
        } else {
          // Server 未准备完成则把请求放入队列
          _cache.queue.push(req)
        }
      })
    }

    return {
      /**
       * 获取存储数据
       * @param {Iterable | Object | string} key
       */
      getItem(key) {
        return _requestFn('get', key)
      },
      /**
       * 更新存储数据
       * @param {Object | string} key
       * @param {?Object | ?string} value
       */
      setItem(key, value = void 0) {
        return _requestFn('set', key, value)
      },
      /**
       * 删除数据
       * @param {Iterable | Object | string} key
       */
      delItem(key) {
        return _requestFn('delete', key)
      },
      /**
       * 清除数据
       */
      clear() {
        return _requestFn('clear')
      }
    }
  }

  function startStorageServer() {
    if (window.parent === window) return
    const functionMap = {
      /**
       * 设置数据
       * @param {Object | string} key
       * @param {?Object | ?string} value
       */
      setStore(key, value = void 0) {
        if (!key) return
        if (typeof key === 'string') {
          return localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value)
        }
        Object.keys(key).forEach((dataKey) => {
          let dataValue = typeof key[dataKey] === 'object' ? JSON.stringify(key[dataKey]) : key[dataKey]
          localStorage.setItem(dataKey, dataValue)
        })
      },

      /**
       * 获取数据
       * @param {Iterable | Object | string} key
       */
      getStore(key) {
        if (!key) return
        if (typeof key === 'string') return localStorage.getItem(key)
        let dataRes = {}
        const keys = key[Symbol.iterator] ? key : Object.keys(key)
        for (const dataKey of keys) {
          dataRes[dataKey] = localStorage.getItem(dataKey) || null
        }
        return dataRes
      },

      /**
       * 删除数据
       * @param {Iterable | Object | string} key
       */
      deleteStore(key) {
        if (!key) return
        if (typeof key === 'string') return localStorage.removeItem(key)
        const keys = key[Symbol.iterator] ? key : Object.keys(key)
        for (const dataKey of keys) {
          localStorage.removeItem(dataKey)
        }
      },

      /**
       * 清空
       */
      clearStore() {
        localStorage.clear()
      }
    }

    // 监听 Client 消息
    window.addEventListener('message', (e) => {
      if (e?.data?.__msgType !== __msgType) return
      const { method, key, value, id = 'default' } = e.data

      // 获取方法
      const func = functionMap[`${method}Store`]

      // 取出本地的数据
      const response = {
        data: func?.(key, value)
      }
      if (!func) response.errorMsg = 'Request method error!'

      // 发送给 Client
      window.parent.postMessage(
        {
          id,
          request: e.data,
          response,
          __msgType
        },
        '*'
      )
    })

    // 通知 Client, Server 已经准备完成
    window.parent.postMessage(
      {
        ready: true,
        __msgType
      },
      '*'
    )
  }

  if (!window.paso || !(window.paso instanceof Object)) window.paso = {}
  window.paso.crossOriginStorage = {
    startStorageServer,
    startStorageClient,
    createStorageClient
  }
})()
