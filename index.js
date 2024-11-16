import qs from './qs.js'
var parser = document.createElement('A')

class UrlState extends EventTarget {
  constructor () {
    super()
    // bound methods
    this._onnavigation = this._onnavigation.bind(this)
    this._onpopState = this._onpopState.bind(this)
    // properties
    this.virtual = window.parent !== window || window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
    this._index = window.history.state || 0
    this._queue = [{
      href: window.location.href,
      replace: true
    }]
    this._change()
  }

  push (href, replace) {
    if (!href) {
      this._queue.push({ type: 'forward' })
    } else if (typeof href === 'object') {
      href.type = 'query'
      href.replace = replace !== undefined ? replace : href.replace
      href.params = href.query ? href.query : href.params
      this._queue.push(href)
    } else {
      this._queue.push({ href, replace })
    }
    this._change()
  }

  replace (href) {
    this.push(href, true)
  }

  pop () {
    this._queue.push({ type: 'back' })
    this._change()
  }

  query (params, replace) {
    this._queue.push({
      type: 'query',
      params,
      replace
    })
    this._change()
  }

  _change () {
    if (this._busy || this._queue.length === 0) return
    var action = this._queue.shift()
    if (action.type === 'forward') {
      if (this.virtual) throw new Error('forward disallowed when virtual')
      this._busy = true
      window.history.forward()
      return
    } else if (action.type === 'back') {
      if (this.virtual) throw new Error('back disallowed when virtual')
      this._busy = true
      window.history.back()
      return
    } else if (action.type === 'query') {
      var params = this.params || {}
      for (var key in action.params) {
        var value = action.params[key]
        if (value === null) {
          delete params[key]
        } else {
          params[key] = action.params[key]
        }
      }
      var search = qs.stringify(params) || ''
      if (search) search = '?' + search
      action.href = this.origin + (action.pathname || this.pathname) + search + (action.hash || this.hash)
    }
    this.back = false
    this._busy = true
    if (action.href !== this._lastHref) {
      this._lastHref = action.href
      this._parseHref(action.href)
      if (!this.virtual) {
        if (action.replace) {
          window.history.replaceState(this._index, null, this.href)
        } else {
          window.history.pushState(++this._index, null, this.href)
        }
      }
      this.dispatchEvent(new CustomEvent('change', { detail: this }))
    }
    this._busy = false
    this._change()
  }

  _onnavigation (evt) {
    if (evt.metaKey || evt.ctrlKey || evt.defaultPrevented) return
    var href = null
    var target = evt.target
    if (evt.type === 'submit') {
      if (!target.action || target.action === window.location.href) {
        evt.preventDefault()
        return
      }
      href = target.action
    } else {
      while (target) {
        if (target.nodeName === 'A') {
          if (target.target === '_blank' || target.hasAttribute('download')) return
          href = target.href
          break
        }
        target = target.parentElement
      }
    }
    if (href === null) return
    parser.href = href
    var origin = parser.protocol + '//' + parser.host
    if (origin !== window.location.origin) {
      return
    }
    evt.preventDefault()
    this._queue.push({ action: 'push', href })
    this._change()
  }

  _onpopState (evt) {
    this._parseHref(window.location)
    this.back = evt.state < this._index
    this._index += this.back ? -1 : 1
    this._lastHref = this.href
    this.dispatchEvent(new CustomEvent('change', { detail: this }))
    this._busy = false
    this._change()
  }

  _parseHref (href) {
    parser.href = href
    // https://url.spec.whatwg.org props:
    this.href = parser.href
    this.protocol = parser.protocol
    this.hostname = parser.hostname
    this.port = parser.port
    this.pathname = parser.pathname
    this.search = parser.search
    this.hash = parser.hash
    this.host = parser.host
    // microsoft doesn't implement .origin:
    this.origin = this.protocol + '//' + this.host
    // non-standard but handy:
    this.params = qs.parse(this.search.slice(1))
    // remove trailing hash
    if (this.href[this.href.length - 1] === '#') {
      this.href = this.href.slice(0, -1)
    }
    // https://connect.microsoft.com/IE/feedbackdetail/view/1002846
    if (this.pathname[0] !== '/') {
      this.pathname = '/' + this.pathname
    }
  }
}

var urlState = new UrlState()
export default urlState

// link clicks and form submissions
window.addEventListener('click', urlState._onnavigation)
window.addEventListener('submit', urlState._onnavigation)

// back and forward buttons
window.addEventListener('popstate', urlState._onpopState)
