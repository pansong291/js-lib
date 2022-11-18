;(function () {
  /**
   * 字符串转义序列
   *
   * @type {{}}
   */
  const stringEscape = {
    0: '\0',
    b: '\b',
    t: '\t',
    n: '\n',
    v: '\v',
    f: '\f',
    r: '\r'
  }

  /**
   * 根据指定的路径字符串获取指定对象中的值。
   *
   * @param target 根对象或数组
   * @param pathStr 指定路径的字符串，必须以点号或方括号开头，如 .person.name 或 [0].name
   * @returns {*} 指定对象中对应路径的值
   */
  function getValue(target, pathStr) {
    // TODO
  }

  /**
   * 根据指定的字符串解析对应路径并将指定数据填充到指定对象中。
   * 指定的字符串格式不正确将会抛出异常。
   *
   * @param target 需要填充数据的对象或数组，为空则自动识别
   * @param pathStr 指定路径的字符串，必须以点号或方括号开头，如 .person.name 或 [0].name
   * @param value 需要填充的数据
   * @returns {*} 目标对象或数组
   */
  function setValue(target, pathStr, value) {
    let path = pathStr
    const root = { target }
    let cur = root
    let field = 'target'
    while (true) {
      let parseResult = null
      // 必须以 . 或 [ 开头
      const symbol = path.charAt(0)
      if (symbol === '.') {
        parseResult = parseDotMark(path)
      } else if (symbol === '[') {
        parseResult = parseSquareBrackets(path)
      }
      if (!parseResult || parseResult.error) throw new Error(`illegal path string: ${pathStr}`)
      // 解析一节路径后，保证上个路径是对象或数组
      if (cur[field] === null || cur[field] === void 0) {
        cur[field] = parseResult.value
      } else if (!(cur[field] instanceof Object)) {
        const deepPath = pathStr.substring(0, pathStr.lastIndexOf(path))
        throw new Error(`the value of "<root>${deepPath}" is not a(n) object/array`)
      }
      cur = cur[field]
      field = parseResult.field
      path = parseResult.nextPath
      if (!path) {
        cur[field] = value
        break
      }
    }
    return root.target
  }

  /**
   * 解析 . 开头的一节路径
   *
   * @param path
   * @returns {{}}
   */
  function parseDotMark(path) {
    const result = {}
    const reg = /^\.([$_a-zA-Z][$_a-zA-Z0-9]*)([\s\S]*?)$/
    const matchArr = path.match(reg)
    if (matchArr && matchArr.length && matchArr.length > 1) {
      result.field = matchArr[1]
      result.nextPath = matchArr[2]
      result.value = {}
    } else {
      result.error = true
    }
    return result
  }

  /**
   * 解析 [ 开头的一节路径
   *
   * @param path
   * @returns {{}}
   */
  function parseSquareBrackets(path) {
    const result = {}
    if (path.length > 2) {
      const quote = path.charAt(1)
      if (quote === "'" || quote === '"' || quote === '`') {
        let field = ''
        let escape = -1
        let i = 2
        stringLoop: for (; i < path.length; i++) {
          const ch = path.charAt(i)
          switch (ch) {
            case '\n':
              if (quote === '`') {
                field += ch
              } else {
                result.error = true
                break stringLoop
              }
              break
            case '\\':
              if (escape === i) {
                field += ch
              } else {
                escape = i + 1
              }
              break
            case quote:
              if (escape !== i) {
                break stringLoop
              }
              field += ch
              break
            default:
              if (escape === i) {
                field += stringEscape[ch] || ch
              } else {
                field += ch
              }
          }
        }
        if (!result.error) {
          // 没找到结尾引号或结尾引号后面的字符不配对方括号
          result.error = i === path.length || path.charAt(i + 1) !== ']'
          result.field = field
          result.nextPath = path.substring(i + 2)
          result.value = {}
        }
      } else {
        const reg = /^\[([-+]?\d+)]([\s\S]*?)$/
        const matchArr = path.match(reg)
        if (matchArr && matchArr.length && matchArr.length > 1) {
          result.field = Number(matchArr[1])
          result.nextPath = matchArr[2]
          result.value = []
        } else {
          result.error = true
        }
      }
    } else {
      result.error = true
    }
    return result
  }

  function parsePathOf(target, pathStr, value) {
    if (value === void 0) {
      return getValue(target, pathStr)
    } else {
      return setValue(target, pathStr, value)
    }
  }

  if (!window.paso || !(window.paso instanceof Object)) window.paso = {}
  window.paso.objectParser = {
    parsePathOf,
    getValue,
    setValue
  }
})()
