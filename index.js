var Emitter = require('events')
var qs = require('querystring')
var parser = document.createElement('A')

class UrlState extends Emitter {
  constructor () {
    super()
    // bound methods
    this._onnavigation = this._onnavigation.bind(this)
    this._onpopState = this._onpopState.bind(this)
    // properties
    this._index = window.history.state || 0
    this._queue = [{
      href: window.location.href,
      replace: true
    }]
    this.init = true
    // init in next tick
    setTimeout(() => this._change())
  }

  push (href, replace) {
    if (!href) {
      this._queue.push({ type: 'forward' })
      this._change()
      return
    }
    this._queue.push({ href, replace })
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
    if (this._busy || this._queue.length === 0) {
      this.init = false
      return
    }
    this._busy = true
    var action = this._queue.shift()
    if (action.type === 'forward') {
      window.history.forward()
      return
    } else if (action.type === 'back') {
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
      action.href = this.origin + this.pathname + search
    }
    this.back = false
    if (action.href !== this._lastHref) {
      this._lastHref = action.href
      this._parseHref(action.href)
      if (action.replace) {
        window.history.replaceState(this._index, null, this.href)
      } else {
        window.history.pushState(++this._index, null, this.href)
      }
      this.emit('change', this)
    }
    this._busy = false
    this._change()
  }

  _onnavigation (evt) {
    if (evt.metaKey || evt.defaultPrevented) return
    var target = evt.target
    var href = null
    if (target.nodeName === 'A') {
      href = target.href
    } else if (target.nodeName === 'FORM') {
      if (!target.action || target.action === window.location.href) {
        evt.preventDefault()
        return
      }
      href = target.action
    } else {
      return
    }
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
    this._lastHref = this.href
    this.emit('change', this)
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

var urlState = module.exports = new UrlState()

// link clicks and form submissions
window.addEventListener('click', urlState._onnavigation)
window.addEventListener('submit', urlState._onnavigation)

// back and forward buttons
window.addEventListener('popstate', urlState._onpopState)
