;(function () {
  'use strict'

  const _injectHtml = (config, resolve) => {
    const $ = window.jQuery
    let $doc = $(document)
    $(document.head).append(`
      <style>
        .${config.namespace} {
            color: black;
        }
        .${config.namespace} * {
            box-sizing: border-box;
        }
        .${config.namespace} .flex {
            display: flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: flex-start;
        }
        .${config.namespace} .flex.col {
            flex-direction: column;
        }
        .${config.namespace} .sticky-bar {
            position: fixed;
            top: ${config.location};
            left: 0;
            transform: translateX(calc(12px - ${config.collapse}));
            z-index: 99999999;
            background: #3D7FFF;
            color: white;
            padding: 2px 10px 2px 4px;
            cursor: pointer;
            user-select: none;
            border-radius: 0 12px 12px 0;
            transition: transform 0.5s ease;
        }
        .${config.namespace} .sticky-bar:hover {
            transform: none;
        }
        .${config.namespace} .mask {
            position: fixed;
            inset: 0;
            padding: 24px;
            overflow: auto;
            z-index: 99999999;
            background-color: rgba(0, 0, 0, 0.4);
            display: none;
            align-items: center;
            justify-content: center;
            pointer-events: all;
        }
        .${config.namespace}.open .mask {
            display: flex;
        }
        .${config.namespace} .popup {
            position: relative;
            margin: auto;
            padding: 16px;
            background: #f0f2f5;
            border-radius: 2px;
            box-shadow: 0 1px 12px 2px rgba(0, 0, 0, 0.4);
        }
        .${config.namespace} label {
            margin-top: .5em;
            margin-bottom: 0;
            user-select: none;
        }
        .${config.namespace} .monospace {
            font-family: v-mono, Consolas, SFMono-Regular, Menlo, Courier, v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, monospace, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }
        .${config.namespace} .button {
            user-select: none;
            min-width: unset;
            min-height: unset;
            margin: unset;
            padding: 4px 16px;
            color: #fff;
            border: 1px solid #3D7FFF;
            border-radius: 2px;
            background: #3D7FFF;
            text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.05);
        }
        .${config.namespace} textarea {
            background: white;
            resize: vertical;
        }
        .${config.namespace} .input, .${config.namespace} .button {
            height: 32px;
            transition: all 0.3s, height 0s;
        }
        .${config.namespace} .button:before, .${config.namespace} .button:after {
            content: none;
        }
        .${config.namespace} .button:hover, .${config.namespace} .button:focus {
            border-color: #669eff;
            background: #669eff;
        }
        .${config.namespace} .button:active {
            border-color: #295ed9;
            background: #295ed9;
        }
        .${config.namespace} .input {
            padding: 4px 8px;
            background: white;
            border: 1px solid #d9d9d9;
            border-radius: 2px;
        }
        .${config.namespace} .input:hover {
            border-color: #669eff;
            outline: 0;
        }
        .${config.namespace} .input:focus {
            border-color: #669eff;
            box-shadow: 0 0 0 2px rgba(61, 127, 255, 0.2);
            border-right-width: 1px;
            outline: 0;
        }
        ${config.style.replaceAll(/<\/?style>/g, '')}
      </style>`)
    const $container = $(`<div class="${config.namespace}"/>`)
    const $stickyBar = $(`<div class="sticky-bar">${config.actionName}</div>`)
    const $mask = $(`<div class="mask"/>`)
    const $popup = $(`<div class="popup flex col">${config.content}</div>`)
    $container.append($stickyBar).append($mask)
    $mask.append($popup)

    $mask.click(() => {
      $container.removeClass('open')
      config.onPopHide && config.onPopHide()
    })
    $popup.click((e) => e.stopPropagation())

    let stickyBarTop
    let stickyBarHeight
    let mouseDown
    let stickyClick
    $stickyBar
      .mousedown(
        leftKey((e) => {
          stickyClick = true
          stickyBarTop = getNumber($stickyBar.css('top'))
          stickyBarHeight = $stickyBar.outerHeight()
          mouseDown = e.pageY
          $doc.on(`mousemove.${config.namespace}`, stickyMouseMove).on(`mouseup.${config.namespace}`, stickyMouseUp)
        })
      )
      .mouseup(
        leftKey((e) => {
          if (stickyClick) {
            stickyClick = false
            $container.addClass('open')
            config.onPopShow && config.onPopShow()
          }
          stickyMouseUp()
          e.stopPropagation()
        })
      )

    function stickyMouseMove(e) {
      stickyClick = false
      requestAnimationFrame(() => {
        let height = document.documentElement.clientHeight - stickyBarHeight
        let newTop = stickyBarTop + e.pageY - mouseDown
        if (newTop >= 0 && newTop <= height) {
          $stickyBar.css('top', `${newTop}px`)
        }
      })
    }

    const stickyMouseUp = leftKey(() => {
      $doc.off(`.${config.namespace}`)
    })

    $(document.body).append($container)
    // ---- other code
    resolve && resolve({ $container, $stickyBar, $mask, $popup })
  }

  function leftKey(fn) {
    return (...args) => {
      let key = args && args[0] && args[0].button
      if (key === 0 || key === void 0) {
        fn.apply(this, args)
      }
    }
  }

  function getNumber(str) {
    if (str) {
      let mArr = str.match(/\d+(\.\d*)?|\.\d+/)
      if (mArr && mArr.length) {
        return parseFloat(mArr[0])
      }
    }
    return void 0
  }

  function _checkConfig(config) {
    if (!config) throw new Error('config is required. you should call window.paso.injectPopup(config)')
    if (!config.namespace) throw new Error('config.namespace is required and it cannot be empty.')
    if (!/^[-\w]+$/.test(config.namespace)) throw new Error('config.namespace must match the regex /^[-\\w]+$/.')
  }

  if (!window.jQuery) throw new ReferenceError('This library needs to be dependent on jQuery.')
  if (!window.paso || !(window.paso instanceof Object)) window.paso = {}
  window.paso.injectPopup = (config) => {
    _checkConfig(config)
    const _config = Object.assign(
      {},
      {
        namespace: '',
        actionName: 'Action',
        collapse: '100%',
        location: '25%',
        content: '<label>Hello World</label>',
        style: '',
        onPopShow() {},
        onPopHide() {}
      },
      config
    )
    return new Promise((resolve) => {
      _injectHtml(_config, resolve)
    })
  }
})()
