var tape = require('tape')
var url = null

var pre = document.createElement('pre')
document.body.appendChild(pre)

tape('dispatch initial change event', t => {
  t.plan(2)
  url = require('./')
  url.on('change', () => {
    // some visual feedback
    pre.textContent = JSON.stringify(url, null, 2)
  })
  url.once('change', () => {
    t.equal(url.pathname, '/test.html')
    t.equal(url.init, true)
  })
})

tape('handle push', t => {
  t.plan(1)
  url.once('change', () => {
    t.equal(url.pathname, '/a')
  })
  url.push('/a')
})

tape('handle replace', t => {
  t.plan(1)
  url.once('change', () => {
    t.equal(url.pathname, '/b')
  })
  url.replace('/b')
})

tape('handle pop', t => {
  t.plan(1)
  url.once('change', () => {
    t.equal(url.pathname, '/test.html')
  })
  url.pop()
})

tape('handle forward', t => {
  t.plan(1)
  url.once('change', () => {
    t.equal(url.pathname, '/b')
  })
  url.push()
})

tape('handle nested back', t => {
  t.plan(3)
  var n = 0
  url.on('change', onchange)
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
      t.equal(url.pathname, '/test.html')
      url.removeListener('change', onchange)
    }
  }
  url.push('/c')
})

tape('query', t => {
  t.plan(9)
  var n = 0
  url.on('change', onchange)
  function onchange () {
    if (n === 0) {
      t.deepEqual(url.params, { foo: 'bar' })
      t.equal(url.search, '?foo=bar')
      url.query({ beep: 'boop' })
      n++
    } else if (n === 1) {
      t.deepEqual(url.params, { foo: 'bar', beep: 'boop' })
      t.equal(url.search, '?foo=bar&beep=boop')
      url.query({ foo: null, beep: '42' })
      n++
    } else if (n === 2) {
      t.deepEqual(url.params, { beep: '42' })
      t.equal(url.search, '?beep=42')
      url.query({ beep: null })
      n++
    } else {
      t.deepEqual(url.params, {})
      t.equal(url.search, '')
      t.notEqual(window.location.href.slice(-1)[0], '?')
      url.removeListener('change', onchange)
    }
  }
  url.query({ foo: 'bar' })
})

tape('handle hash', t => {
  t.plan(3)
  var n = 0
  url.on('change', onchange)
  function onchange () {
    if (n === 0) {
      t.equal(url.hash, '#ish')
      url.push('#')
      n++
    } else {
      t.equal(url.hash, '')
      t.notEqual(window.location.href.slice(-1)[0], '#')
      url.removeListener('change', onchange)
    }
  }
  url.push('#ish')
})
