/**
 * React Router DOM v6.3.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
import { useRef, useState, useLayoutEffect, createElement, forwardRef, useCallback, useEffect, useMemo, useContext } from 'react';
import { UNSAFE_useRenderDataRouter, Router, useHref, createPath, useLocation, useResolvedPath, useNavigate, UNSAFE_DataRouterContext, UNSAFE_RouteContext, UNSAFE_DataRouterStateContext } from 'react-router';
export { DataMemoryRouter, MemoryRouter, Navigate, NavigationType, Outlet, Route, Router, Routes, UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext, UNSAFE_LocationContext, UNSAFE_NavigationContext, UNSAFE_RouteContext, UNSAFE_useRenderDataRouter, createPath, createRoutesFromChildren, generatePath, matchPath, matchRoutes, parsePath, renderMatches, resolvePath, useActionData, useHref, useInRouterContext, useLoaderData, useLocation, useMatch, useMatches, useNavigate, useNavigation, useNavigationType, useOutlet, useOutletContext, useParams, useResolvedPath, useRevalidator, useRouteError, useRouteLoaderData, useRoutes } from 'react-router';
import { createBrowserRouter, createHashRouter, createBrowserHistory, createHashHistory, invariant } from '@remix-run/router';

const defaultMethod = "get";
const defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function shouldProcessLinkClick(event, target) {
  return event.button === 0 && ( // Ignore everything but left clicks
  !target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event) // Ignore clicks with modifier keys
  ;
}

/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 *   let searchParams = new URLSearchParams([
 *     ['sort', 'name'],
 *     ['sort', 'price']
 *   ]);
 *
 * you can do:
 *
 *   let searchParams = createSearchParams({
 *     sort: ['name', 'price']
 *   });
 */
function createSearchParams(init = "") {
  return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo, key) => {
    let value = init[key];
    return memo.concat(Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]);
  }, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);

  for (let key of defaultSearchParams.keys()) {
    if (!searchParams.has(key)) {
      defaultSearchParams.getAll(key).forEach(value => {
        searchParams.append(key, value);
      });
    }
  }

  return searchParams;
}
function getFormSubmissionInfo(target, defaultAction, options) {
  let method;
  let action;
  let encType;
  let formData;

  if (isFormElement(target)) {
    let submissionTrigger = options.submissionTrigger;
    method = options.method || target.getAttribute("method") || defaultMethod;
    action = options.action || target.getAttribute("action") || defaultAction;
    encType = options.encType || target.getAttribute("enctype") || defaultEncType;
    formData = new FormData(target);

    if (submissionTrigger && submissionTrigger.name) {
      formData.append(submissionTrigger.name, submissionTrigger.value);
    }
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;

    if (form == null) {
      throw new Error(`Cannot submit a <button> or <input type="submit"> without a <form>`);
    } // <button>/<input type="submit"> may override attributes of <form>


    method = options.method || target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    action = options.action || target.getAttribute("formaction") || form.getAttribute("action") || defaultAction;
    encType = options.encType || target.getAttribute("formenctype") || form.getAttribute("enctype") || defaultEncType;
    formData = new FormData(form); // Include name + value from a <button>

    if (target.name) {
      formData.set(target.name, target.value);
    }
  } else if (isHtmlElement(target)) {
    throw new Error(`Cannot submit element that is not <form>, <button>, or ` + `<input type="submit|image">`);
  } else {
    method = options.method || defaultMethod;
    action = options.action || defaultAction;
    encType = options.encType || defaultEncType;

    if (target instanceof FormData) {
      formData = target;
    } else {
      formData = new FormData();

      if (target instanceof URLSearchParams) {
        for (let [name, value] of target) {
          formData.append(name, value);
        }
      } else if (target != null) {
        for (let name of Object.keys(target)) {
          formData.append(name, target[name]);
        }
      }
    }
  }

  let {
    protocol,
    host
  } = window.location;
  let url = new URL(action, `${protocol}//${host}`);

  if (method.toLowerCase() === "get") {
    for (let [name, value] of formData) {
      if (typeof value === "string") {
        url.searchParams.append(name, value);
      } else {
        throw new Error(`Cannot submit binary form data using GET`);
      }
    }
  }

  return {
    url,
    method,
    encType,
    formData
  };
}

/**
 * NOTE: If you refactor this to split up the modules into separate files,
 * you'll need to update the rollup config for react-router-dom-v5-compat.
 */
////////////////////////////////////////////////////////////////////////////////
//#region Components
////////////////////////////////////////////////////////////////////////////////

function DataBrowserRouter({
  children,
  fallbackElement,
  hydrationData,
  window
}) {
  return UNSAFE_useRenderDataRouter({
    children,
    fallbackElement,
    createRouter: routes => createBrowserRouter({
      routes,
      hydrationData,
      window
    })
  });
}
function DataHashRouter({
  children,
  hydrationData,
  fallbackElement,
  window
}) {
  return UNSAFE_useRenderDataRouter({
    children,
    fallbackElement,
    createRouter: routes => createHashRouter({
      routes,
      hydrationData,
      window
    })
  });
}

/**
 * A `<Router>` for use in web browsers. Provides the cleanest URLs.
 */
function BrowserRouter({
  basename,
  children,
  window
}) {
  let historyRef = useRef();

  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({
      window,
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
 * A `<Router>` for use in web browsers. Stores the location in the hash
 * portion of the URL so it is not sent to the server.
 */
function HashRouter({
  basename,
  children,
  window
}) {
  let historyRef = useRef();

  if (historyRef.current == null) {
    historyRef.current = createHashHistory({
      window,
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
 * A `<Router>` that accepts a pre-instantiated history object. It's important
 * to note that using your own history object is highly discouraged and may add
 * two versions of the history library to your bundles unless you use the same
 * version of the history library that React Router uses internally.
 */
function HistoryRouter({
  basename,
  children,
  history
}) {
  const [state, setState] = useState({
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

{
  HistoryRouter.displayName = "unstable_HistoryRouter";
}

/**
 * The public API for rendering a history-aware <a>.
 */
const Link = /*#__PURE__*/forwardRef(function LinkWithRef({
  onClick,
  reloadDocument,
  replace = false,
  state,
  target,
  to,
  ...rest
}, ref) {
  let href = useHref(to);
  let internalOnClick = useLinkClickHandler(to, {
    replace,
    state,
    target
  });

  function handleClick(event) {
    if (onClick) onClick(event);

    if (!event.defaultPrevented && !reloadDocument) {
      internalOnClick(event);
    }
  }

  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    createElement("a", Object.assign({}, rest, {
      href: href,
      onClick: handleClick,
      ref: ref,
      target: target
    }))
  );
});

{
  Link.displayName = "Link";
}

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
const NavLink = /*#__PURE__*/forwardRef(function NavLinkWithRef({
  "aria-current": ariaCurrentProp = "page",
  caseSensitive = false,
  className: classNameProp = "",
  end = false,
  style: styleProp,
  to,
  children,
  ...rest
}, ref) {
  let location = useLocation();
  let path = useResolvedPath(to);
  let locationPathname = location.pathname;
  let toPathname = path.pathname;

  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    toPathname = toPathname.toLowerCase();
  }

  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(toPathname.length) === "/";
  let ariaCurrent = isActive ? ariaCurrentProp : undefined;
  let className;

  if (typeof classNameProp === "function") {
    className = classNameProp({
      isActive
    });
  } else {
    // If the className prop is not a function, we use a default `active`
    // class for <NavLink />s that are active. In v5 `active` was the default
    // value for `activeClassName`, but we are removing that API and can still
    // use the old default behavior for a cleaner upgrade path and keep the
    // simple styling rules working as they currently do.
    className = [classNameProp, isActive ? "active" : null].filter(Boolean).join(" ");
  }

  let style = typeof styleProp === "function" ? styleProp({
    isActive
  }) : styleProp;
  return /*#__PURE__*/createElement(Link, Object.assign({}, rest, {
    "aria-current": ariaCurrent,
    className: className,
    ref: ref,
    style: style,
    to: to
  }), typeof children === "function" ? children({
    isActive
  }) : children);
});

{
  NavLink.displayName = "NavLink";
}

/**
 * A `@remix-run/router`-aware `<form>`. It behaves like a normal form except
 * that the interaction with the server is with `fetch` instead of new document
 * requests, allowing components to add nicer UX to the page as the form is
 * submitted and returns with data.
 */
const Form = /*#__PURE__*/forwardRef((props, ref) => {
  return /*#__PURE__*/createElement(FormImpl, Object.assign({}, props, {
    ref: ref
  }));
});

{
  Form.displayName = "Form";
}

const FormImpl = /*#__PURE__*/forwardRef(({
  replace: _replace = false,
  method: _method = defaultMethod,
  action: _action = ".",
  encType: _encType = defaultEncType,
  onSubmit,
  fetcherKey,
  ...props
}, forwardedRef) => {
  let submit = useSubmitImpl(fetcherKey);
  let formMethod = _method.toLowerCase() === "get" ? "get" : "post";
  let formAction = useFormAction(_action);
  let formRef = useRef();
  let ref = useComposedRefs(forwardedRef, formRef); // When calling `submit` on the form element itself, we don't get data from
  // the button that submitted the event. For example:
  //
  //   <Form>
  //     <button name="something" value="whatever">Submit</button>
  //   </Form>
  //
  // formData.get("something") should be "whatever", but we don't get that
  // unless we call submit on the clicked button itself.
  //
  // To figure out which button triggered the submit, we'll attach a click
  // event listener to the form. The click event is always triggered before
  // the submit event (even when submitting via keyboard when focused on
  // another form field, yeeeeet) so we should have access to that button's
  // data for use in the submit handler.

  let clickedButtonRef = useRef();
  useEffect(() => {
    let form = formRef.current;
    if (!form) return;

    function handleClick(event) {
      if (!(event.target instanceof Element)) return;
      let submitButton = event.target.closest("button,input[type=submit]");

      if (submitButton && submitButton.form === form && submitButton.type === "submit") {
        clickedButtonRef.current = submitButton;
      }
    }

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  let submitHandler = event => {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    submit(clickedButtonRef.current || event.currentTarget, {
      method: _method,
      replace: _replace
    });
    clickedButtonRef.current = null;
  };

  return /*#__PURE__*/createElement("form", Object.assign({
    ref: ref,
    method: formMethod,
    action: formAction,
    encType: _encType,
    onSubmit: submitHandler
  }, props));
});

{
  Form.displayName = "Form";
} //#endregion
////////////////////////////////////////////////////////////////////////////////
//#region Hooks
////////////////////////////////////////////////////////////////////////////////

/**
 * Handles the click behavior for router `<Link>` components. This is useful if
 * you need to create custom `<Link>` components with the same click behavior we
 * use in our exported `<Link>`.
 */


function useLinkClickHandler(to, {
  target,
  replace: replaceProp,
  state
} = {}) {
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to);
  return useCallback(event => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault(); // If the URL hasn't changed, a regular <a> will do a replace instead of
      // a push, so do the same here.

      let replace = !!replaceProp || createPath(location) === createPath(path);
      navigate(to, {
        replace,
        state
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to]);
}
/**
 * A convenient wrapper for reading and writing search parameters via the
 * URLSearchParams interface.
 */

function useSearchParams(defaultInit) {
   warning(typeof URLSearchParams !== "undefined", `You cannot use the \`useSearchParams\` hook in a browser that does not ` + `support the URLSearchParams API. If you need to support Internet ` + `Explorer 11, we recommend you load a polyfill such as ` + `https://github.com/ungap/url-search-params\n\n` + `If you're unsure how to load polyfills, we recommend you check out ` + `https://polyfill.io/v3/ which provides some recommendations about how ` + `to load polyfills only for users that need them, instead of for every ` + `user.`) ;
  let defaultSearchParamsRef = useRef(createSearchParams(defaultInit));
  let location = useLocation();
  let searchParams = useMemo(() => getSearchParamsForLocation(location.search, defaultSearchParamsRef.current), [location.search]);
  let navigate = useNavigate();
  let setSearchParams = useCallback((nextInit, navigateOptions) => {
    navigate("?" + createSearchParams(nextInit), navigateOptions);
  }, [navigate]);
  return [searchParams, setSearchParams];
}
/**
 * Submits a HTML `<form>` to the server without reloading the page.
 */

/**
 * Returns a function that may be used to programmatically submit a form (or
 * some arbitrary data) to the server.
 */
function useSubmit() {
  return useSubmitImpl();
}

function useSubmitImpl(fetcherKey) {
  let router = useContext(UNSAFE_DataRouterContext);
  let defaultAction = useFormAction();
  return useCallback((target, options = {}) => {
    !(router != null) ?  invariant(false, "useSubmit() must be used within a <DataRouter>")  : void 0;

    if (typeof document === "undefined") {
      throw new Error("You are calling submit during the server render. " + "Try calling submit within a `useEffect` or callback instead.");
    }

    let {
      method,
      encType,
      formData,
      url
    } = getFormSubmissionInfo(target, defaultAction, options);
    let href = url.pathname + url.search;
    let opts = {
      replace: options.replace,
      formData,
      formMethod: method,
      formEncType: encType
    };

    if (fetcherKey) {
      router.fetch(fetcherKey, href, opts);
    } else {
      router.navigate(href, opts);
    }
  }, [defaultAction, router, fetcherKey]);
}

function useFormAction(action = ".") {
  let routeContext = useContext(UNSAFE_RouteContext);
  !routeContext ?  invariant(false, "useLoaderData must be used inside a RouteContext")  : void 0;
  let [match] = routeContext.matches.slice(-1);
  let {
    pathname,
    search
  } = useResolvedPath(action);

  if (action === "." && match.route.index) {
    search = search ? search.replace(/^\?/, "?index&") : "?index";
  }

  return pathname + search;
}

function useComposedRefs(...refs) {
  return useCallback(node => {
    for (let ref of refs) {
      if (ref == null) continue;

      if (typeof ref === "function") {
        ref(node);
      } else {
        try {
          ref.current = node;
        } catch (_) {}
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, refs);
}

function createFetcherForm(fetcherKey) {
  let FetcherForm = /*#__PURE__*/forwardRef((props, ref) => {
    return /*#__PURE__*/createElement(FormImpl, Object.assign({}, props, {
      ref: ref,
      fetcherKey: fetcherKey
    }));
  });

  {
    FetcherForm.displayName = "fetcher.Form";
  }

  return FetcherForm;
}

let fetcherId = 0;

/**
 * Interacts with route loaders and actions without causing a navigation. Great
 * for any interaction that stays on the same page.
 */
function useFetcher() {
  let router = useContext(UNSAFE_DataRouterContext);
  !router ?  invariant(false, `useFetcher must be used within a DataRouter`)  : void 0;
  let [fetcherKey] = useState(() => String(++fetcherId));
  let [Form] = useState(() => createFetcherForm(fetcherKey));
  let [load] = useState(() => href => {
    !router ?  invariant(false, `No router available for fetcher.load()`)  : void 0;
    router.fetch(fetcherKey, href);
  });
  let submit = useSubmitImpl(fetcherKey);
  let fetcher = router.getFetcher(fetcherKey);
  let fetcherWithComponents = useMemo(() => ({
    Form,
    submit,
    load,
    ...fetcher
  }), [fetcher, Form, submit, load]);
  useEffect(() => {
    // Is this busted when the React team gets real weird and calls effects
    // twice on mount?  We really just need to garbage collect here when this
    // fetcher is no longer around.
    return () => {
      if (!router) {
        console.warn("No fetcher available to clean up from useFetcher()");
        return;
      }

      router.deleteFetcher(fetcherKey);
    };
  }, [router, fetcherKey]);
  return fetcherWithComponents;
}
/**
 * Provides all fetchers currently on the page. Useful for layouts and parent
 * routes that need to provide pending/optimistic UI regarding the fetch.
 */

function useFetchers() {
  let state = useContext(UNSAFE_DataRouterStateContext);
  !state ?  invariant(false, `useFetchers must be used within a DataRouter`)  : void 0;
  return [...state.fetchers.values()];
} //#endregion
////////////////////////////////////////////////////////////////////////////////
//#region Utils
////////////////////////////////////////////////////////////////////////////////

function warning(cond, message) {
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
} //#endregion

export { BrowserRouter, DataBrowserRouter, DataHashRouter, Form, HashRouter, Link, NavLink, createSearchParams, HistoryRouter as unstable_HistoryRouter, useFetcher, useFetchers, useFormAction, useLinkClickHandler, useSearchParams, useSubmit };
//# sourceMappingURL=react-router-dom.development.js.map
