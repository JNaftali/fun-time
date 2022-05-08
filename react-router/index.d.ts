import type { ActionFunctionArgs, LoaderFunctionArgs, Location, Params, Path, PathMatch, PathPattern, RouteMatch, RouteObject, To } from "@remix-run/router";
import { Action as NavigationType, createPath, generatePath, matchPath, matchRoutes, parsePath, resolvePath } from "@remix-run/router";
import type { DataMemoryRouterProps, MemoryRouterProps, NavigateProps, OutletProps, RouteProps, PathRouteProps, LayoutRouteProps, IndexRouteProps, RouterProps, RoutesProps } from "./lib/components";
import { createRoutesFromChildren, renderMatches, MemoryRouter, DataMemoryRouter, Navigate, Outlet, Route, Router, Routes, useRenderDataRouter } from "./lib/components";
import type { Navigator } from "./lib/context";
import { DataRouterContext, DataRouterStateContext, LocationContext, NavigationContext, RouteContext } from "./lib/context";
import type { NavigateFunction, NavigateOptions } from "./lib/hooks";
import { useHref, useInRouterContext, useLocation, useMatch, useNavigationType, useNavigate, useOutlet, useOutletContext, useParams, useResolvedPath, useRoutes, useActionData, useLoaderData, useMatches, useRouteLoaderData, useRouteError, useNavigation, useRevalidator } from "./lib/hooks";
declare type Hash = string;
declare type Pathname = string;
declare type Search = string;
export type { DataMemoryRouterProps, Hash, IndexRouteProps, LayoutRouteProps, Location, MemoryRouterProps, NavigateFunction, NavigateOptions, NavigateProps, OutletProps, PathMatch, PathPattern, PathRouteProps, RouteMatch, RouteObject, RouteProps, RouterProps, RoutesProps, Navigator, Params, Path, Pathname, Search, To, LoaderFunctionArgs, ActionFunctionArgs, };
export { MemoryRouter, DataMemoryRouter, Navigate, NavigationType, Outlet, Route, Router, Routes, createPath, createRoutesFromChildren, generatePath, matchPath, matchRoutes, parsePath, renderMatches, resolvePath, useHref, useInRouterContext, useLocation, useMatch, useNavigate, useNavigationType, useOutlet, useOutletContext, useParams, useResolvedPath, useRoutes, useActionData, useLoaderData, useMatches, useRouteLoaderData, useRouteError, useNavigation, useRevalidator, };
/** @internal */
export { NavigationContext as UNSAFE_NavigationContext, LocationContext as UNSAFE_LocationContext, RouteContext as UNSAFE_RouteContext, DataRouterContext as UNSAFE_DataRouterContext, DataRouterStateContext as UNSAFE_DataRouterStateContext, useRenderDataRouter as UNSAFE_useRenderDataRouter, };
