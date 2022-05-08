/**
 * React Router v6.3.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
import { invariant, resolveTo, getToPathname, joinPaths, matchPath, warning, warningOnce, parsePath, matchRoutes, createMemoryRouter, createMemoryHistory, Action, normalizePathname, stripBasename } from '@remix-run/router';
export { Action as NavigationType, createPath, generatePath, matchPath, matchRoutes, parsePath, resolvePath } from '@remix-run/router';
import { createContext, useContext, useMemo, useRef, useEffect, useCallback, createElement, Fragment, Component, useState, useLayoutEffect, Children, isValidElement } from 'react';

// Contexts for data routers
const DataRouterContext = /*#__PURE__*/createContext(null);

{
  DataRouterContext.displayName = "DataRouter";
}

const DataRouterStateContext = /*#__PURE__*/createContext(null);

{
  DataRouterStateContext.displayName = "DataRouterState";
}
/**
 * A Navigator is a "location changer"; it's how you get to different locations.
 *
 * Every history instance conforms to the Navigator interface, but the
 * distinction is useful primarily when it comes to the low-level <Router> API
 * where both the location and a navigator must be provided separately in order
 * to avoid "tearing" that may occur in a suspense-enabled app if the action
 * and/or location were to be read directly from the history instance.
 */


const NavigationContext = /*#__PURE__*/createContext(null);

{
  NavigationContext.displayName = "Navigation";
}

const LocationContext = /*#__PURE__*/createContext(null);

{
  LocationContext.displayName = "Location";
}

const RouteContext = /*#__PURE__*/createContext({
  outlet: null,
  matches: []
});

{
  RouteContext.displayName = "Route";
}

const RouteErrorContext = /*#__PURE__*/createContext(null);

{
  RouteErrorContext.displayName = "RouteError";
}

/**
 * Returns the full href for the given "to" value. This is useful for building
 * custom links that are also accessible and preserve right-click behavior.
 *
 * @see https://reactrouter.com/docs/en/v6/api#usehref
 */

function useHref(to) {
  !useInRouterContext() ?  invariant(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  `useHref() may be used only in the context of a <Router> component.`)  : void 0;
  let {
    basename,
    navigator
  } = useContext(NavigationContext);
  let {
    hash,
    pathname,
    search
  } = useResolvedPath(to);
  let joinedPathname = pathname;

  if (basename !== "/") {
    let toPathname = getToPathname(to);
    let endsWithSlash = toPathname != null && toPathname.endsWith("/");
    joinedPathname = pathname === "/" ? basename + (endsWithSlash ? "/" : "") : joinPaths([basename, pathname]);
  }

  return navigator.createHref({
    pathname: joinedPathname,
    search,
    hash
  });
}
/**
 * Returns true if this component is a descendant of a <Router>.
 *
 * @see https://reactrouter.com/docs/en/v6/api#useinroutercontext
 */

function useInRouterContext() {
  return useContext(LocationContext) != null;
}
/**
 * Returns the current location object, which represents the current URL in web
 * browsers.
 *
 * Note: If you're using this it may mean you're doing some of your own
 * "routing" in your app, and we'd like to know what your use case is. We may
 * be able to provide something higher-level to better suit your needs.
 *
 * @see https://reactrouter.com/docs/en/v6/api#uselocation
 */

function useLocation() {
  !useInRouterContext() ?  invariant(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  `useLocation() may be used only in the context of a <Router> component.`)  : void 0;
  return useContext(LocationContext).location;
}
/**
 * Returns the current navigation action which describes how the router came to
 * the current location, either by a pop, push, or replace on the history stack.
 *
 * @see https://reactrouter.com/docs/en/v6/api#usenavigationtype
 */

function useNavigationType() {
  return useContext(LocationContext).navigationType;
}
/**
 * Returns true if the URL for the given "to" value matches the current URL.
 * This is useful for components that need to know "active" state, e.g.
 * <NavLink>.
 *
 * @see https://reactrouter.com/docs/en/v6/api#usematch
 */

function useMatch(pattern) {
  !useInRouterContext() ?  invariant(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  `useMatch() may be used only in the context of a <Router> component.`)  : void 0;
  let {
    pathname
  } = useLocation();
  return useMemo(() => matchPath(pattern, pathname), [pathname, pattern]);
}
/**
 * The interface for the navigate() function returned from useNavigate().
 */

/**
 * Returns an imperative method for changing the location. Used by <Link>s, but
 * may also be used by other elements to change the location.
 *
 * @see https://reactrouter.com/docs/en/v6/api#usenavigate
 */
function useNavigate() {
  !useInRouterContext() ?  invariant(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  `useNavigate() may be used only in the context of a <Router> component.`)  : void 0;
  let {
    basename,
    navigator
  } = useContext(NavigationContext);
  let {
    matches
  } = useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(matches.map(match => match.pathnameBase));
  let activeRef = useRef(false);
  useEffect(() => {
    activeRef.current = true;
  });
  let navigate = useCallback((to, options = {}) => {
     warning(activeRef.current, `You should call navigate() in a React.useEffect(), not when ` + `your component is first rendered.`) ;
    if (!activeRef.current) return;

    if (typeof to === "number") {
      navigator.go(to);
      return;
    }

    let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname);

    if (basename !== "/") {
      path.pathname = joinPaths([basename, path.pathname]);
    }

    (!!options.replace ? navigator.replace : navigator.push)(path, options.state);
  }, [basename, navigator, routePathnamesJson, locationPathname]);
  return navigate;
}
const OutletContext = /*#__PURE__*/createContext(null);
/**
 * Returns the context (if provided) for the child route at this level of the route
 * hierarchy.
 * @see https://reactrouter.com/docs/en/v6/api#useoutletcontext
 */

function useOutletContext() {
  return useContext(OutletContext);
}
/**
 * Returns the element for the child route at this level of the route
 * hierarchy. Used internally by <Outlet> to render child routes.
 *
 * @see https://reactrouter.com/docs/en/v6/api#useoutlet
 */

function useOutlet(context) {
  let outlet = useContext(RouteContext).outlet;

  if (outlet) {
    return /*#__PURE__*/createElement(OutletContext.Provider, {
      value: context
    }, outlet);
  }

  return outlet;
}
/**
 * Returns an object of key/value pairs of the dynamic params from the current
 * URL that were matched by the route path.
 *
 * @see https://reactrouter.com/docs/en/v6/api#useparams
 */

function useParams() {
  let {
    matches
  } = useContext(RouteContext);
  let routeMatch = matches[matches.length - 1];
  return routeMatch ? routeMatch.params : {};
}
/**
 * Resolves the pathname of the given `to` value against the current location.
 *
 * @see https://reactrouter.com/docs/en/v6/api#useresolvedpath
 */

function useResolvedPath(to) {
  let {
    matches
  } = useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(matches.map(match => match.pathnameBase));
  return useMemo(() => resolveTo(to, JSON.parse(routePathnamesJson), locationPathname), [to, routePathnamesJson, locationPathname]);
}
/**
 * Returns the element of the route that matched the current location, prepared
 * with the correct context to render the remainder of the route tree. Route
 * elements in the tree must render an <Outlet> to render their child route's
 * element.
 *
 * @see https://reactrouter.com/docs/en/v6/api#useroutes
 */

function useRoutes(routes, locationArg) {
  !useInRouterContext() ?  invariant(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  `useRoutes() may be used only in the context of a <Router> component.`)  : void 0;
  let dataRouterStateContext = useContext(DataRouterStateContext);
  let {
    matches: parentMatches
  } = useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;

  {
    // You won't get a warning about 2 different <Routes> under a <Route>
    // without a trailing *, but this is a best-effort warning anyway since we
    // cannot even give the warning unless they land at the parent route.
    //
    // Example:
    //
    // <Routes>
    //   {/* This route path MUST end with /* because otherwise
    //       it will never match /blog/post/123 */}
    //   <Route path="blog" element={<Blog />} />
    //   <Route path="blog/feed" element={<BlogFeed />} />
    // </Routes>
    //
    // function Blog() {
    //   return (
    //     <Routes>
    //       <Route path="post/:id" element={<Post />} />
    //     </Routes>
    //   );
    // }
    let parentPath = parentRoute && parentRoute.path || "";
    warningOnce(parentPathname, !parentRoute || parentPath.endsWith("*"), `You rendered descendant <Routes> (or called \`useRoutes()\`) at ` + `"${parentPathname}" (under <Route path="${parentPath}">) but the ` + `parent route path has no trailing "*". This means if you navigate ` + `deeper, the parent won't match anymore and therefore the child ` + `routes will never render.\n\n` + `Please change the parent <Route path="${parentPath}"> to <Route ` + `path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`);
  }

  let locationFromContext = useLocation();
  let location;

  if (locationArg) {
    let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    !(parentPathnameBase === "/" || parsedLocationArg.pathname?.startsWith(parentPathnameBase)) ?  invariant(false, `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, ` + `the location pathname must begin with the portion of the URL pathname that was ` + `matched by all parent routes. The current pathname base is "${parentPathnameBase}" ` + `but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`)  : void 0;
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }

  let pathname = location.pathname || "/";
  let remainingPathname = parentPathnameBase === "/" ? pathname : pathname.slice(parentPathnameBase.length) || "/";
  let matches = matchRoutes(routes, {
    pathname: remainingPathname
  });

  {
     warning(parentRoute || matches != null, `No routes matched location "${location.pathname}${location.search}${location.hash}" `) ;
     warning(matches == null || matches[matches.length - 1].route.element !== undefined, `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element. ` + `This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`) ;
  }

  return _renderMatches(matches && matches.map(match => Object.assign({}, match, {
    params: Object.assign({}, parentParams, match.params),
    pathname: joinPaths([parentPathnameBase, match.pathname]),
    pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([parentPathnameBase, match.pathnameBase])
  })), parentMatches, dataRouterStateContext);
}

function DefaultErrorElement() {
  let error = useRouteError();
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = {
    padding: "0.5rem",
    backgroundColor: lightgrey
  };
  let codeStyles = {
    padding: "2px 4px",
    backgroundColor: lightgrey
  };
  return /*#__PURE__*/createElement(Fragment, null, /*#__PURE__*/createElement("h2", null, "Unhandled Thrown Error!"), /*#__PURE__*/createElement("p", {
    style: {
      fontStyle: "italic"
    }
  }, error?.message || error), error?.stack ? /*#__PURE__*/createElement("pre", {
    style: preStyles
  }, error?.stack) : null, /*#__PURE__*/createElement("p", null, "\uD83D\uDCBF Hey developer \uD83D\uDC4B"), /*#__PURE__*/createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own\xA0", /*#__PURE__*/createElement("code", {
    style: codeStyles
  }, "errorElement"), " props on\xA0", /*#__PURE__*/createElement("code", {
    style: codeStyles
  }, "<Route>")));
}

class RenderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      error: props.error
    };
  }

  static getDerivedStateFromError(error) {
    return {
      error: error
    };
  }

  static getDerivedStateFromProps(props, state) {
    // When we get into an error state, the user will likely click "back" to the
    // previous page that didn't have an error. Because this wraps the entire
    // application, that will have no effect--the error page continues to display.
    // This gives us a mechanism to recover from the error when the location changes.
    //
    // Whether we're in an error state or not, we update the location in state
    // so that when we are in an error state, it gets reset when a new location
    // comes in and the user recovers from the error.
    if (state.location !== props.location) {
      return {
        error: props.error,
        location: props.location
      };
    } // If we're not changing locations, preserve the location but still surface
    // any new errors that may come through. We retain the existing error, we do
    // this because the error provided from the app state may be cleared without
    // the location changing.


    return {
      error: props.error || state.error,
      location: state.location
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Router caught the following error during render", error, errorInfo);
  }

  render() {
    return this.state.error ? /*#__PURE__*/createElement(RouteErrorContext.Provider, {
      value: this.state.error,
      children: this.props.component
    }) : this.props.children;
  }

}
function _renderMatches(matches, parentMatches = [], dataRouterState) {
  if (matches == null) return null;
  let renderedMatches = matches; // If we have data errors, trim matches to the highest error boundary

  let errors = dataRouterState?.errors;

  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(m => m.route.id && errors?.[m.route.id]);
    !(errorIndex >= 0) ?  invariant(false, `Could not find a matching route for the current errors: ${errors}`)  : void 0;
    renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
  }

  return renderedMatches.reduceRight((outlet, match, index) => {
    let error = match.route.id ? errors?.[match.route.id] : null; // Only data routers handle errors

    let errorElement = dataRouterState ? match.route.errorElement || /*#__PURE__*/createElement(DefaultErrorElement, null) : null;

    let getChildren = () => /*#__PURE__*/createElement(RouteContext.Provider, {
      children: error ? errorElement : match.route.element !== undefined ? match.route.element : outlet,
      value: {
        outlet,
        matches: parentMatches.concat(renderedMatches.slice(0, index + 1))
      }
    }); // Only wrap in an error boundary within data router usages when we have an
    // errorElement on this route.  Otherwise let it bubble up to an ancestor
    // errorElement


    return dataRouterState && (match.route.errorElement || index === 0) ? /*#__PURE__*/createElement(RenderErrorBoundary, {
      location: dataRouterState.location,
      component: errorElement,
      error: error,
      children: getChildren()
    }) : getChildren();
  }, null);
}
var DataRouterHook;

(function (DataRouterHook) {
  DataRouterHook["UseLoaderData"] = "useLoaderData";
  DataRouterHook["UseActionData"] = "useActionData";
  DataRouterHook["UseRouteError"] = "useRouteError";
  DataRouterHook["UseNavigation"] = "useNavigation";
  DataRouterHook["UseRouteLoaderData"] = "useRouteLoaderData";
  DataRouterHook["UseMatches"] = "useMatches";
  DataRouterHook["UseRevalidator"] = "useRevalidator";
})(DataRouterHook || (DataRouterHook = {}));

function useDataRouterState(hookName) {
  let state = useContext(DataRouterStateContext);
  !state ?  invariant(false, `${hookName} must be used within a DataRouter`)  : void 0;
  return state;
}

function useNavigation() {
  let state = useDataRouterState(DataRouterHook.UseNavigation);
  return state.transition;
}
function useRevalidator() {
  let router = useContext(DataRouterContext);
  !router ?  invariant(false, `useRevalidator must be used within a DataRouter`)  : void 0;
  let state = useDataRouterState(DataRouterHook.UseRevalidator);
  return {
    revalidate: router.revalidate,
    state: state.revalidation
  };
}
function useMatches() {
  let {
    matches,
    loaderData
  } = useDataRouterState(DataRouterHook.UseMatches);
  return useMemo(() => matches.map(match => {
    let {
      pathname,
      params
    } = match;
    return {
      id: match.route.id,
      pathname,
      params,
      data: loaderData[match.route.id]
    };
  }), [matches, loaderData]);
}
function useLoaderData() {
  let state = useDataRouterState(DataRouterHook.UseLoaderData);
  let route = useContext(RouteContext);
  !route ?  invariant(false, `useLoaderData must be used inside a RouteContext`)  : void 0;
  let thisRoute = route.matches[route.matches.length - 1];
  !thisRoute.route.id ?  invariant(false, `${useLoaderData} can only be used on routes that contain a unique "id"`)  : void 0;
  return state.loaderData?.[thisRoute.route.id];
}
function useRouteLoaderData(routeId) {
  let state = useDataRouterState(DataRouterHook.UseRouteLoaderData);
  return state.loaderData?.[routeId];
}
function useActionData() {
  let state = useDataRouterState(DataRouterHook.UseRouteError);
  let route = useContext(RouteContext);
  !route ?  invariant(false, `useRouteError must be used inside a RouteContext`)  : void 0;
  return Object.values(state?.actionData || {})[0];
}
function useRouteError() {
  let error = useContext(RouteErrorContext);
  let state = useDataRouterState(DataRouterHook.UseRouteError);
  let route = useContext(RouteContext);
  let thisRoute = route.matches[route.matches.length - 1]; // If this was a render error, we put it in a RouteError context inside
  // of RenderErrorBoundary

  if (error) {
    return error;
  }

  !route ?  invariant(false, `useRouteError must be used inside a RouteContext`)  : void 0;
  !thisRoute.route.id ?  invariant(false, `useRouteError can only be used on routes that contain a unique "id"`)  : void 0; // Otherwise look for errors from our data router state

  return state.errors?.[thisRoute.route.id];
}

function useRenderDataRouter({
  children,
  fallbackElement,
  // FIXME: Figure out if we want to use a direct prop or support useRoutes()
  todo_bikeshed_routes,
  createRouter
}) {
  let routes = todo_bikeshed_routes || createRoutesFromChildren(children);
  let [router] = useState(() => createRouter(routes)); // TODO: For React 18 we can move to useSyncExternalStore via feature detection
  // state = React.useSyncExternalStore(router.subscribe, () => router.state);

  let [state, setState] = useState(() => router.state);
  useEffect(() => {
    let unsubscribe = router.subscribe(newState => setState(newState)); // If we have loaders to run for an initial data load, and all of those loaders
    // are synchronous, then they'll actually trigger completeNavigation _before_
    // we get here, so we'll never call setState.  Capture that scenario here

    if (!state.initialized && router.state.initialized) {
      setState(router.state);
    }

    return () => {
      unsubscribe();
      router.cleanup();
    };
  }, [router, state.initialized]);
  let navigator = useMemo(() => {
    return {
      createHref: router.createHref,
      go: n => router.navigate(n),
      push: (to, state) => router.navigate(to, {
        state
      }),
      replace: (to, state) => router.navigate(to, {
        replace: true,
        state
      })
    };
  }, [router]);

  if (!state.initialized) {
    return fallbackElement || /*#__PURE__*/createElement(DefaultFallbackElement, null);
  }

  return /*#__PURE__*/createElement(DataRouterContext.Provider, {
    value: router
  }, /*#__PURE__*/createElement(DataRouterStateContext.Provider, {
    value: state
  }, /*#__PURE__*/createElement(Router, {
    location: state.location,
    navigationType: state.historyAction,
    navigator: navigator
  }, todo_bikeshed_routes ? /*#__PURE__*/createElement(DataRoutes, {
    routes: routes
  }) : /*#__PURE__*/createElement(Routes, {
    children: children
  }))));
}

function DefaultFallbackElement() {
  return /*#__PURE__*/createElement(Fragment, null, /*#__PURE__*/createElement("style", null, `
        :root {
          --size: 25vh;
        }

        .rr-fallback__flex {
          text-align: center;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;  
        }

        .rr-fallback__rotate {
          display: block;
          width: var(--size);
          height: var(--size);
          font-size: var(--size);
          animation-name: spin;
          animation-duration: 1s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          transform: rotate(0deg);
          transform-origin: 50% 50%;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion) {
          .rr-fallback__rotate {
            animation-iteration-count: 0;
          }
        }

        .rr-fallback__cd {
          width: var(--size);
          height: var(--size);
          line-height: var(--size);
          margin-top: 5%;
        }
      `), /*#__PURE__*/createElement("div", {
    className: "rr-fallback__flex"
  }, /*#__PURE__*/createElement("div", {
    className: "rr-fallback__rotate"
  }, /*#__PURE__*/createElement("p", {
    className: "rr-fallback__cd"
  }, "\uD83D\uDCBF"))));
}

function DataMemoryRouter({
  children,
  initialEntries,
  initialIndex,
  hydrationData,
  fallbackElement,
  todo_bikeshed_routes
}) {
  return useRenderDataRouter({
    children,
    fallbackElement,
    todo_bikeshed_routes,
    createRouter: routes => createMemoryRouter({
      initialEntries,
      initialIndex,
      routes,
      hydrationData
    })
  });
}

/**
 * A <Router> that stores all entries in memory.
 *
 * @see https://reactrouter.com/docs/en/v6/api#memoryrouter
 */
function MemoryRouter({
  basename,
  children,
  initialEntries,
  initialIndex
}) {
  let historyRef = useRef();

  if (historyRef.current == null) {
    historyRef.current = createMemoryHistory({
      initialEntries,
      initialIndex,
      v5Compat: true
    });
  }

  let history = historyRef.current;
  let [state, setState] = useState({
    action: history.action,
    location: history.location
  });
  useLayoutEffect(() => history.listen(setState), [history]);
  return /*#__PURE__*/createElement(Router, {
    basename: basename,
    children: children,
    location: state.location,
    navigationType: state.action,
    navigator: history
  });
}

/**
 * Changes the current location.
 *
 * Note: This API is mostly useful in React.Component subclasses that are not
 * able to use hooks. In functional components, we recommend you use the
 * `useNavigate` hook instead.
 *
 * @see https://reactrouter.com/docs/en/v6/api#navigate
 */
function Navigate({
  to,
  replace,
  state
}) {
  !useInRouterContext() ?  invariant(false, // TODO: This error is probably because they somehow have 2 versions of
  // the router loaded. We can help them understand how to avoid that.
  `<Navigate> may be used only in the context of a <Router> component.`)  : void 0;
   warning(!useContext(NavigationContext).static, `<Navigate> must not be used on the initial render in a <StaticRouter>. ` + `This is a no-op, but you should modify your code so the <Navigate> is ` + `only ever rendered in response to some user interaction or state change.`) ;
  let navigate = useNavigate();
  useEffect(() => {
    navigate(to, {
      replace,
      state
    });
  });
  return null;
}

/**
 * Renders the child route's element, if there is one.
 *
 * @see https://reactrouter.com/docs/en/v6/api#outlet
 */
function Outlet(props) {
  return useOutlet(props.context);
}

/**
 * Declares an element that should be rendered at a certain URL path.
 *
 * @see https://reactrouter.com/docs/en/v6/api#route
 */
function Route(_props) {
    invariant(false, `A <Route> is only ever to be used as the child of <Routes> element, ` + `never rendered directly. Please wrap your <Route> in a <Routes>.`)  ;
}

/**
 * Provides location context for the rest of the app.
 *
 * Note: You usually won't render a <Router> directly. Instead, you'll render a
 * router that is more specific to your environment such as a <BrowserRouter>
 * in web browsers or a <StaticRouter> for server rendering.
 *
 * @see https://reactrouter.com/docs/en/v6/api#router
 */
function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = Action.Pop,
  navigator,
  static: staticProp = false
}) {
  !!useInRouterContext() ?  invariant(false, `You cannot render a <Router> inside another <Router>.` + ` You should never have more than one in your app.`)  : void 0;
  let basename = normalizePathname(basenameProp);
  let navigationContext = useMemo(() => ({
    basename,
    navigator,
    static: staticProp
  }), [basename, navigator, staticProp]);

  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }

  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let location = useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);

    if (trailingPathname == null) {
      return null;
    }

    return {
      pathname: trailingPathname,
      search,
      hash,
      state,
      key
    };
  }, [basename, pathname, search, hash, state, key]);
   warning(location != null, `<Router basename="${basename}"> is not able to match the URL ` + `"${pathname}${search}${hash}" because it does not start with the ` + `basename, so the <Router> won't render anything.`) ;

  if (location == null) {
    return null;
  }

  return /*#__PURE__*/createElement(NavigationContext.Provider, {
    value: navigationContext
  }, /*#__PURE__*/createElement(LocationContext.Provider, {
    children: children,
    value: {
      location,
      navigationType
    }
  }));
}

/**
 * A container for a nested tree of <Route> elements that renders the branch
 * that best matches the current location.
 *
 * @see https://reactrouter.com/docs/en/v6/api#routes
 */
function Routes({
  children,
  location
}) {
  return useRoutes(createRoutesFromChildren(children), location);
}

// Internal wrapper to render routes provided to a DataRouter via props instead
// of children.  This is primarily to avoid re-calling createRoutesFromChildren
function DataRoutes({
  routes
}) {
  return useRoutes(routes);
} ///////////////////////////////////////////////////////////////////////////////
// UTILS
///////////////////////////////////////////////////////////////////////////////

/**
 * Creates a route config from a React "children" object, which is usually
 * either a `<Route>` element or an array of them. Used internally by
 * `<Routes>` to create a route config from its children.
 *
 * @see https://reactrouter.com/docs/en/v6/api#createroutesfromchildren
 */


function createRoutesFromChildren(children, parentPath = []) {
  let routes = [];
  Children.forEach(children, (element, index) => {
    if (! /*#__PURE__*/isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }

    if (element.type === Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push.apply(routes, createRoutesFromChildren(element.props.children, parentPath));
      return;
    }

    !(element.type === Route) ?  invariant(false, `[${typeof element.type === "string" ? element.type : element.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`)  : void 0;
    let treePath = [...parentPath, index];
    let route = {
      id: element.props.id || treePath.join("-"),
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      index: element.props.index,
      path: element.props.path,
      loader: element.props.loader,
      action: element.props.action,
      errorElement: element.props.errorElement,
      shouldRevalidate: element.props.shouldRevalidate
    };

    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children, treePath);
    }

    routes.push(route);
  });
  return routes;
}
/**
 * Renders the result of `matchRoutes()` into a React element.
 */

function renderMatches(matches, dataRouterState) {
  return _renderMatches(matches, undefined, dataRouterState);
}

export { DataMemoryRouter, MemoryRouter, Navigate, Outlet, Route, Router, Routes, DataRouterContext as UNSAFE_DataRouterContext, DataRouterStateContext as UNSAFE_DataRouterStateContext, LocationContext as UNSAFE_LocationContext, NavigationContext as UNSAFE_NavigationContext, RouteContext as UNSAFE_RouteContext, useRenderDataRouter as UNSAFE_useRenderDataRouter, createRoutesFromChildren, renderMatches, useActionData, useHref, useInRouterContext, useLoaderData, useLocation, useMatch, useMatches, useNavigate, useNavigation, useNavigationType, useOutlet, useOutletContext, useParams, useResolvedPath, useRevalidator, useRouteError, useRouteLoaderData, useRoutes };
//# sourceMappingURL=react-router.development.js.map
