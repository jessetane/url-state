var JSBuilder = require('build-js')
var http = require('app-server')

var js = new JSBuilder({
  src: 'test.js',
  dest: 'test-build.js'
})

js.watch(function (err) {
  if (err) console.log(err.message)
  else console.log('test rebuilt')
})

var server = http({
  root: '.'
}, function (err) {
  if (err) throw err
  console.log('test server listening on port ' + server.port)
})

server.middleware = function (req, res, next) {
  console.log('test server got request: ' + req.method + ' ' + req.url)
  next()
}
