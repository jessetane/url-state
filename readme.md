# url-state
Minimalist [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) abstraction for building URL driven browser applications.

## Why
So your website feels like a native app but still has [cool URLs](https://www.w3.org/Provider/Style/URI). Or URIs, or whatever...

## How
``` javascript
import url from 'url-state'

url.addEventListener('change', () => {
  console.log(url.pathname, url.params)
})

url.push('/pathnames')
url.pop()
url.push('#hashes')
url.pop()
url.push('?query=strings')
url.query({ query: 'objects' }, true)
url.query({ query: null }, true)
url.pop()
```

## API

### `import url from 'url-state'`
Returns a `UrlState` singleton. The first time `url-state` is imported, it will globally hijack all link clicks and form submissions targeting the origin and begin listening for the `popstate` event.

## Methods
To get proper event sequencing, it's critical you do not use `window.history.{pushState,replaceState,go,forward,back}()` directly. Use the methods below instead.

### `url.push([href][, replace])`
Equivalent to `window.history.go(href)`. If `href` is ommited this is equivalent to `window.history.forward()`
* `href` String|Object{pathname,query,hash,replace}
* `replace` Boolean; indicates to use replaceState instead of pushState

### `url.replace(href)`
Sugar for `url.push(href, true)`.

### `url.pop()`
Equivalent to `window.history.back()`

### `url.query(params[, replace])`
Update `window.location.search` without clobbering the existing query. Set keys to `null` to remove them.
* `params` Object

## Properties

### `href` `protocol` `hostname` `port` `pathname` `search` `hash` `host` `origin`
These properties are described in the [URL spec](https://url.spec.whatwg.org).

### `init`
True during the first history change and any nested changes.

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
