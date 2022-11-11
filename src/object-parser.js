;(function () {
    /**
     * 根据指定的路径字符串获取指定对象中的值。
     *
     * @param root 根对象或数组
     * @param pathStr 指定路径的字符串，必须以点号或方括号开头，如 .person.name 或 [0].name
     * @returns {any} 指定对象中对应路径的值
     */
    function getValue(root, pathStr) {
        // TODO
    }

    /**
     * 根据指定的字符串解析对应路径并将指定数据填充到指定对象中。
     * 指定的字符串格式不正确将会抛出异常。
     *
     * @param root 需要填充数据的对象或数组
     * @param pathStr 指定路径的字符串，必须以点号或方括号开头，如 .person.name 或 [0].name
     * @param value 需要填充的数据
     */
    function setValue(root, pathStr, value) {
        const errMsg = `error: illegal path string: ${pathStr}`
        const reg = /[\[.]/
        let cur = root
        let path = pathStr
        // 先查找一次
        const matchArr = path.match(reg)
        // 未找到或者不在首个位置抛异常
        if (!matchArr || matchArr.index !== 0) {
            throw errMsg
        }
        while (true) {
            // 检查当前对象是否有值且是否是对象或数组类型
            if (!cur || !(cur instanceof Object)) {
                const deepPath = pathStr.substring(0, pathStr.lastIndexOf(path))
                throw `error: the value of "<root>${deepPath}" is not a(n) object/array`
            }
            // 获取第一个符号
            const symbol = path.charAt(0)
            // 去掉第一个符号
            path = path.substring(1)
            // 继续找下一个
            const nextMatch = path.match(reg)
            // 获取当前属性名和下个符号
            let field
            let nextSymbol
            if (nextMatch) {
                field = path.substring(0, nextMatch.index)
                nextSymbol = nextMatch[0]
            } else {
                field = path
                nextSymbol = null
            }
            if (symbol === '[') {
                // 检查一下中括号是否配对
                if (field.charAt(field.length - 1) !== ']') {
                    throw errMsg
                }
                // 把属性名最后的 ] 去掉，顺便去掉引号
                field = removeQuote(field.substring(0, field.length - 1))
            }
            // 检查属性名不为空，且不能包含右方括号
            if (!field || field.indexOf(']') >= 0) {
                throw errMsg
            }
            if (nextSymbol === '.') {
                // 点号表示是对象，需要保证当前路径是对象
                if (cur[field] === void 0 || cur[field] === null) {
                    cur[field] = {}
                }
            } else if (nextSymbol === '[') {
                // 中括号表示是数组，需要保证当前路径是数组
                if (cur[field] === void 0 || cur[field] === null) {
                    cur[field] = []
                }
            } else {
                // 未找到下个，结束
                cur[field] = value
                break
            }
            // 进入下一次迭代
            cur = cur[field]
            path = path.substring(nextMatch.index)
        }
    }

    /**
     * 如果字符串的首尾都是引号，则去除首尾的引号。检测的引号有单引号、双引号和反引号。
     *
     * @param str 受检字符串
     * @returns {string} 去除首尾引号的字符串或它本身
     */
    function removeQuote(str) {
        let reg = /^(["'`]).*\1$/
        if (reg.test(str)) {
            str = str.substring(1, str.length - 1)
        }
        return str
    }

    function parsePathOf(root, pathStr, value) {
        if (value === void 0) {
            return getValue(root, pathStr)
        } else {
            setValue(root, pathStr, value)
        }
    }

    if (!window.paso || !(window.paso instanceof Object)) window.paso = {}
    window.paso.objectParser = {
        parsePathOf, getValue, setValue
    }
})()