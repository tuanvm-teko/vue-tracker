var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var defaultOptions = {
    debug: false,
    host: "https://dev-tracking.teko.vn",
    urlServeJsFile: "https://dev-tracking.teko.vn/track/libs/tracker-v1.0.0.full.min.js",
    contentImpressionsWithInNode: {
        enable: false,
        options: { wrapper: "app" }
    }
};
var init = function (f, b, e, v, i, r, t, s) {
    // Stop if tracker already exists
    if (f[i])
        return;
    // Initialise the 'GlobalTrackerNamespace' array
    f["GlobalTrackerNamespace"] = f["GlobalTrackerNamespace"] || [];
    // Add the new Tracker namespace to the global array so tracker.js can find it
    f["GlobalTrackerNamespace"].push(i);
    // Add endpoint
    f["GlobalTrackerNamespace"].push(r);
    // Create the Snowplow function
    f[i] = function () {
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
    window.onerror = function (msg, _url, _lineNo, _columnNo, error) {
        f[i]("error", { msg: msg, error: error });
        return false;
    };
};
export default function install(_Vue, setupOptions) {
    if (setupOptions === void 0) { setupOptions = {}; }
    var isStart = false;
    var options = Object.assign({}, defaultOptions, setupOptions);
    var host = options.host, urlServeJsFile = options.urlServeJsFile;
    init(window, document, "script", urlServeJsFile, "track", host);
    if (options.appId) {
        window.track("init", options.appId);
    }
    window.track("enableUnloadPageView");
    // Track page navigations if router is specified
    if (options.router) {
        options.router.afterEach(function (to, from) {
            // enable for content tracking in node
            // if (options.contentImpressionsWithInNode.enable) {
            //   const content = document.getElementById(
            //     options.contentImpressionsWithInNode.options.wrapper
            //   );
            //   window.track("enableTrackContentImpressionsWithInNode", content);
            // }
            // Unfortunately the window location is not yet updated here
            // We need to make our own url using the data provided by the router
            var loc = window.location;
            // Protocol may or may not contain a colon
            var protocol = loc.protocol;
            if (protocol.slice(-1) !== ":") {
                protocol += ":";
            }
            var getPath = function (source) {
                var maybeHash = options.router.mode === "hash" ? "/#" : "";
                return protocol + "//" + loc.host + maybeHash + source.path;
            };
            var getPathFull = function (source) {
                var maybeHash = options.router.mode === "hash" ? "/#" : "";
                return protocol + "//" + loc.host + maybeHash + source.fullPath;
            };
            var getSkuFromRoute = function (route) {
                var meta = route.meta;
                return meta && meta.getSku && typeof meta.getSku == "function"
                    ? meta.getSku(route)
                    : undefined;
            };
            var urlToFull = getPathFull(to);
            var urlFromFull = getPathFull(from);
            var urlTo = getPath(to);
            var urlFrom = getPath(from);
            if (to.meta.analyticsIgnore) {
                options.debug && console.debug("[vue-tracker] Ignoring " + urlTo);
                return;
            }
            if (options.debug) {
                console.debug("[vue-tracker] Tracking to " + urlTo);
                console.debug("[vue-tracker] Tracking from " + urlFrom);
            }
            var metaTo = to.meta;
            var metaFrom = from.meta;
            var skuTo = getSkuFromRoute(to);
            var skuFrom = getSkuFromRoute(from);
            if (isStart) {
                window.track("setCurrentUrl", urlFromFull);
                window.track("trackUnLoadPageView", __assign(__assign({}, (metaFrom && metaFrom.pageCode
                    ? { pageCode: metaFrom.pageCode }
                    : {})), (skuFrom ? { sku: skuFrom } : {})));
            }
            if (!isStart) {
                if (document.referrer) {
                    window.track("setReferrerUrl", document.referrer);
                }
                else {
                    window.track("setReferrerUrl", urlFromFull);
                }
            }
            else {
                window.track("setReferrerUrl", urlFromFull);
            }
            window.track("setCurrentUrl", urlToFull);
            window.track("trackLoadPageView", __assign(__assign({}, (metaTo && metaTo.pageCode ? { pageCode: metaTo.pageCode } : {})), (skuTo ? { sku: skuTo } : {})));
            isStart = true;
        });
    }
}
//# sourceMappingURL=index.js.map