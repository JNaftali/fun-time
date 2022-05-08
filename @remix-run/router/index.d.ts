import type { BrowserHistory, BrowserHistoryOptions, HashHistory, HashHistoryOptions, History, InitialEntry, Location, MemoryHistory, MemoryHistoryOptions, Path, To } from "./history";
import { Action, createBrowserHistory, createHashHistory, createMemoryHistory, createPath, parsePath } from "./history";
import type { DataRouteMatch, Fetcher, HydrationState, NavigateOptions, Transition, Router, RouterState, RouteData, RouterInit } from "./router";
import { IDLE_TRANSITION, createRouter } from "./router";
import type { ActionFunctionArgs, DataRouteObject, FormEncType, FormMethod, LoaderFunctionArgs, ParamParseKey, Params, PathMatch, PathPattern, RouteMatch, RouteObject, Submission } from "./utils";
import { generatePath, getToPathname, invariant, joinPaths, matchPath, matchRoutes, normalizePathname, normalizeSearch, normalizeHash, resolvePath, resolveTo, stripBasename, warning, warningOnce } from "./utils";
declare type MemoryRouterInit = MemoryHistoryOptions & Omit<RouterInit, "history">;
declare function createMemoryRouter({ initialEntries, initialIndex, ...routerInit }: MemoryRouterInit): Router;
declare type BrowserRouterInit = BrowserHistoryOptions & Omit<RouterInit, "history">;
declare function createBrowserRouter({ window, ...routerInit }: BrowserRouterInit): Router;
declare type HashRouterInit = HashHistoryOptions & Omit<RouterInit, "history">;
declare function createHashRouter({ window, ...routerInit }: HashRouterInit): Router;
export type { ActionFunctionArgs, BrowserHistory, BrowserRouterInit, DataRouteMatch, DataRouteObject, Fetcher, FormEncType, FormMethod, HashHistory, HashRouterInit, History, HydrationState, InitialEntry, LoaderFunctionArgs, Location, MemoryHistory, MemoryRouterInit, NavigateOptions, ParamParseKey, Params, Path, PathMatch, PathPattern, RouteData, RouteMatch, RouteObject, Router, RouterInit, RouterState, Submission, To, Transition, };
export { Action, IDLE_TRANSITION, createBrowserHistory, createBrowserRouter, createHashHistory, createHashRouter, createMemoryRouter, createMemoryHistory, createPath, createRouter, generatePath, getToPathname, invariant, joinPaths, matchPath, matchRoutes, normalizeHash, normalizePathname, normalizeSearch, parsePath, resolvePath, resolveTo, stripBasename, warning, warningOnce, };
