var qs = {
  parse: s => {
    var params = {}
    for (var kv of new URLSearchParams(s)) {
      var key = kv[0]
      var prev = params[key]
      if (prev === undefined) {
        params[key] = kv[1]
      } else {
        if (Array.isArray(prev)) {
          params.push(kv[1])
        } else {
          params[key] = [prev, kv[1]]
        }
      }
    }
    return params
  },
  stringify: p => {
    var string = new URLSearchParams()
    for (var key in p) {
      var val = p[key]
      if (Array.isArray(val)) {
        val.forEach(v => string.append(key, v))
      } else {
        string.append(key, val)
      }
    }
    return string.toString()
  }
}

export default qs

