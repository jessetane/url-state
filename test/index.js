import url from 'url-state'
import tap from 'tap-esm'

var pre = document.createElement('pre')
document.body.appendChild(pre)

tap('initial state', t => {
  t.plan(1)
  pre.textContent = JSON.stringify(url, null, 2)
  t.equal(url.pathname, '/')
})

tap('handle push', t => {
  t.plan(4)
  var n = 0
  url.addEventListener('change', onchange)
  function onchange () {
    if (n === 0) {
      t.equal(url.pathname, '/a')
      url.push({ pathname: '/b', query: { x: 42 }, hash: '#ish', replace: true })
      n++
    } else {
      t.equal(url.pathname, '/b')
      t.equal(url.params.x, '42')
      t.equal(url.hash, '#ish')
      url.removeEventListener('change', onchange)
    }
  }
  url.push('/a')
})

tap('handle replace', t => {
  t.plan(2)
  const state = window.history.state
  url.addEventListener('change', () => {
    t.equal(url.pathname, '/b')
    t.equal(window.history.state, state)
  }, { once: true })
  url.replace('/b')
})

tap('handle pop', t => {
  t.plan(1)
  url.addEventListener('change', () => {
    t.equal(url.pathname, '/')
  }, { once: true })
  url.pop()
})

tap('handle forward', t => {
  t.plan(1)
  url.addEventListener('change', () => {
    t.equal(url.pathname, '/b')
  }, { once: true })
  url.push()
})

tap('handle nested back', t => {
  t.plan(3)
  var n = 0
  url.addEventListener('change', onchange)
  function onchange () {
    if (n === 0) {
      t.equal(url.pathname, '/c')
      url.pop()
      url.pop()
      n++
    } else if (n === 1) {
      t.equal(url.pathname, '/b')
      n++
    } else {
      t.equal(url.pathname, '/')
      url.removeEventListener('change', onchange)
    }
  }
  url.push('/c')
})

tap('query', t => {
  t.plan(21)
  var n = 0
  url.addEventListener('change', onchange)
  function onchange () {
    if (n === 0) {
      t.equal(1, Object.keys(url.params).length)
      t.equal('bar', url.params.foo)
      t.equal('?foo=bar', url.search)
      url.query({ beep: 'boop' })
      n++
    } else if (n === 1) {
      t.equal(Object.keys(url.params).length, 2)
      t.equal(url.params.foo, 'bar')
      t.equal(url.params.beep, 'boop')
      t.equal(url.search, '?foo=bar&beep=boop')
      url.query({ foo: null, beep: '42' })
      n++
    } else if (n === 2) {
      t.equal(Object.keys(url.params).length, 1)
      t.equal(url.params.beep, '42')
      t.equal(url.search, '?beep=42')
      url.query({ beep: [ 42, 43, 44 ] })
      n++
    } else if (n === 3) {
      t.equal(Object.keys(url.params).length, 1)
      t.equal(url.params.beep[0], '42')
      t.equal(url.params.beep[1], '43')
      t.equal(url.params.beep[2], '44')
      t.equal(url.search, '?beep=42&beep=43&beep=44')
      url.query({ beep: '' })
      n++
    } else if (n === 4) {
      t.equal(Object.keys(url.params).length, 1)
      t.equal(url.params.beep, '')
      t.equal(url.search, '?beep')
      url.query({ beep: null })
      n++
    } else {
      t.equal(Object.keys(url.params).length, 0)
      t.equal(url.search, '')
      t.notEqual(window.location.href.slice(-1)[0], '?')
      url.removeEventListener('change', onchange)
    }
  }
  url.query({ foo: 'bar' })
})

tap('handle url hash', t => {
  t.plan(3)
  var n = 0
  url.addEventListener('change', onchange)
  function onchange () {
    if (n === 0) {
      t.equal(url.hash, '#ish')
      url.push('#')
      n++
    } else {
      t.equal(url.hash, '')
      t.notEqual(window.location.href.slice(-1)[0], '#')
      url.removeEventListener('change', onchange)
    }
  }
  url.push('#ish')
})

tap('virtual', t => {
  t.plan(2)
  const start = window.history.state
  url.addEventListener('change', evt => {
    const end = window.history.state
    t.equal(start, end)
    url.addEventListener('change', () => t.pass(), { once: true })
    url.pop()
    url.virtual = false
  }, { once: true })
  url.virtual = true
  url.push('/x')
})

tap('virtual forbidden methods', t => {
  t.plan(2)
  url.virtual = true
  try {
    url.pop()
  } catch (err) {
    t.equal(err.message, 'back disallowed when virtual')
  }
  try {
    url.push()
  } catch (err) {
    t.equal(err.message, 'forward disallowed when virtual')
  }
  url.virtual = false
})
