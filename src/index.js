const defaultOptions = {
  debug: false,
  host: "https://dev-tracking.teko.vn",
  urlServeJsFile:
    "https://dev-tracking.teko.vn/track/libs/tracker-v1.0.0.full.min.js",
  contentImpressionsWithInNode: {
    enable: false,
    options: { wrapper: "app" }
  }
};

const init = function(f, b, e, v, i, r, t, s) {
  // Stop if tracker already exists
  if (f[i]) return;

  // Initialise the 'GlobalTrackerNamespace' array
  f["GlobalTrackerNamespace"] = f["GlobalTrackerNamespace"] || [];

  // Add the new Tracker namespace to the global array so tracker.js can find it
  f["GlobalTrackerNamespace"].push(i);

  // Add endpoint
  f["GlobalTrackerNamespace"].push(r);

  // Create the Snowplow function
  f[i] = function() {
    (f[i].q = f[i].q || []).push(arguments);
  };

  // Initialise the asynchronous queue
  f[i].q = f[i].q || [];

  // Create a new script element
  t = b.createElement(e);

  // The new script should load asynchronously
  t.async = !0;

  // Load Tracker-js
  t.src = v;

  // Get the first script on the page
  s = b.getElementsByTagName(e)[0];

  // Insert the Snowplow script before every other script so it executes as soon as possible
  s.parentNode.insertBefore(t, s);

  // add listener error
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    f[i]("error", { msg: msg, error: error });
    return false;
  };
};

export default function install(Vue, setupOptions = {}) {
  let isStart = false;
  const options = Object.assign({}, defaultOptions, setupOptions);
  const { host, urlServeJsFile } = options;
  init(window, document, "script", urlServeJsFile, "track", host);
  if (options.appId) {
    track("init", options.appId);
  }

  window.track("enableUnloadPageView");

  // Track page navigations if router is specified
  if (options.router) {
    options.router.afterEach((to, from) => {
      // enable for content tracking in node
      // if (options.contentImpressionsWithInNode.enable) {
      //   const content = document.getElementById(
      //     options.contentImpressionsWithInNode.options.wrapper
      //   );
      //   window.track("enableTrackContentImpressionsWithInNode", content);
      // }

      // Unfortunately the window location is not yet updated here
      // We need to make our own url using the data provided by the router
      const loc = window.location;

      // Protocol may or may not contain a colon
      let protocol = loc.protocol;
      if (protocol.slice(-1) !== ":") {
        protocol += ":";
      }

      const getPath = source => {
        const maybeHash = options.router.mode === "hash" ? "/#" : "";
        return protocol + "//" + loc.host + maybeHash + source.path;
      };

      const getPathFull = source => {
        const maybeHash = options.router.mode === "hash" ? "/#" : "";
        return protocol + "//" + loc.host + maybeHash + source.fullPath;
      };

      const urlToFull = getPathFull(to);
      const urlFromFull = getPathFull(from);

      const urlTo = getPath(to);
      const urlFrom = getPath(from);

      if (to.meta.analyticsIgnore) {
        options.debug && console.debug("[vue-tracker] Ignoring " + urlTo);
        return;
      }
      if (options.debug) {
        console.debug("[vue-tracker] Tracking to " + urlTo);
        console.debug("[vue-tracker] Tracking from " + urlFrom);
      }

      if (isStart && urlFrom === urlTo) {
        window.track("setCurrentUrl", urlFromFull);
        window.track("trackUnLoadPageView");
      }

      if (isStart && urlFrom !== urlTo) {
        window.track("setCurrentUrl", urlFromFull);
        window.track("trackUnLoadPageView");
      }

      if (!isStart) {
        if (document.referrer) {
          window.track("setReferrerUrl", document.referrer);
        } else {
          window.track("setReferrerUrl", urlFromFull);
        }
      } else {
        window.track("setReferrerUrl", urlFromFull);
      }

      window.track("setCurrentUrl", urlToFull);
      window.track("trackLoadPageView");

      isStart = true;
    });
  }
}
