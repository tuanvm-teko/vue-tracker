# VueMatomo

[![npm](https://img.shields.io/npm/v/vue-matomo.svg)](https://www.npmjs.com/package/vue-matomo)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

## Installation

```bash
npm install --save vue-tracker-teko
```

## Usage

### Bundler (Webpack, Rollup)

```js
import Vue from "vue";
import VueMatomo from "vue-tracker-teko";

Vue.use(VueMatomo, {
  // Configure your matomo server and site by providing
  host: "https://dev-tracking.teko.vn",
  urlServeJsFile: "https://dev-tracking.teko.vn/track/libs/tracker-v1.0.0.full.min.js",
  appId: "chat-tool"

  // Enables automatically registering pageviews on the router
  router: router,

  // Whether to track the initial page view
  // Default: true
  trackInitialView: true,

  // Whether or not to log debug information
  // Default: false
  debug: false
});

// or
window.track();

```

### Ignoring routes

It is possible to ignore routes using the route meta:

```js
{
  path: '/page-2',
  name: 'Page2',
  component: Page2,
  meta: {
  analyticsIgnore: true
  }
}
```

## License

[MIT](http://opensource.org/licenses/MIT)
