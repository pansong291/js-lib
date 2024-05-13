// @name            popup-inject
// @name:zh         弹窗注入
// @description     Insert a sidebar button and a popup window into the webpage.
// @description:zh  向网页中插入一个侧边按钮和一个弹窗。
// @namespace       https://github.com/pansong291/
// @version         1.0.9
// @author          paso
// @license         Apache-2.0

/**
 * @typedef {object} PopupInjectConfig
 * @property {string} namespace
 * @property {string} [actionName] 侧边按钮文案
 * @property {string} [collapse] 折叠 <length-percentage>
 * @property {string} [location] 顶部位置 <length-percentage>
 * @property {string} [content] DOMString
 * @property {string} [style] StyleString
 * @property {VoidFunction} [onPopShow]
 * @property {VoidFunction} [onPopHide]
 */
/**
 * @typedef {object} PopupInjectResult
 * @property {{
 *    container: HTMLElement,
 *    stickyBar: HTMLElement,
 *    mask: HTMLElement,
 *    popup: HTMLElement
 * }} elem
 * @property {{
 *    createElement: CreateElementFunction,
 *    excludeClick: ExcludeClickFuction,
 *    leftKey: LeftKeyFunction<Function>,
 *    getNumber: GetNumberFunction
 * }} func
 */
/**
 * @typedef {(tag: string, attrs?: Record<string, string>, children?: string | (Node | string)[]) => HTMLElement} CreateElementFunction
 */
/**
 * @typedef {(included: HTMLElement, excluded: HTMLElement, onClick?: EventListener) => void} ExcludeClickFuction
 */
/**
 * @template {Function} T
 * @typedef {(fn: T) => T} LeftKeyFunction
 */
/**
 * @typedef {(str?: string) => number | undefined} GetNumberFunction
 */
;(function () {
  'use strict'
  const version = 'v1.0.9'

  /**
   * @type CreateElementFunction
   */
  const createElement = (tag, attrs, children) => {
    const el = document.createElement(tag)
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    if (Array.isArray(children)) {
      el.append.apply(el, children)
    } else if (typeof children === 'string') {
      el.innerHTML = children
    }
    return el
  }

  /**
   * @type ExcludeClickFuction
   */
  const excludeClick = (included, excluded, onClick) => {
    const _data = {
      excludeDown: false,
      inIncluded: false,
      inExcluded: false
    }
    excluded.addEventListener('mousedown', () => (_data.excludeDown = true))
    excluded.addEventListener('mouseup', () => (_data.excludeDown = false))
    excluded.addEventListener('mouseenter', () => (_data.inExcluded = true))
    excluded.addEventListener('mouseleave', () => (_data.inExcluded = false))
    included.addEventListener('mouseenter', () => (_data.inIncluded = true))
    included.addEventListener('mouseleave', () => (_data.inIncluded = false))
    included.addEventListener('click', (e) => {
      if (_data.inIncluded && !_data.inExcluded) {
        if (_data.excludeDown) {
          _data.excludeDown = false
        } else {
          onClick?.(e)
        }
      }
    })
  }

  /**
   * @type LeftKeyFunction<Function>
   */
  const leftKey = (fn) => {
    return (...args) => {
      const key = args?.[0]?.button
      if (key === 0 || key === void 0) {
        fn.apply(this, args)
      }
    }
  }

  /**
   * @type GetNumberFunction
   */
  const getNumber = (str) => {
    const mArr = str?.match(/\d+(\.\d*)?|\.\d+/)
    return mArr?.length ? parseFloat(mArr[0]) : void 0
  }

  /**
   * @param {string} originStyleContent
   * @param {string} ancestor
   * @returns {string}
   */
  const addCSSAncestor = (originStyleContent, ancestor) => {
    originStyleContent = '}' + originStyleContent
    return originStyleContent.replaceAll(/}([^{}]+?){/g, (_, p1) => {
      return `}\n${p1.trim().split(',').map(it => `${ancestor} ${it}`).join(', ')} {`
    }).substring(1)
  }

  /**
   * @param {HTMLElement} el
   * @param {(e: MouseEvent, d: WithDragData) => void} [onMove]
   * @param {(e: MouseEvent, d: WithDragData) => void} [onClick]
   */
  const withDrag = (el, onMove, onClick) => {
    /**
     * @typedef {{innerOffsetY: number, outerHeight: number, justClick: boolean}} WithDragData
     */
    const _data = {
      outerHeight: 0,
      innerOffsetY: 0,
      justClick: false
    }

    const onElMouseMove = (e) => {
      _data.justClick = false
      onMove?.(e, _data)
    }

    const onElMouseUp = leftKey(() => {
      document.removeEventListener('mousemove', onElMouseMove)
      document.removeEventListener('mouseup', onElMouseUp)
    })

    el.addEventListener(
      'mousedown',
      leftKey((e) => {
        _data.justClick = true
        const elComputedStyle = window.getComputedStyle(el)
        _data.innerOffsetY = e.pageY - getNumber(elComputedStyle.top)
        _data.outerHeight =
          el.clientHeight + getNumber(elComputedStyle.borderTopWidth) + getNumber(elComputedStyle.borderBottomWidth)
        document.addEventListener('mousemove', onElMouseMove)
        document.addEventListener('mouseup', onElMouseUp)
      })
    )

    el.addEventListener(
      'mouseup',
      leftKey((e) => {
        if (_data.justClick) {
          onClick?.(e, _data)
          _data.justClick = false
        }
        onElMouseUp()
        e.stopPropagation()
      })
    )
  }

  /**
   * @param {PopupInjectConfig} config
   * @returns {string}
   */
  const getBaseStyle = (config) => `
<style>
  :not(svg *) {
      align-content: revert;
      align-items: revert;
      align-self: revert;
      animation: revert;
      background: revert;
      border: revert;
      border-radius: revert;
      box-shadow: revert;
      box-sizing: border-box;
      color: inherit;
      cursor: inherit;
      display: revert;
      flex: revert;
      float: revert;
      font: inherit;
      height: revert;
      inset: revert;
      justify-content: revert;
      justify-items: revert;
      justify-self: revert;
      letter-spacing: inherit;
      list-style: inherit;
      margin: revert;
      mask: revert;
      max-height: revert;
      max-width: revert;
      min-height: revert;
      min-width: revert;
      offset: revert;
      opacity: revert;
      outline: revert;
      overflow: revert;
      overscroll-behavior: revert;
      padding: revert;
      pointer-events: inherit;
      position: revert;
      text-align: inherit;
      text-shadow: inherit;
      text-transform: inherit;
      transform: revert;
      transition: revert;
      user-select: revert;
      visibility: inherit;
      width: revert;
      z-index: revert;
  }
  *::before, *::after {
      content: none;
  }
  *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
  }
  *::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.5);
  }
  *::-webkit-scrollbar-track {
      border-radius: 4px;
      background-color: transparent;
  }
  .flex {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      justify-content: flex-start;
  }
  .flex.col {
      flex-direction: column;
  }
  .container {
      all: revert;
      color: black;
      font-size: 14px;
      line-height: 1.5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
      font-style: normal;
      font-weight: normal;
  }
  .monospace {
      font-family: v-mono, "JetBrains Mono", Consolas, SFMono-Regular, Menlo, Courier, v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, monospace, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  .sticky-bar {
      position: fixed;
      top: ${config.location};
      left: 0;
      transform: translateX(calc(12px - ${config.collapse}));
      z-index: 99999999;
      background: #3d7fff;
      color: white;
      padding: 4px 12px 4px 6px;
      cursor: pointer;
      user-select: none;
      border-radius: 0 12px 12px 0;
      box-shadow: 0 2px 4px 1px #0006;
      transition: transform 0.5s ease;
  }
  .sticky-bar:hover {
      transform: none;
  }
  .mask {
      position: fixed;
      inset: 0;
      padding: 24px;
      overflow: auto;
      z-index: 99999999;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity .6s;
  }
  .container.open .mask {
      opacity: 1;
      pointer-events: all;
  }
  .popup {
      position: relative;
      margin: auto;
      padding: 16px;
      background: #f0f2f5;
      border-radius: 2px;
      box-shadow: 0 1px 12px 2px rgba(0, 0, 0, 0.4);
      transform: scale(0);
      transition: transform .3s;
  }
  .container.open .popup {
      transform: scale(1);
  }
  label {
      user-select: none;
  }
  textarea {
      resize: vertical;
  }
  .input, .button {
      height: 32px;
      transition: all 0.3s, height 0s;
  }
  .button {
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 16px;
      color: #fff;
      border: none;
      border-radius: 2px;
      background: #3d7fff;
      text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.05);
  }
  .button:hover, .button:focus {
      border-color: #669eff;
      background: #669eff;
  }
  .button:active {
      border-color: #295ed9;
      background: #295ed9;
  }
  .input {
      padding: 4px 8px;
      background: white;
      border: 1px solid #d9d9d9;
      border-radius: 2px;
  }
  .input:hover, .input:focus {
      border-color: #669eff;
  }
  .input:focus-visible {
      outline: none;
  }
  .input:focus {
      box-shadow: 0 0 0 2px rgba(61, 127, 255, 0.2);
  }
  ${config.style}
</style>`

  /**
   * @param {PopupInjectConfig} config
   * @param {(value: PopupInjectResult) => void} resolve
   */
  const _injectHtml = (config, resolve) => {
    const anchorId = 'x' + Math.floor(Math.random() * 100_000_000).toString(16)
    const styleContent = addCSSAncestor(getBaseStyle(config).replaceAll(/<\/?style>/g, ''), `#${anchorId}`)
    document.head.insertAdjacentHTML('beforeend', `<style data-namespace='${config.namespace}'>${styleContent}</style>`)
    const stickyBar = createElement('div', { class: 'sticky-bar' }, config.actionName)
    const popup = createElement('div', { class: 'popup flex col' }, config.content)
    const mask = createElement('div', { class: 'mask' }, [popup])
    const container = createElement('div', { class: 'container' }, [stickyBar, mask])
    const anchor = createElement('div', { id: anchorId, 'data-namespace': config.namespace, 'data-version': version }, [container])

    excludeClick(mask, popup, () => {
      container.classList.remove('open')
      config.onPopHide?.()
    })

    withDrag(
      stickyBar,
      (e, d) => {
        requestAnimationFrame(() => {
          const height = document.documentElement.clientHeight - d.outerHeight
          const newTop = e.pageY - d.innerOffsetY
          if (newTop <= 0) stickyBar.style.top = '0'
          else if (newTop > height) stickyBar.style.top = `${height}px`
          else stickyBar.style.top = `${newTop}px`
        })
      },
      () => {
        container.classList.add('open')
        config.onPopShow?.()
      }
    )

    document.body.append(anchor)
    // ---- other code
    resolve?.({
      elem: {
        container, stickyBar, mask, popup
      },
      func: {
        createElement, excludeClick, leftKey, getNumber
      }
    })
  }

  /**
   * @param {PopupInjectConfig} config
   * @returns {PopupInjectConfig}
   */
  const _checkConfig = (config) => {
    if (!config) throw new Error('config is required. you should call window.paso.injectPopup(config)')
    if (!config.namespace) throw new Error('config.namespace is required and it cannot be empty.')
    if (!/^[-\w]+$/.test(config.namespace)) throw new Error('config.namespace must match the regex /^[-\\w]+$/.')
    return config
  }

  if (!window.paso || !(window.paso instanceof Object)) window.paso = {}
  /**
   * @param {PopupInjectConfig} config
   * @returns {Promise<PopupInjectResult>}
   */
  window.paso.injectPopup = (config) => {
    const _config = Object.assign(
      {
        namespace: '',
        actionName: 'Action',
        collapse: '100%',
        location: '25%',
        content: '<label>Hello World</label>',
        style: '',
        onPopShow() {
        },
        onPopHide() {
        }
      },
      _checkConfig(config)
    )
    return new Promise((resolve) => _injectHtml(_config, resolve))
  }
})()
