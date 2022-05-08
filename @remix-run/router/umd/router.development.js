/**
 * @remix-run/router v0.1.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Router = {}));
}(this, (function (exports) { 'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  /**
   * The pathname, search, and hash values of a URL.
   */

  (function (Action) {
    Action["Pop"] = "POP";
    Action["Push"] = "PUSH";
    Action["Replace"] = "REPLACE";
  })(exports.Action || (exports.Action = {}));

  const PopStateEventType = "popstate"; //#endregion
  ////////////////////////////////////////////////////////////////////////////////
  //#region Memory History
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * A user-supplied object that describes a location. Used when providing
   * entries to `createMemoryHistory` via its `initialEntries` option.
   */

  /**
   * Memory history stores the current location in memory. It is designed for use
   * in stateful non-browser environments like tests and React Native.
   */
  function createMemoryHistory(options) {
    if (options === void 0) {
      options = {};
    }

    let {
      initialEntries = ["/"],
      initialIndex,
      v5Compat = false
    } = options;
    let entries; // Declare so we can access from createMemoryLocation

    entries = initialEntries.map((entry, index) => createMemoryLocation(entry, null, index === 0 ? "default" : undefined));
    let index = clampIndex(initialIndex == null ? entries.length - 1 : initialIndex);
    let action = exports.Action.Pop;
    let listeners = createEvents();

    function clampIndex(n) {
      return Math.min(Math.max(n, 0), entries.length - 1);
    }

    function getCurrentLocation() {
      return entries[index];
    }

    function createMemoryLocation(to, state, key) {
      if (state === void 0) {
        state = null;
      }

      let location = createLocation(entries ? getCurrentLocation().pathname : "/", to, state, key);
       warning(location.pathname.charAt(0) === "/", "relative pathnames are not supported in memory history: " + JSON.stringify(to)) ;
      return location;
    }

    let history = {
      get index() {
        return index;
      },

      get action() {
        return action;
      },

      get location() {
        return getCurrentLocation();
      },

      createHref(to) {
        return typeof to === "string" ? to : createPath(to);
      },

      push(to, state) {
        action = exports.Action.Push;
        let nextLocation = createMemoryLocation(to, state);
        index += 1;
        entries.splice(index, entries.length, nextLocation);

        if (v5Compat) {
          listeners.call({
            action,
            location: nextLocation
          });
        }
      },

      replace(to, state) {
        action = exports.Action.Replace;
        let nextLocation = createMemoryLocation(to, state);
        entries[index] = nextLocation;

        if (v5Compat) {
          listeners.call({
            action,
            location: nextLocation
          });
        }
      },

      go(delta) {
        action = exports.Action.Pop;
        index = clampIndex(index + delta);
        listeners.call({
          action,
          location: getCurrentLocation()
        });
      },

      listen(listener) {
        return listeners.push(listener);
      }

    };
    return history;
  } //#endregion
  ////////////////////////////////////////////////////////////////////////////////
  //#region Browser History
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * A browser history stores the current location in regular URLs in a web
   * browser environment. This is the standard for most web apps and provides the
   * cleanest URLs the browser's address bar.
   *
   * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#browserhistory
   */

  /**
   * Browser history stores the location in regular URLs. This is the standard for
   * most web apps, but it requires some configuration on the server to ensure you
   * serve the same app at multiple URLs.
   *
   * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#createbrowserhistory
   */
  function createBrowserHistory(options) {
    if (options === void 0) {
      options = {};
    }

    function createBrowserLocation(window, globalHistory) {
      var _globalHistory$state, _globalHistory$state2;

      let {
        pathname,
        search,
        hash
      } = window.location;
      return createLocation("", {
        pathname,
        search,
        hash
      }, // state defaults to `null` because `window.history.state` does
      ((_globalHistory$state = globalHistory.state) == null ? void 0 : _globalHistory$state.usr) || null, ((_globalHistory$state2 = globalHistory.state) == null ? void 0 : _globalHistory$state2.key) || "default");
    }

    function createBrowserHref(window, to) {
      return typeof to === "string" ? to : createPath(to);
    }

    return getUrlBasedHistory(createBrowserLocation, createBrowserHref, null, options);
  } //#endregion
  ////////////////////////////////////////////////////////////////////////////////
  //#region Hash History
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * A hash history stores the current location in the fragment identifier portion
   * of the URL in a web browser environment.
   *
   * This is ideal for apps that do not control the server for some reason
   * (because the fragment identifier is never sent to the server), including some
   * shared hosting environments that do not provide fine-grained controls over
   * which pages are served at which URLs.
   *
   * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#hashhistory
   */

  /**
   * Hash history stores the location in window.location.hash. This makes it ideal
   * for situations where you don't want to send the location to the server for
   * some reason, either because you do cannot configure it or the URL space is
   * reserved for something else.
   *
   * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#createhashhistory
   */
  function createHashHistory(options) {
    if (options === void 0) {
      options = {};
    }

    function createHashLocation(window, globalHistory) {
      var _globalHistory$state3, _globalHistory$state4;

      let {
        pathname = "/",
        search = "",
        hash = ""
      } = parsePath(window.location.hash.substr(1));
      return createLocation("", {
        pathname,
        search,
        hash
      }, // state defaults to `null` because `window.history.state` does
      ((_globalHistory$state3 = globalHistory.state) == null ? void 0 : _globalHistory$state3.usr) || null, ((_globalHistory$state4 = globalHistory.state) == null ? void 0 : _globalHistory$state4.key) || "default");
    }

    function createHashHref(window, to) {
      let base = window.document.querySelector("base");
      let href = "";

      if (base && base.getAttribute("href")) {
        let url = window.location.href;
        let hashIndex = url.indexOf("#");
        href = hashIndex === -1 ? url : url.slice(0, hashIndex);
      }

      return href + "#" + (typeof to === "string" ? to : createPath(to));
    }

    function validateHashLocation(location, to) {
       warning(location.pathname.charAt(0) === "/", "relative pathnames are not supported in hash history.push(" + JSON.stringify(to) + ")") ;
    }

    return getUrlBasedHistory(createHashLocation, createHashHref, validateHashLocation, options);
  } //#endregion
  ////////////////////////////////////////////////////////////////////////////////
  //#region UTILS
  ////////////////////////////////////////////////////////////////////////////////

  const readOnly =  obj => Object.freeze(obj) ;

  function warning(cond, message) {
    if (!cond) {
      // eslint-disable-next-line no-console
      if (typeof console !== "undefined") console.warn(message);

      try {
        // Welcome to debugging history!
        //
        // This error is thrown as a convenience so you can more easily
        // find the source for a warning that appears in the console by
        // enabling "pause on exceptions" in your JavaScript debugger.
        throw new Error(message); // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  }

  function createEvents() {
    let handlers = [];
    return {
      get length() {
        return handlers.length;
      },

      push(fn) {
        handlers.push(fn);
        return function () {
          handlers = handlers.filter(handler => handler !== fn);
        };
      },

      call(arg) {
        handlers.forEach(fn => fn && fn(arg));
      }

    };
  }

  function createKey() {
    return Math.random().toString(36).substr(2, 8);
  }
  /**
   * For browser-based histories, we combine the state and key into an object
   */


  function getHistoryState(location) {
    return {
      usr: location.state,
      key: location.key
    };
  }
  /**
   * Creates a Location object with a unique key from the given Path
   */


  function createLocation(current, to, state, key) {
    if (state === void 0) {
      state = null;
    }

    return readOnly(_extends({
      pathname: typeof current === "string" ? current : current.pathname,
      search: "",
      hash: ""
    }, typeof to === "string" ? parsePath(to) : to, {
      state,
      // TODO: This could be cleaned up.  push/replace should probably just take
      // full Locations now and avoid the need to run through this flow at all
      // But that's a pretty big refactor to the current test suite so going to
      // keep as is for the time being and just let any incoming keys take precedence
      key: (to == null ? void 0 : to.key) || key || createKey()
    }));
  }
  /**
   * Creates a string URL path from the given pathname, search, and hash components.
   */

  function createPath(_ref) {
    let {
      pathname = "/",
      search = "",
      hash = ""
    } = _ref;
    if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
    if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
    return pathname;
  }
  /**
   * Parses a string URL path into its separate pathname, search, and hash components.
   */

  function parsePath(path) {
    let parsedPath = {};

    if (path) {
      let hashIndex = path.indexOf("#");

      if (hashIndex >= 0) {
        parsedPath.hash = path.substr(hashIndex);
        path = path.substr(0, hashIndex);
      }

      let searchIndex = path.indexOf("?");

      if (searchIndex >= 0) {
        parsedPath.search = path.substr(searchIndex);
        path = path.substr(0, searchIndex);
      }

      if (path) {
        parsedPath.pathname = path;
      }
    }

    return parsedPath;
  }

  function getUrlBasedHistory(getLocation, createHref, validateLocation, options) {
    if (options === void 0) {
      options = {};
    }

    let {
      window = document.defaultView,
      v5Compat = false
    } = options;
    let globalHistory = window.history;
    let action = exports.Action.Pop;
    let listeners = createEvents();
    window.addEventListener(PopStateEventType, () => {
      action = exports.Action.Pop;
      listeners.call({
        action,
        location: history.location
      });
    });

    function push(to, state) {
      action = exports.Action.Push;
      let location = createLocation(history.location, to, state);
      validateLocation == null ? void 0 : validateLocation(location, to);
      let historyState = getHistoryState(location);
      let url = history.createHref(location); // try...catch because iOS limits us to 100 pushState calls :/

      try {
        globalHistory.pushState(historyState, "", url);
      } catch (error) {
        // They are going to lose state here, but there is no real
        // way to warn them about it since the page will refresh...
        window.location.assign(url);
      }

      if (v5Compat) {
        listeners.call({
          action,
          location
        });
      }
    }

    function replace(to, state) {
      action = exports.Action.Replace;
      let location = createLocation(history.location, to, state);
      validateLocation == null ? void 0 : validateLocation(location, to);
      let historyState = getHistoryState(location);
      let url = history.createHref(location);
      globalHistory.replaceState(historyState, "", url);

      if (v5Compat) {
        listeners.call({
          action,
          location: location
        });
      }
    }

    let history = {
      get action() {
        return action;
      },

      get location() {
        return getLocation(window, globalHistory);
      },

      createHref(to) {
        return createHref(window, to);
      },

      push,
      replace,

      go(n) {
        return globalHistory.go(n);
      },

      listen(listener) {
        return listeners.push(listener);
      }

    };
    return history;
  } //#endregion

  /**
   * Matches the given routes to a location and returns the match data.
   *
   * @see https://reactrouter.com/docs/en/v6/api#matchroutes
   */
  function matchRoutes(routes, locationArg, basename) {
    if (basename === void 0) {
      basename = "/";
    }

    let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    let pathname = stripBasename(location.pathname || "/", basename);

    if (pathname == null) {
      return null;
    }

    let branches = flattenRoutes(routes);
    rankRouteBranches(branches);
    let matches = null;

    for (let i = 0; matches == null && i < branches.length; ++i) {
      matches = matchRouteBranch(branches[i], pathname);
    }

    return matches;
  }

  function flattenRoutes(routes, branches, parentsMeta, parentPath) {
    if (branches === void 0) {
      branches = [];
    }

    if (parentsMeta === void 0) {
      parentsMeta = [];
    }

    if (parentPath === void 0) {
      parentPath = "";
    }

    routes.forEach((route, index) => {
      let meta = {
        relativePath: route.path || "",
        caseSensitive: route.caseSensitive === true,
        childrenIndex: index,
        route
      };

      if (meta.relativePath.startsWith("/")) {
        !meta.relativePath.startsWith(parentPath) ?  invariant(false, "Absolute route path \"" + meta.relativePath + "\" nested under path " + ("\"" + parentPath + "\" is not valid. An absolute child route path ") + "must start with the combined path of all its parent routes.")  : void 0;
        meta.relativePath = meta.relativePath.slice(parentPath.length);
      }

      let path = joinPaths([parentPath, meta.relativePath]);
      let routesMeta = parentsMeta.concat(meta); // Add the children before adding this route to the array so we traverse the
      // route tree depth-first and child routes appear before their parents in
      // the "flattened" version.

      if (route.children && route.children.length > 0) {
        !(route.index !== true) ?  invariant(false, "Index routes must not have child routes. Please remove " + ("all child routes from route path \"" + path + "\"."))  : void 0;
        flattenRoutes(route.children, branches, routesMeta, path);
      } // Routes without a path shouldn't ever match by themselves unless they are
      // index routes, so don't add them to the list of possible branches.


      if (route.path == null && !route.index) {
        return;
      }

      branches.push({
        path,
        score: computeScore(path, route.index),
        routesMeta
      });
    });
    return branches;
  }

  function rankRouteBranches(branches) {
    branches.sort((a, b) => a.score !== b.score ? b.score - a.score // Higher score first
    : compareIndexes(a.routesMeta.map(meta => meta.childrenIndex), b.routesMeta.map(meta => meta.childrenIndex)));
  }

  const paramRe = /^:\w+$/;
  const dynamicSegmentValue = 3;
  const indexRouteValue = 2;
  const emptySegmentValue = 1;
  const staticSegmentValue = 10;
  const splatPenalty = -2;

  const isSplat = s => s === "*";

  function computeScore(path, index) {
    let segments = path.split("/");
    let initialScore = segments.length;

    if (segments.some(isSplat)) {
      initialScore += splatPenalty;
    }

    if (index) {
      initialScore += indexRouteValue;
    }

    return segments.filter(s => !isSplat(s)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
  }

  function compareIndexes(a, b) {
    let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
    return siblings ? // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - b[b.length - 1] : // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0;
  }

  function matchRouteBranch(branch, pathname) {
    let {
      routesMeta
    } = branch;
    let matchedParams = {};
    let matchedPathname = "/";
    let matches = [];

    for (let i = 0; i < routesMeta.length; ++i) {
      let meta = routesMeta[i];
      let end = i === routesMeta.length - 1;
      let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
      let match = matchPath({
        path: meta.relativePath,
        caseSensitive: meta.caseSensitive,
        end
      }, remainingPathname);
      if (!match) return null;
      Object.assign(matchedParams, match.params);
      let route = meta.route;
      matches.push({
        // TODO: Can this as be avoided?
        params: matchedParams,
        pathname: joinPaths([matchedPathname, match.pathname]),
        pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
        route
      });

      if (match.pathnameBase !== "/") {
        matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
      }
    }

    return matches;
  }
  /**
   * Returns a path with params interpolated.
   *
   * @see https://reactrouter.com/docs/en/v6/api#generatepath
   */


  function generatePath(path, params) {
    if (params === void 0) {
      params = {};
    }

    return path.replace(/:(\w+)/g, (_, key) => {
      !(params[key] != null) ?  invariant(false, "Missing \":" + key + "\" param")  : void 0;
      return params[key];
    }).replace(/\/*\*$/, _ => params["*"] == null ? "" : params["*"].replace(/^\/*/, "/"));
  }
  /**
   * A PathPattern is used to match on some portion of a URL pathname.
   */

  /**
   * Performs pattern matching on a URL pathname and returns information about
   * the match.
   *
   * @see https://reactrouter.com/docs/en/v6/api#matchpath
   */
  function matchPath(pattern, pathname) {
    if (typeof pattern === "string") {
      pattern = {
        path: pattern,
        caseSensitive: false,
        end: true
      };
    }

    let [matcher, paramNames] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
    let match = pathname.match(matcher);
    if (!match) return null;
    let matchedPathname = match[0];
    let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
    let captureGroups = match.slice(1);
    let params = paramNames.reduce((memo, paramName, index) => {
      // We need to compute the pathnameBase here using the raw splat value
      // instead of using params["*"] later because it will be decoded then
      if (paramName === "*") {
        let splatValue = captureGroups[index] || "";
        pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
      }

      memo[paramName] = safelyDecodeURIComponent(captureGroups[index] || "", paramName);
      return memo;
    }, {});
    return {
      params,
      pathname: matchedPathname,
      pathnameBase,
      pattern
    };
  }

  function compilePath(path, caseSensitive, end) {
    if (caseSensitive === void 0) {
      caseSensitive = false;
    }

    if (end === void 0) {
      end = true;
    }

     warning$1(path === "*" || !path.endsWith("*") || path.endsWith("/*"), "Route path \"" + path + "\" will be treated as if it were " + ("\"" + path.replace(/\*$/, "/*") + "\" because the `*` character must ") + "always follow a `/` in the pattern. To get rid of this warning, " + ("please change the route path to \"" + path.replace(/\*$/, "/*") + "\".")) ;
    let paramNames = [];
    let regexpSource = "^" + path.replace(/\/*\*?$/, "") // Ignore trailing / and /*, we'll handle it below
    .replace(/^\/*/, "/") // Make sure it has a leading /
    .replace(/[\\.*+^$?{}|()[\]]/g, "\\$&") // Escape special regex chars
    .replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^\\/]+)";
    });

    if (path.endsWith("*")) {
      paramNames.push("*");
      regexpSource += path === "*" || path === "/*" ? "(.*)$" // Already matched the initial /, just match the rest
      : "(?:\\/(.+)|\\/*)$"; // Don't include the / in params["*"]
    } else {
      regexpSource += end ? "\\/*$" // When matching to the end, ignore trailing slashes
      : // Otherwise, match a word boundary or a proceeding /. The word boundary restricts
      // parent routes to matching only their own words and nothing more, e.g. parent
      // route "/home" should not match "/home2".
      // Additionally, allow paths starting with `.`, `-`, `~`, and url-encoded entities,
      // but do not consume the character in the matched path so they can match against
      // nested paths.
      "(?:(?=[.~-]|%[0-9A-F]{2})|\\b|\\/|$)";
    }

    let matcher = new RegExp(regexpSource, caseSensitive ? undefined : "i");
    return [matcher, paramNames];
  }

  function safelyDecodeURIComponent(value, paramName) {
    try {
      return decodeURIComponent(value);
    } catch (error) {
       warning$1(false, "The value for the URL param \"" + paramName + "\" will not be decoded because" + (" the string \"" + value + "\" is a malformed URL segment. This is probably") + (" due to a bad percent encoding (" + error + ").")) ;
      return value;
    }
  }

  function stripBasename(pathname, basename) {
    if (basename === "/") return pathname;

    if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
      return null;
    }

    let nextChar = pathname.charAt(basename.length);

    if (nextChar && nextChar !== "/") {
      // pathname does not start with basename/
      return null;
    }

    return pathname.slice(basename.length) || "/";
  }
  function invariant(value, message) {
    if (value === false || value === null || typeof value === "undefined") {
      throw new Error(message);
    }
  }
  function warning$1(cond, message) {
    if (!cond) {
      // eslint-disable-next-line no-console
      if (typeof console !== "undefined") console.warn(message);

      try {
        // Welcome to debugging React Router!
        //
        // This error is thrown as a convenience so you can more easily
        // find the source for a warning that appears in the console by
        // enabling "pause on exceptions" in your JavaScript debugger.
        throw new Error(message); // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  }
  const alreadyWarned = {};
  function warningOnce(key, cond, message) {
    if (!cond && !alreadyWarned[key]) {
      alreadyWarned[key] = true;
       warning$1(false, message) ;
    }
  }
  /**
   * Returns a resolved path object relative to the given pathname.
   *
   * @see https://reactrouter.com/docs/en/v6/api#resolvepath
   */

  function resolvePath(to, fromPathname) {
    if (fromPathname === void 0) {
      fromPathname = "/";
    }

    let {
      pathname: toPathname,
      search = "",
      hash = ""
    } = typeof to === "string" ? parsePath(to) : to;
    let pathname = toPathname ? toPathname.startsWith("/") ? toPathname : resolvePathname(toPathname, fromPathname) : fromPathname;
    return {
      pathname,
      search: normalizeSearch(search),
      hash: normalizeHash(hash)
    };
  }

  function resolvePathname(relativePath, fromPathname) {
    let segments = fromPathname.replace(/\/+$/, "").split("/");
    let relativeSegments = relativePath.split("/");
    relativeSegments.forEach(segment => {
      if (segment === "..") {
        // Keep the root "" segment so the pathname starts at /
        if (segments.length > 1) segments.pop();
      } else if (segment !== ".") {
        segments.push(segment);
      }
    });
    return segments.length > 1 ? segments.join("/") : "/";
  }

  function resolveTo(toArg, routePathnames, locationPathname) {
    let to = typeof toArg === "string" ? parsePath(toArg) : toArg;
    let toPathname = toArg === "" || to.pathname === "" ? "/" : to.pathname; // If a pathname is explicitly provided in `to`, it should be relative to the
    // route context. This is explained in `Note on `<Link to>` values` in our
    // migration guide from v5 as a means of disambiguation between `to` values
    // that begin with `/` and those that do not. However, this is problematic for
    // `to` values that do not provide a pathname. `to` can simply be a search or
    // hash string, in which case we should assume that the navigation is relative
    // to the current location's pathname and *not* the route pathname.

    let from;

    if (toPathname == null) {
      from = locationPathname;
    } else {
      let routePathnameIndex = routePathnames.length - 1;

      if (toPathname.startsWith("..")) {
        let toSegments = toPathname.split("/"); // Each leading .. segment means "go up one route" instead of "go up one
        // URL segment".  This is a key difference from how <a href> works and a
        // major reason we call this a "to" value instead of a "href".

        while (toSegments[0] === "..") {
          toSegments.shift();
          routePathnameIndex -= 1;
        }

        to.pathname = toSegments.join("/");
      } // If there are more ".." segments than parent routes, resolve relative to
      // the root / URL.


      from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
    }

    let path = resolvePath(to, from); // Ensure the pathname has a trailing slash if the original to value had one.

    if (toPathname && toPathname !== "/" && toPathname.endsWith("/") && !path.pathname.endsWith("/")) {
      path.pathname += "/";
    }

    return path;
  }
  function getToPathname(to) {
    // Empty strings should be treated the same as / paths
    return to === "" || to.pathname === "" ? "/" : typeof to === "string" ? parsePath(to).pathname : to.pathname;
  }
  const joinPaths = paths => paths.join("/").replace(/\/\/+/g, "/");
  const normalizePathname = pathname => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
  const normalizeSearch = search => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
  const normalizeHash = hash => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;

  //#region Types and Constants
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Map of routeId -> data returned from a loader/action/error
   */

  var ResultType;
  /**
   * Successful result from a loader or action
   */

  (function (ResultType) {
    ResultType["data"] = "data";
    ResultType["redirect"] = "redirect";
    ResultType["error"] = "error";
  })(ResultType || (ResultType = {}));

  const IDLE_TRANSITION = {
    state: "idle",
    location: undefined,
    type: "idle",
    formMethod: undefined,
    formAction: undefined,
    formEncType: undefined,
    formData: undefined
  };
  const IDLE_FETCHER = {
    state: "idle",
    type: "init",
    data: undefined,
    formMethod: undefined,
    formAction: undefined,
    formEncType: undefined,
    formData: undefined
  }; //#endregion
  ////////////////////////////////////////////////////////////////////////////////
  //#region createRouter
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Create a router and listen to history POP navigations
   */

  function createRouter(init) {
    var _init$hydrationData, _init$hydrationData2, _init$hydrationData4, _init$hydrationData5, _init$hydrationData6;

    !(init.routes.length > 0) ?  invariant(false, "You must provide a non-empty routes array to use Data Routers")  : void 0;
    let dataRoutes = convertRoutesToDataRoutes(init.routes);
    let subscriber = null;
    let initialMatches = matchRoutes(dataRoutes, init.history.location) || getNotFoundMatches(dataRoutes); // If we received hydration data without errors - detect if any matched
    // routes with loaders did not get provided loaderData, and if so launch an
    // initial data re-load to fetch everything

    let foundMissingHydrationData = ((_init$hydrationData = init.hydrationData) == null ? void 0 : _init$hydrationData.errors) == null && ((_init$hydrationData2 = init.hydrationData) == null ? void 0 : _init$hydrationData2.loaderData) != null && initialMatches.filter(m => m.route.loader).some(m => {
      var _init$hydrationData3, _init$hydrationData3$;

      return ((_init$hydrationData3 = init.hydrationData) == null ? void 0 : (_init$hydrationData3$ = _init$hydrationData3.loaderData) == null ? void 0 : _init$hydrationData3$[m.route.id]) === undefined;
    });

    if (foundMissingHydrationData) {
      console.warn("The provided hydration data did not find loaderData for all matched " + "routes with loaders.  Performing a full initial data load");
    }

    let state = {
      historyAction: init.history.action,
      location: init.history.location,
      // If we do not match a user-provided-route, fall back to the root
      // to allow the errorElement to take over
      matches: initialMatches,
      initialized: init.hydrationData != null && !foundMissingHydrationData,
      transition: IDLE_TRANSITION,
      revalidation: "idle",
      loaderData: foundMissingHydrationData ? {} : ((_init$hydrationData4 = init.hydrationData) == null ? void 0 : _init$hydrationData4.loaderData) || {},
      actionData: ((_init$hydrationData5 = init.hydrationData) == null ? void 0 : _init$hydrationData5.actionData) || null,
      errors: ((_init$hydrationData6 = init.hydrationData) == null ? void 0 : _init$hydrationData6.errors) || null,
      fetchers: new Map()
    }; // -- Stateful internal variables to manage navigations --
    // Current navigation in progress (to be committed in completeNavigation)

    let pendingAction = null; // AbortController for the active navigation

    let pendingNavigationController; // We use this to avoid touching history in completeNavigation if a
    // revalidation is entirely uninterrupted

    let isUninterruptedRevalidation = false; // Use this internal flag to force revalidation of all loaders:
    //  - submissions (completed or interrupted)
    //  - useRevalidate()
    //  - X-Remix-Revalidate (from redirect)

    let isRevalidationRequired = false; // AbortControllers for any in-flight fetchers

    let fetchControllers = new Map(); // Track loads based on the order in which they started

    let incrementingLoadId = 0; // Track the outstanding pending navigation data load to be compared against
    // the globally incrementing load when a fetcher load lands after a completed
    // navigation

    let pendingNavigationLoadId = -1; // Fetchers that triggered data reloads as a result of their actions

    let fetchReloadIds = new Map(); // Fetchers that triggered redirect navigations from their actions

    let fetchRedirectIds = new Set(); // Most recent href/match for fetcher.load calls for fetchers

    let fetchLoadMatches = new Map(); // If history informs us of a POP navigation, start the transition but do not update
    // state.  We'll update our own state once the transition completes

    init.history.listen(_ref => {
      let {
        action: historyAction,
        location
      } = _ref;
      return startNavigation(historyAction, location);
    }); // Kick off initial data load if needed.  Use Pop to avoid modifying history

    if (!state.initialized) {
      startNavigation(exports.Action.Pop, state.location);
    } // Update our state and notify the calling context of the change


    function updateState(newState) {
      state = _extends({}, state, newState);
      subscriber == null ? void 0 : subscriber(state);
    } // Complete a navigation returning the state.transition back to the IDLE_TRANSITION
    // and setting state.[historyAction/location/matches] to the new route.
    // - HistoryAction and Location are required params
    // - Transition will always be set to IDLE_TRANSITION
    // - Can pass any other state in newState


    function completeNavigation(historyAction, location, newState) {
      updateState(_extends({}, state.actionData != null && state.transition.type !== "actionReload" ? {
        actionData: null
      } : {}, newState, {
        historyAction,
        location,
        initialized: true,
        transition: IDLE_TRANSITION,
        revalidation: "idle",
        // Always preserve any existing loaderData from re-used routes
        loaderData: mergeLoaderData(state, newState)
      }));

      if (isUninterruptedRevalidation) ; else if (historyAction === exports.Action.Pop) ; else if (historyAction === exports.Action.Push) {
        init.history.push(location, location.state);
      } else if (historyAction === exports.Action.Replace) {
        init.history.replace(location, location.state);
      } // Reset stateful navigation vars


      pendingAction = null;
      isUninterruptedRevalidation = false;
      isRevalidationRequired = false;
    }

    async function navigate(path, opts) {
      if (typeof path === "number") {
        init.history.go(path);
        return;
      }

      let location = createLocation(state.location, path, opts == null ? void 0 : opts.state);
      let historyAction = opts != null && opts.replace ? exports.Action.Replace : exports.Action.Push;

      if (isSubmissionNavigation(opts)) {
        return await startNavigation(historyAction, location, {
          submission: {
            formMethod: opts.formMethod || "get",
            formAction: createHref(location),
            formEncType: (opts == null ? void 0 : opts.formEncType) || "application/x-www-form-urlencoded",
            formData: opts.formData
          }
        });
      }

      return await startNavigation(historyAction, location);
    }

    async function revalidate() {
      let {
        state: transitionState,
        type
      } = state.transition; // Toggle isRevalidationRequired so the next data load will call all loaders,
      // and mark us in a revalidating state

      isRevalidationRequired = true;
      updateState({
        revalidation: "loading"
      }); // If we're currently submitting an action, we don't need to start a new
      // transition, we'll just let the follow up loader execution call all loaders

      if (transitionState === "submitting" && type === "actionSubmission") {
        return;
      } // If we're currently in an idle state, start a new navigation for the current
      // action/location and mark it as uninterrupted, which will skip the history
      // update in completeNavigation


      if (state.transition.state === "idle") {
        return await startNavigation(state.historyAction, state.location, {
          startUninterruptedRevalidation: true
        });
      } // Otherwise, if we're currently in a loading state, just start a new
      // navigation to the transition.location but do not trigger an uninterrupted
      // revalidation so that history correctly updates once the navigation completes


      return await startNavigation(pendingAction || state.historyAction, state.transition.location, {
        overrideTransition: state.transition
      });
    } // Start a navigation to the given action/location.  Can optionally provide a
    // overrideTransition which will override the normalLoad in the case of a redirect
    // navigation


    async function startNavigation(historyAction, location, opts) {
      var _pendingNavigationCon;

      // Abort any in-progress navigations and start a new one
      (_pendingNavigationCon = pendingNavigationController) == null ? void 0 : _pendingNavigationCon.abort();
      pendingAction = historyAction; // Unset any ongoing uninterrupted revalidations (unless told otherwise),
      // since we want this new navigation to update history normally

      isUninterruptedRevalidation = (opts == null ? void 0 : opts.startUninterruptedRevalidation) === true;
      let loadingTransition = opts == null ? void 0 : opts.overrideTransition;
      let matches = matchRoutes(dataRoutes, location); // Short circuit with a 404 on the root error boundary if we match nothing

      if (!matches) {
        completeNavigation(historyAction, location, {
          matches: getNotFoundMatches(dataRoutes),
          errors: {
            [dataRoutes[0].id]: new Response(null, {
              status: 404
            })
          }
        });
        return;
      } // Short circuit if it's only a hash change


      if (isHashChangeOnly(state.location, location)) {
        completeNavigation(historyAction, location, {
          matches
        });
        return;
      } // Call action if we received an action submission


      let pendingActionData = null;
      let pendingActionError = null;

      if (opts != null && opts.submission && isActionSubmission(opts.submission)) {
        let actionOutput = await handleAction(historyAction, location, opts.submission, matches);

        if (actionOutput.shortCircuited) {
          return;
        }

        pendingActionData = actionOutput.pendingActionData || null;
        pendingActionError = actionOutput.pendingActionError || null;
        loadingTransition = _extends({
          state: "loading",
          type: "actionReload",
          location
        }, opts.submission);
      } // Call loaders


      let {
        shortCircuited,
        loaderData,
        errors
      } = await handleLoaders(historyAction, location, opts == null ? void 0 : opts.submission, matches, loadingTransition, pendingActionData, pendingActionError);

      if (shortCircuited) {
        return;
      }

      completeNavigation(historyAction, location, {
        matches,
        loaderData,
        errors
      });
    }

    async function handleAction(historyAction, location, submission, matches) {
      isRevalidationRequired = true;

      if (matches[matches.length - 1].route.index && !hasNakedIndexQuery(location.search)) {
        // Note: OK to mutate this in-place since it's a scoped var inside
        // handleAction and mutation will not impact the startNavigation matches
        // variable that we use for revalidation
        matches = matches.slice(0, -1);
      } // Put us in a submitting state


      let {
        formMethod,
        formAction,
        formEncType,
        formData
      } = submission;
      let transition = {
        state: "submitting",
        type: "actionSubmission",
        location,
        formMethod,
        formAction,
        formEncType,
        formData
      };
      updateState({
        transition
      }); // Call our action and get the result

      let result;
      let actionMatch = matches.slice(-1)[0];

      if (!actionMatch.route.action) {
        {
          console.warn("You're trying to submit to a route that does not have an action.  To " + "fix this, please add an `action` function to the route for " + ("[" + createHref(location) + "]"));
        }

        result = {
          type: ResultType.error,
          error: new Response(null, {
            status: 405
          })
        };
      } else {
        // Create a controller for this data load
        let actionAbortController = new AbortController();
        pendingNavigationController = actionAbortController;
        result = await callLoaderOrAction(actionMatch, location, actionAbortController.signal, submission);

        if (actionAbortController.signal.aborted) {
          return {
            shortCircuited: true
          };
        } // Clean up now that the loaders have completed.  We do do not clean up if
        // we short circuited because pendingNavigationController will have already
        // been assigned to a new controller for the next navigation


        pendingNavigationController = null;
      } // If the action threw a redirect Response, start a new REPLACE navigation


      if (isRedirectResult(result)) {
        let redirectTransition = _extends({
          state: "loading",
          type: "submissionRedirect",
          location: createLocation(state.location, result.location)
        }, submission);

        await startRedirectNavigation(result, redirectTransition);
        return {
          shortCircuited: true
        };
      }

      if (isErrorResult(result)) {
        // Store off the pending error - we use it to determine which loaders
        // to call and will commit it when we complete the navigation
        let boundaryMatch = findNearestBoundary(matches, actionMatch.route.id);
        return {
          pendingActionError: {
            [boundaryMatch.route.id]: result.error
          }
        };
      }

      return {
        pendingActionData: {
          [actionMatch.route.id]: result.data
        }
      };
    }

    async function handleLoaders(historyAction, location, submission, matches, overrideTransition, pendingActionData, pendingActionError) {
      // Figure out the right transition we want to use for data loading
      let loadingTransition;

      if (overrideTransition) {
        loadingTransition = overrideTransition;
      } else if ((submission == null ? void 0 : submission.formMethod) === "get") {
        loadingTransition = _extends({
          state: "submitting",
          type: "loaderSubmission",
          location
        }, submission);
      } else {
        loadingTransition = {
          state: "loading",
          type: "normalLoad",
          location,
          formMethod: undefined,
          formAction: undefined,
          formEncType: undefined,
          formData: undefined
        };
      }

      let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(state, matches, // Pass the current transition if this is an uninterrupted revalidation,
      // since we aren't actually "navigating".  Otherwise pass the transition
      // we're about to commit
      isUninterruptedRevalidation ? state.transition : loadingTransition, location, isRevalidationRequired, pendingActionData, pendingActionError, fetchLoadMatches); // Short circuit if we have no loaders to run

      if (matchesToLoad.length === 0 && revalidatingFetchers.length === 0) {
        completeNavigation(historyAction, location, {
          matches,
          // Commit pending action error if we're short circuiting
          errors: pendingActionError || null,
          actionData: pendingActionData || null
        });
        return {
          shortCircuited: true
        };
      } // If this is an uninterrupted revalidation, remain in our current idle state.
      // Otherwise, transition to our loading state and load data, preserving any
      // new action data or existing action data (in the case of a revalidation
      // interrupting an actionReload)


      if (!isUninterruptedRevalidation) {
        revalidatingFetchers.forEach(_ref2 => {
          var _state$fetchers$get;

          let [key] = _ref2;
          let revalidatingFetcher = {
            state: "loading",
            type: "revalidate",
            data: (_state$fetchers$get = state.fetchers.get(key)) == null ? void 0 : _state$fetchers$get.data,
            formMethod: undefined,
            formAction: undefined,
            formEncType: undefined,
            formData: undefined
          };
          state.fetchers.set(key, revalidatingFetcher);
        });
        updateState(_extends({
          transition: loadingTransition,
          actionData: pendingActionData || state.actionData || null
        }, revalidatingFetchers.length > 0 ? {
          fetchers: new Map(state.fetchers)
        } : {}));
      } // Start the data load


      let abortController = new AbortController();
      pendingNavigationController = abortController;
      pendingNavigationLoadId = ++incrementingLoadId;
      revalidatingFetchers.forEach(_ref3 => {
        let [key] = _ref3;
        return fetchControllers.set(key, abortController);
      }); // Call all navigation loaders and revalidating fetcher loaders in parallel,
      // then slice off the results into separate arrays so we can handle them
      // accordingly

      let results = await Promise.all([...matchesToLoad.map(m => callLoaderOrAction(m, location, abortController.signal)), ...revalidatingFetchers.map(_ref4 => {
        let [, href, match] = _ref4;
        return callLoaderOrAction(match, href, abortController.signal);
      })]);
      let navigationResults = results.slice(0, matchesToLoad.length);
      let fetcherResults = results.slice(matchesToLoad.length);

      if (abortController.signal.aborted) {
        return {
          shortCircuited: true
        };
      } // Clean up now that the loaders have completed.  We do do not clean up if
      // we short circuited because pendingNavigationController will have already
      // been assigned to a new controller for the next navigation


      pendingNavigationController = null;
      revalidatingFetchers.forEach(key => fetchControllers.delete(key)); // If any loaders returned a redirect Response, start a new REPLACE navigation

      let redirect = findRedirect(results);

      if (redirect) {
        let redirectTransition = getLoaderRedirect(state, redirect);
        await startRedirectNavigation(redirect, redirectTransition);
        return {
          shortCircuited: true
        };
      } // Process and commit output from loaders


      let {
        loaderData,
        errors
      } = processLoaderData(state, matches, matchesToLoad, navigationResults, pendingActionError, revalidatingFetchers, fetcherResults);
      markFetchRedirectsDone();
      let didAbortFetchLoads = abortStaleFetchLoads(pendingNavigationLoadId);
      return _extends({
        loaderData,
        errors
      }, didAbortFetchLoads || revalidatingFetchers.length > 0 ? {
        fetchers: new Map(state.fetchers)
      } : {});
    }

    function getFetcher(key) {
      return state.fetchers.get(key) || IDLE_FETCHER;
    }

    async function fetch(key, href, opts) {
      if (typeof AbortController === "undefined") {
        throw new Error("router.fetch() was called during the server render, but it shouldn't be. " + "You are likely calling a useFetcher() method in the body of your component. " + "Try moving it to a useEffect or a callback.");
      }

      let matches = matchRoutes(dataRoutes, href);
      !matches ?  invariant(false, "No matches found for fetch url: " + href)  : void 0;
      if (fetchControllers.has(key)) abortFetcher(key);
      let match = matches[matches.length - 1].route.index && !hasNakedIndexQuery(parsePath(href).search || "") ? matches.slice(-2)[0] : matches.slice(-1)[0];

      if (isSubmissionNavigation(opts)) {
        let submission = {
          formMethod: opts.formMethod || "get",
          formAction: href,
          formEncType: opts.formEncType || "application/x-www-form-urlencoded",
          formData: opts.formData
        };

        if (isActionSubmission(submission)) {
          await handleFetcherAction(key, href, match, submission);
        } else {
          var _state$fetchers$get2;

          let loadingFetcher = _extends({
            state: "submitting",
            type: "loaderSubmission"
          }, submission, {
            data: ((_state$fetchers$get2 = state.fetchers.get(key)) == null ? void 0 : _state$fetchers$get2.data) || undefined
          });

          await handleFetcherLoader(key, href, match, loadingFetcher);
        }
      } else {
        var _state$fetchers$get3;

        let loadingFetcher = {
          state: "loading",
          type: "normalLoad",
          formMethod: undefined,
          formAction: undefined,
          formEncType: undefined,
          formData: undefined,
          data: ((_state$fetchers$get3 = state.fetchers.get(key)) == null ? void 0 : _state$fetchers$get3.data) || undefined
        };
        await handleFetcherLoader(key, href, match, loadingFetcher);
      }
    }

    async function handleFetcherAction(key, href, match, submission) {
      var _state$fetchers$get4;

      isRevalidationRequired = true;
      fetchLoadMatches.delete(key); // Put this fetcher into it's submitting state

      let fetcher = _extends({
        state: "submitting",
        type: "actionSubmission"
      }, submission, {
        data: ((_state$fetchers$get4 = state.fetchers.get(key)) == null ? void 0 : _state$fetchers$get4.data) || undefined
      });

      state.fetchers.set(key, fetcher);
      updateState({
        fetchers: new Map(state.fetchers)
      }); // Call the action for the fetcher

      let abortController = new AbortController();
      fetchControllers.set(key, abortController);
      let actionResult = await callLoaderOrAction(match, href, abortController.signal, submission);

      if (abortController.signal.aborted) {
        return;
      }

      if (isRedirectResult(actionResult)) {
        fetchRedirectIds.add(key);

        let loadingFetcher = _extends({
          state: "loading",
          type: "submissionRedirect"
        }, submission, {
          data: undefined
        });

        state.fetchers.set(key, loadingFetcher);
        updateState({
          fetchers: new Map(state.fetchers)
        });

        let redirectTransition = _extends({
          state: "loading",
          type: "submissionRedirect",
          location: createLocation(state.location, actionResult.location)
        }, submission);

        await startRedirectNavigation(actionResult, redirectTransition);
        return;
      } // Process any non-redirect errors thrown


      if (isErrorResult(actionResult)) {
        let boundaryMatch = findNearestBoundary(state.matches, match.route.id);
        state.fetchers.delete(key);
        updateState({
          fetchers: new Map(state.fetchers),
          errors: {
            [boundaryMatch.route.id]: actionResult.error
          }
        });
        return;
      } // Start the data load for current matches, or the next location if we're
      // in the middle of a navigation


      let nextLocation = state.transition.location || state.location;
      let matches = state.transition.type !== "idle" ? matchRoutes(dataRoutes, state.transition.location) : state.matches;
      !matches ?  invariant(false, "Didn't find any matches after fetcher action")  : void 0;
      let loadId = ++incrementingLoadId;
      fetchReloadIds.set(key, loadId);

      let loadFetcher = _extends({
        state: "loading",
        type: "actionReload",
        data: actionResult.data
      }, submission);

      state.fetchers.set(key, loadFetcher);
      let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(state, matches, state.transition, nextLocation, isRevalidationRequired, null, null, fetchLoadMatches); // Put all revalidating fetchers into the revalidating state, except for the
      // current fetcher which we want to keep in the actionReload state

      revalidatingFetchers.filter(_ref5 => {
        let [staleKey] = _ref5;
        return staleKey !== key;
      }).forEach(_ref6 => {
        var _state$fetchers$get5;

        let [staleKey] = _ref6;
        let revalidatingFetcher = {
          state: "loading",
          type: "revalidate",
          data: (_state$fetchers$get5 = state.fetchers.get(key)) == null ? void 0 : _state$fetchers$get5.data,
          formMethod: undefined,
          formAction: undefined,
          formEncType: undefined,
          formData: undefined
        };
        state.fetchers.set(staleKey, revalidatingFetcher);
        fetchControllers.set(staleKey, abortController);
      });
      updateState({
        fetchers: new Map(state.fetchers)
      }); // Call all navigation loaders and revalidating fetcher loaders in parallel,
      // then slice off the results into separate arrays so we can handle them
      // accordingly

      let results = await Promise.all([...matchesToLoad.map(m => callLoaderOrAction(m, nextLocation, abortController.signal)), ...revalidatingFetchers.map(_ref7 => {
        let [, href, match] = _ref7;
        return callLoaderOrAction(match, href, abortController.signal);
      })]);
      let loaderResults = results.slice(0, matchesToLoad.length);
      let fetcherResults = results.slice(matchesToLoad.length);

      if (abortController.signal.aborted) {
        return;
      }

      fetchReloadIds.delete(key);
      fetchControllers.delete(key);
      revalidatingFetchers.forEach(staleKey => fetchControllers.delete(staleKey));
      let loaderRedirect = findRedirect(loaderResults);

      if (loaderRedirect) {
        let redirectTransition = getLoaderRedirect(state, loaderRedirect);
        await startRedirectNavigation(loaderRedirect, redirectTransition);
        return;
      } // Process and commit output from loaders


      let {
        loaderData,
        errors
      } = processLoaderData(state, state.matches, matchesToLoad, loaderResults, null, revalidatingFetchers, fetcherResults);
      let doneFetcher = {
        state: "idle",
        type: "done",
        data: actionResult.data,
        formMethod: undefined,
        formAction: undefined,
        formEncType: undefined,
        formData: undefined
      };
      state.fetchers.set(key, doneFetcher);
      let didAbortFetchLoads = abortStaleFetchLoads(loadId); // If we are currently in a navigation loading state and this fetcher is
      // more recent than the navigation, we want the newer data so abort the
      // navigation and complete it with the fetcher data

      if (state.transition.state === "loading" && loadId > pendingNavigationLoadId) {
        var _pendingNavigationCon2;

        !pendingAction ?  invariant(false, "Expected pending action")  : void 0;
        (_pendingNavigationCon2 = pendingNavigationController) == null ? void 0 : _pendingNavigationCon2.abort();
        completeNavigation(pendingAction, state.transition.location, {
          matches,
          loaderData,
          errors,
          fetchers: new Map(state.fetchers)
        });
      } else {
        // otherwise just update with the fetcher data
        updateState(_extends({
          errors,
          loaderData
        }, didAbortFetchLoads ? {
          fetchers: new Map(state.fetchers)
        } : {}));
        isRevalidationRequired = false;
      }
    }

    async function handleFetcherLoader(key, href, match, loadingFetcher) {
      // Put this fetcher into it's loading state
      state.fetchers.set(key, loadingFetcher);
      updateState({
        fetchers: new Map(state.fetchers)
      }); // Store off the match so we can call it's shouldRevalidate

      fetchLoadMatches.set(key, [href, match]); // Call the loader for this fetcher route match

      let abortController = new AbortController();
      fetchControllers.set(key, abortController);
      let result = await callLoaderOrAction(match, href, abortController.signal);
      if (abortController.signal.aborted) return;
      fetchControllers.delete(key); // If the loader threw a redirect Response, start a new REPLACE navigation

      if (isRedirectResult(result)) {
        let redirectTransition = getLoaderRedirect(state, result);
        await startRedirectNavigation(result, redirectTransition);
        return;
      } // Process any non-redirect errors thrown


      if (isErrorResult(result)) {
        let boundaryMatch = findNearestBoundary(state.matches, match.route.id);
        state.fetchers.delete(key); // TODO: In remix, this would reset to IDLE_TRANSITION if it was a catch -
        // do we need to behave any differently with our non-redirect errors?
        // What if it was a non-redirect Response?

        updateState({
          fetchers: new Map(state.fetchers),
          errors: {
            [boundaryMatch.route.id]: result.error
          }
        });
        return;
      } // Mark the fetcher as done


      let doneFetcher = {
        state: "idle",
        type: "done",
        data: result.data,
        formMethod: undefined,
        formAction: undefined,
        formEncType: undefined,
        formData: undefined
      };
      state.fetchers.set(key, doneFetcher);
      updateState({
        fetchers: new Map(state.fetchers)
      });
    }

    async function startRedirectNavigation(redirect, transition) {
      if (redirect.revalidate) {
        isRevalidationRequired = true;
      }

      !transition.location ?  invariant(false, "Expected a location on the redirect transition")  : void 0;
      await startNavigation(exports.Action.Replace, transition.location, {
        overrideTransition: transition
      });
    }

    function deleteFetcher(key) {
      if (fetchControllers.has(key)) abortFetcher(key);
      fetchLoadMatches.delete(key);
      fetchReloadIds.delete(key);
      fetchRedirectIds.delete(key);
      state.fetchers.delete(key);
    }

    function abortFetcher(key) {
      let controller = fetchControllers.get(key);
      !controller ?  invariant(false, "Expected fetch controller: " + key)  : void 0;
      controller.abort();
      fetchControllers.delete(key);
    }

    function markFetchersDone(keys) {
      for (let key of keys) {
        let fetcher = getFetcher(key);
        let doneFetcher = {
          state: "idle",
          type: "done",
          data: fetcher.data,
          formMethod: undefined,
          formAction: undefined,
          formEncType: undefined,
          formData: undefined
        };
        state.fetchers.set(key, doneFetcher);
      }
    }

    function markFetchRedirectsDone() {
      let doneKeys = [];

      for (let key of fetchRedirectIds) {
        let fetcher = state.fetchers.get(key);
        !fetcher ?  invariant(false, "Expected fetcher: " + key)  : void 0;

        if (fetcher.type === "submissionRedirect") {
          fetchRedirectIds.delete(key);
          doneKeys.push(key);
        }
      }

      markFetchersDone(doneKeys);
    }

    function abortStaleFetchLoads(landedId) {
      let yeetedKeys = [];

      for (let [key, id] of fetchReloadIds) {
        if (id < landedId) {
          let fetcher = state.fetchers.get(key);
          !fetcher ?  invariant(false, "Expected fetcher: " + key)  : void 0;

          if (fetcher.state === "loading") {
            abortFetcher(key);
            fetchReloadIds.delete(key);
            yeetedKeys.push(key);
          }
        }
      }

      markFetchersDone(yeetedKeys);
      return yeetedKeys.length > 0;
    }

    let router = {
      get state() {
        return state;
      },

      subscribe(fn) {
        if (subscriber) {
          throw new Error("A router only accepts one active subscriber");
        }

        subscriber = fn;
        return () => {
          subscriber = null;
        };
      },

      cleanup() {
        var _pendingNavigationCon3;

        subscriber = null;
        (_pendingNavigationCon3 = pendingNavigationController) == null ? void 0 : _pendingNavigationCon3.abort();

        for (let [, controller] of fetchControllers) {
          controller.abort();
        }
      },

      navigate,
      fetch,
      revalidate,
      createHref,
      getFetcher,
      deleteFetcher,
      _internalFetchControllers: fetchControllers
    };
    return router;
  } //#endregion
  ////////////////////////////////////////////////////////////////////////////////
  //#region Helpers
  ////////////////////////////////////////////////////////////////////////////////

  function convertRoutesToDataRoutes(routes, parentPath, allIds) {
    if (parentPath === void 0) {
      parentPath = [];
    }

    if (allIds === void 0) {
      allIds = new Set();
    }

    return routes.map((route, index) => {
      let treePath = [...parentPath, index];
      let id = typeof route.id === "string" ? route.id : treePath.join("-");
      !!allIds.has(id) ?  invariant(false, "Found a route id collision on id \"" + id + "\".  Route " + "id's must be globally unique within Data Router usages")  : void 0;
      allIds.add(id);

      let dataRoute = _extends({}, route, {
        id,
        children: route.children ? convertRoutesToDataRoutes(route.children, treePath, allIds) : undefined
      });

      return dataRoute;
    });
  }

  function getLoaderRedirect(state, redirect) {
    let redirectLocation = createLocation(state.location, redirect.location);

    if (state.transition.type === "loaderSubmission" || state.transition.type === "actionReload") {
      let {
        formMethod,
        formAction,
        formEncType,
        formData
      } = state.transition;
      let transition = {
        state: "loading",
        type: "submissionRedirect",
        location: redirectLocation,
        formMethod,
        formAction,
        formEncType,
        formData
      };
      return transition;
    } else {
      let transition = {
        state: "loading",
        type: "normalRedirect",
        location: redirectLocation,
        formMethod: undefined,
        formAction: undefined,
        formEncType: undefined,
        formData: undefined
      };
      return transition;
    }
  }

  function getMatchesToLoad(state, matches, transition, location, isRevalidationRequired, pendingActionData, pendingActionError, revalidatingFetcherMatches) {
    // Determine which routes to run loaders for, filter out all routes below
    // any caught action error as they aren't going to render so we don't
    // need to load them
    let deepestRenderableMatchIndex = pendingActionError ? matches.findIndex(m => m.route.id === Object.keys(pendingActionError)[0]) : matches.length;
    let actionResult = pendingActionError ? Object.values(pendingActionError)[0] : pendingActionData ? Object.values(pendingActionData)[0] : null; // Pick navigation matches that are net-new or qualify for revalidation

    let navigationMatches = matches.filter((match, index) => {
      if (!match.route.loader || index >= deepestRenderableMatchIndex) {
        return false;
      }

      return isNewLoader(state.loaderData, state.matches[index], match) || shouldRevalidateLoader(state.location, state.matches[index], transition, location, match, isRevalidationRequired, actionResult);
    }); // If revalidation is required, pick fetchers that qualify

    let revalidatingFetchers = [];

    if (isRevalidationRequired) {
      for (let entry of revalidatingFetcherMatches.entries()) {
        let [key, [href, match]] = entry;
        let shouldRevalidate = shouldRevalidateLoader(href, match, transition, href, match, isRevalidationRequired, actionResult);

        if (shouldRevalidate) {
          revalidatingFetchers.push([key, href, match]);
        }
      }
    }

    return [navigationMatches, revalidatingFetchers];
  }

  function isNewLoader(currentLoaderData, currentMatch, match) {
    let isNew = // [a] -> [a, b]
    !currentMatch || // [a, b] -> [a, c]
    match.route.id !== currentMatch.route.id; // Handle the case that we don't have data for a re-used route, potentially
    // from a prior error

    let isMissingData = currentLoaderData[match.route.id] === undefined; // Always load if this is a net-new route or we don't yet have data

    return isNew || isMissingData;
  }

  function shouldRevalidateLoader(currentLocation, currentMatch, transition, location, match, isRevalidationRequired, actionResult) {
    var _currentMatch$route$p;

    let currentUrl = createURL(currentLocation);
    let currentParams = currentMatch.params;
    let nextUrl = createURL(location);
    let nextParams = match.params; // This is the default implementation as to when we revalidate.  If the route
    // provides it's own implementation, then we give them full control but
    // provide this value so they can leverage it if needed after they check
    // their own specific use cases
    // Note that fetchers always provide the same current/next locations so the
    // URL-based checks here don't apply to fetcher shouldRevalidate calls

    let defaultShouldRevalidate = // param change for this match, /users/123 -> /users/456
    currentMatch.pathname !== match.pathname || // splat param changed, which is not present in match.path
    // e.g. /files/images/avatar.jpg -> files/finances.xls
    ((_currentMatch$route$p = currentMatch.route.path) == null ? void 0 : _currentMatch$route$p.endsWith("*")) && currentMatch.params["*"] !== match.params["*"] || // Clicked the same link, resubmitted a GET form
    currentUrl.toString() === nextUrl.toString() || // Search params affect all loaders
    currentUrl.search !== nextUrl.search || // Forced revalidation due to submission, useRevalidate, or X-Remix-Revalidate
    isRevalidationRequired;

    if (match.route.shouldRevalidate) {
      return match.route.shouldRevalidate({
        currentUrl,
        currentParams,
        nextUrl,
        nextParams,
        transition,
        actionResult,
        defaultShouldRevalidate
      });
    }

    return defaultShouldRevalidate;
  }

  async function callLoaderOrAction(match, location, signal, actionSubmission) {
    let resultType = ResultType.data;
    let result;

    try {
      let type = actionSubmission ? "action" : "loader";
      let handler = match.route[type];
      !handler ? "development" !== "production" ? invariant(false, "Could not find the " + type + " to run on the \"" + match.route.id + "\" route") : invariant(false) : void 0;
      result = await handler({
        params: match.params,
        request: createRequest(location, actionSubmission),
        signal
      });
    } catch (e) {
      resultType = ResultType.error;
      result = e;
    }

    if (result instanceof Response) {
      // Process redirects
      let status = result.status;
      let location = result.headers.get("Location");

      if (status >= 300 && status <= 399 && location != null) {
        return {
          type: ResultType.redirect,
          status,
          location,
          revalidate: result.headers.get("X-Remix-Revalidate") !== null
        };
      } // Automatically unwrap non-redirect success responses


      if (resultType === ResultType.data) {
        let contentType = result.headers.get("Content-Type");

        if (contentType != null && contentType.startsWith("application/json")) {
          result = await result.json();
        } else {
          result = await result.text();
        }
      }
    }

    if (resultType === ResultType.error) {
      return {
        type: resultType,
        error: result
      };
    }

    return {
      type: resultType,
      data: result
    };
  }

  function createRequest(location, actionSubmission) {
    let init = undefined;

    if (actionSubmission) {
      let {
        formMethod,
        formEncType,
        formData
      } = actionSubmission;
      let body = formData; // If we're submitting application/x-www-form-urlencoded, then body should
      // be of type URLSearchParams

      if (formEncType === "application/x-www-form-urlencoded") {
        body = new URLSearchParams();

        for (let [key, value] of formData.entries()) {
          !(typeof value === "string") ?  invariant(false, 'File inputs are not supported with encType "application/x-www-form-urlencoded", ' + 'please use "multipart/form-data" instead.')  : void 0;
          body.append(key, value);
        }
      }

      init = {
        method: formMethod.toUpperCase(),
        headers: {
          "Content-Type": formEncType
        },
        body
      };
    }

    let url = createURL(location).toString();
    return new Request(url, init);
  }

  function processLoaderData(state, matches, matchesToLoad, results, pendingActionError, revalidatingFetchers, fetcherResults) {
    // Fill in loaderData/errors from our loaders
    let loaderData = {};
    let errors = null; // Process loader results into state.loaderData/state.errors

    results.forEach((result, index) => {
      let id = matchesToLoad[index].route.id;
      !!isRedirectResult(result) ?  invariant(false, "Cannot handle redirect results in processLoaderData")  : void 0;

      if (isErrorResult(result)) {
        // Look upwards from the matched route for the closest ancestor
        // errorElement, defaulting to the root match
        let boundaryMatch = findNearestBoundary(matches, id);
        let error = result.error; // If we have a pending action error, we report it at the highest-route
        // that throws a loader error, and then clear it out to indicate that
        // it was consumed

        if (pendingActionError) {
          error = Object.values(pendingActionError)[0];
          pendingActionError = null;
        }

        errors = Object.assign(errors || {}, {
          [boundaryMatch.route.id]: error
        });
      } else {
        loaderData[id] = result.data;
      }
    }); // If we didn't consume the pending action error (i.e., all loaders
    // resolved), then consume it here

    if (pendingActionError) {
      errors = pendingActionError;
    } // Process results from our revalidating fetchers


    revalidatingFetchers.forEach((_ref8, index) => {
      let [key, href, match] = _ref8;
      let result = fetcherResults[index]; // Process fetcher non-redirect errors

      if (isErrorResult(result)) {
        var _errors;

        let boundaryMatch = findNearestBoundary(state.matches, match.route.id);

        if (!((_errors = errors) != null && _errors[boundaryMatch.route.id])) {
          errors = _extends({}, errors, {
            [boundaryMatch.route.id]: result.error
          });
        }

        state.fetchers.delete(key);
      } else if (isRedirectResult(result)) {
        // Should never get here, redirects should get processed above, but we
        // keep this to type narrow to a success result in the else
          invariant(false, "Unhandled fetcher revalidation redirect")  ;
      } else {
        let doneFetcher = {
          state: "idle",
          type: "done",
          data: result.data,
          formMethod: undefined,
          formAction: undefined,
          formEncType: undefined,
          formData: undefined
        };
        state.fetchers.set(key, doneFetcher);
      }
    });
    return {
      loaderData,
      errors
    };
  }

  function mergeLoaderData(state, newState) {
    // Identify active routes that have current loaderData and didn't receive new
    // loaderData
    let reusedRoutesWithData = (newState.matches || state.matches).filter(match => {
      var _newState$loaderData;

      return state.loaderData[match.route.id] !== undefined && ((_newState$loaderData = newState.loaderData) == null ? void 0 : _newState$loaderData[match.route.id]) === undefined;
    });
    return _extends({}, newState.loaderData, reusedRoutesWithData.reduce((acc, match) => Object.assign(acc, {
      [match.route.id]: state.loaderData[match.route.id]
    }), {}));
  } // Find the nearest error boundary, looking upwards from the matched route
  // for the closest ancestor errorElement, defaulting to the root match


  function findNearestBoundary(matches, routeId) {
    return matches.slice(0, matches.findIndex(m => m.route.id === routeId) + 1).reverse().find(m => m.route.errorElement) || matches[0];
  }

  function getNotFoundMatches(routes) {
    return [{
      params: {},
      pathname: "",
      pathnameBase: "",
      route: routes[0]
    }];
  } // Find any returned redirect errors, starting from the lowest match


  function findRedirect(results) {
    for (let i = results.length - 1; i >= 0; i--) {
      let result = results[i];

      if (isRedirectResult(result)) {
        return result;
      }
    }
  } // Create an href to represent a "server" URL without the hash


  function createHref(location) {
    return location.pathname + location.search;
  }

  function isHashChangeOnly(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash !== b.hash;
  }

  function isErrorResult(result) {
    return result.type === ResultType.error;
  }

  function isRedirectResult(result) {
    return (result == null ? void 0 : result.type) === ResultType.redirect;
  }

  function isSubmissionNavigation(opts) {
    return opts != null && "formData" in opts && opts.formData != null;
  }

  function isActionSubmission(submission) {
    return submission && submission.formMethod !== "get";
  }

  function hasNakedIndexQuery(search) {
    return new URLSearchParams(search).getAll("index").some(v => v === "");
  }

  function createURL(location) {
    let base = typeof window !== "undefined" && typeof window.location !== "undefined" ? window.location.origin : "unknown://unknown";
    let href = typeof location === "string" ? location : createHref(location);
    return new URL(href, base);
  } //#endregion

  const _excluded = ["initialEntries", "initialIndex"],
        _excluded2 = ["window"],
        _excluded3 = ["window"];

  function createMemoryRouter(_ref) {
    let {
      initialEntries,
      initialIndex
    } = _ref,
        routerInit = _objectWithoutPropertiesLoose(_ref, _excluded);

    let history = createMemoryHistory({
      initialEntries,
      initialIndex
    });
    return createRouter(_extends({
      history
    }, routerInit));
  }

  function createBrowserRouter(_ref2) {
    let {
      window
    } = _ref2,
        routerInit = _objectWithoutPropertiesLoose(_ref2, _excluded2);

    let history = createBrowserHistory({
      window
    });
    return createRouter(_extends({
      history
    }, routerInit));
  }

  function createHashRouter(_ref3) {
    let {
      window
    } = _ref3,
        routerInit = _objectWithoutPropertiesLoose(_ref3, _excluded3);

    let history = createHashHistory({
      window
    });
    return createRouter(_extends({
      history
    }, routerInit));
  } // @remix-run/router public Type API

  exports.IDLE_TRANSITION = IDLE_TRANSITION;
  exports.createBrowserHistory = createBrowserHistory;
  exports.createBrowserRouter = createBrowserRouter;
  exports.createHashHistory = createHashHistory;
  exports.createHashRouter = createHashRouter;
  exports.createMemoryHistory = createMemoryHistory;
  exports.createMemoryRouter = createMemoryRouter;
  exports.createPath = createPath;
  exports.createRouter = createRouter;
  exports.generatePath = generatePath;
  exports.getToPathname = getToPathname;
  exports.invariant = invariant;
  exports.joinPaths = joinPaths;
  exports.matchPath = matchPath;
  exports.matchRoutes = matchRoutes;
  exports.normalizeHash = normalizeHash;
  exports.normalizePathname = normalizePathname;
  exports.normalizeSearch = normalizeSearch;
  exports.parsePath = parsePath;
  exports.resolvePath = resolvePath;
  exports.resolveTo = resolveTo;
  exports.stripBasename = stripBasename;
  exports.warning = warning$1;
  exports.warningOnce = warningOnce;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=router.development.js.map
