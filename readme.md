# url-state
Minimalist [history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) abstraction for building URL driven browser applications.

## Why
The predecessor to this library was [uri-router]() which did "all the things". Since 2014 when I first started using that library, I've written a few complex pushState apps and inventoried the features I actually like and use, and those I don't. This library is a subtractive rewrite of [uri-router]() and is quite a bit smaller, faster and more elegant.

## How
``` javascript
var url = require('url-state')

url.on('change', () => {
  console.log(url.pathname, url.params)
})

url.push('/somewhere')
url.pop()
url.query({ q: 'search' })
```

## API

### `var url = require('url-state')`
Returns a `UrlState` singleton. The first time `url-state` is required, it will globally hijack all link clicks and form submissions targeting the origin and begin listening for the `popstate` event.

## Methods
To get proper event sequencing, it's critical you do not use `window.history.{pushState,replaceState,go,forward,back}()` directly. Use the methods below instead.

### `url.push([href][, replace])`
Equivalent to `window.history.go(href)`. If `href` is ommited this is equivalent to `window.history.forward()`
* `location` String
* `replace` Boolean; indicates to use replaceState instead of pushState

### `uri.replace(href)`
Sugar for `uri.push(href, true)`.

### `url.pop()`
Equivalent to `window.history.back()`

### `url.query(params[, replace])`
Update `window.location.search` without clobbering the existing query. Set keys to `null` to remove them.

## Properties

### `href` `protocol` `hostname` `port` `pathname` `search` `hash` `host` `origin`
These properties are described in the [URL spec](https://url.spec.whatwg.org).

### `init`
True during the first synchronous sequence of location changes.

### `back`
True when the browser's back button has been clicked or `url.pop()` was called.

### `params`
A parsed search (query) string object.

## Test
``` shell
$ npm run test
```

## License
MIT
