import { History, Location, To } from "./history";
import { Action as HistoryAction } from "./history";
import { ActionFormMethod, DataRouteObject, FormEncType, FormMethod, LoaderFormMethod, RouteMatch, RouteObject } from "./utils";
/**
 * Map of routeId -> data returned from a loader/action/error
 */
export interface RouteData {
    [routeId: string]: any;
}
export interface DataRouteMatch extends RouteMatch<string, DataRouteObject> {
}
/**
 * A Router instance manages all navigation and data loading/mutations
 */
export interface Router {
    get state(): RouterState;
    subscribe(fn: RouterSubscriber): () => void;
    navigate(path: number): Promise<void>;
    navigate(path: To, opts?: NavigateOptions): Promise<void>;
    fetch(key: string, href: string, opts?: NavigateOptions): Promise<void>;
    revalidate(): Promise<void>;
    createHref(location: Location | URL): string;
    getFetcher<TData = any>(key?: string): Fetcher<TData>;
    deleteFetcher(key?: string): void;
    cleanup(): void;
    _internalFetchControllers: Map<string, AbortController>;
}
/**
 * State maintained internally by the router.  During a navigation, all states
 * reflect the the "old" location unless otherwise noted.
 */
export interface RouterState {
    /**
     * The action of the most recent navigation
     */
    historyAction: HistoryAction;
    /**
     * The current location reflected by the router
     */
    location: Location;
    /**
     * The current set of route matches
     */
    matches: DataRouteMatch[];
    /**
     * Tracks whether we've completed our initial data load
     */
    initialized: boolean;
    /**
     * Tracks the state of the current transition
     */
    transition: Transition;
    /**
     * Tracks any in-progress revalidations
     */
    revalidation: RevalidationState;
    /**
     * Data from the loaders for the current matches
     */
    loaderData: RouteData;
    /**
     * Data from the action for the current matches
     */
    actionData: RouteData | null;
    /**
     * Errors caught from loaders for the current matches
     */
    errors: RouteData | null;
    /**
     * Map of current fetchers
     */
    fetchers: Map<string, Fetcher>;
}
/**
 * Data that can be passed into hydrate a Router from SSR
 */
export declare type HydrationState = Partial<Pick<RouterState, "loaderData" | "actionData" | "errors">>;
/**
 * Initialization options for createRouter
 */
export interface RouterInit {
    routes: RouteObject[];
    history: History;
    hydrationData?: HydrationState;
}
export interface RouterSubscriber {
    (state: RouterState): void;
}
/**
 * Options for a navigate() call for a Link navigation
 */
declare type LinkNavigateOptions = {
    replace?: boolean;
    state?: any;
};
/**
 * Options for a navigate() call for a Form navigation
 */
declare type SubmissionNavigateOptions = {
    replace?: boolean;
    state?: any;
    formMethod?: FormMethod;
    formEncType?: FormEncType;
    formData: FormData;
};
/**
 * Options to pass to navigate() for either a Link or Form navigation
 */
export declare type NavigateOptions = LinkNavigateOptions | SubmissionNavigateOptions;
/**
 * Potential states for state.transition
 */
export declare type TransitionStates = {
    Idle: {
        state: "idle";
        type: "idle";
        location: undefined;
        formMethod: undefined;
        formAction: undefined;
        formEncType: undefined;
        formData: undefined;
    };
    Loading: {
        state: "loading";
        type: "normalLoad";
        location: Location;
        formMethod: undefined;
        formAction: undefined;
        formEncType: undefined;
        formData: undefined;
    };
    LoadingRedirect: {
        state: "loading";
        type: "normalRedirect";
        location: Location;
        formMethod: undefined;
        formAction: undefined;
        formEncType: undefined;
        formData: undefined;
    };
    SubmittingLoader: {
        state: "submitting";
        type: "loaderSubmission";
        location: Location;
        formMethod: LoaderFormMethod;
        formAction: string;
        formEncType: "application/x-www-form-urlencoded";
        formData: FormData;
    };
    SubmissionRedirect: {
        state: "loading";
        type: "submissionRedirect";
        location: Location;
        formMethod: FormMethod;
        formAction: string;
        formEncType: FormEncType;
        formData: FormData;
    };
    SubmittingAction: {
        state: "submitting";
        type: "actionSubmission";
        location: Location;
        formMethod: ActionFormMethod;
        formAction: string;
        formEncType: FormEncType;
        formData: FormData;
    };
    LoadingAction: {
        state: "loading";
        type: "actionReload";
        location: Location;
        formMethod: ActionFormMethod;
        formAction: string;
        formEncType: FormEncType;
        formData: FormData;
    };
};
export declare type Transition = TransitionStates[keyof TransitionStates];
export declare type RevalidationState = "idle" | "loading";
declare type FetcherStates<TData = any> = {
    Idle: {
        state: "idle";
        type: "init";
        formMethod: undefined;
        formAction: undefined;
        formEncType: undefined;
        formData: undefined;
        data: undefined;
    };
    Loading: {
        state: "loading";
        type: "normalLoad";
        formMethod: undefined;
        formAction: undefined;
        formEncType: undefined;
        formData: undefined;
        data: TData | undefined;
    };
    SubmittingLoader: {
        state: "submitting";
        type: "loaderSubmission";
        formMethod: FormMethod;
        formAction: string;
        formEncType: "application/x-www-form-urlencoded";
        formData: FormData;
        data: TData | undefined;
    };
    SubmittingAction: {
        state: "submitting";
        type: "actionSubmission";
        formMethod: ActionFormMethod;
        formAction: string;
        formEncType: FormEncType;
        formData: FormData;
        data: undefined;
    };
    ReloadingAction: {
        state: "loading";
        type: "actionReload";
        formMethod: ActionFormMethod;
        formAction: string;
        formEncType: FormEncType;
        formData: FormData;
        data: TData;
    };
    SubmissionRedirect: {
        state: "loading";
        type: "submissionRedirect";
        formMethod: ActionFormMethod;
        formAction: string;
        formEncType: FormEncType;
        formData: FormData;
        data: undefined;
    };
    Revalidating: {
        state: "loading";
        type: "revalidate";
        formMethod: undefined;
        formAction: undefined;
        formEncType: undefined;
        formData: undefined;
        data: TData | undefined;
    };
    Done: {
        state: "idle";
        type: "done";
        formMethod: undefined;
        formAction: undefined;
        formEncType: undefined;
        formData: undefined;
        data: TData;
    };
};
export declare type Fetcher<TData = any> = FetcherStates<TData>[keyof FetcherStates<TData>];
declare enum ResultType {
    data = "data",
    redirect = "redirect",
    error = "error"
}
/**
 * Successful result from a loader or action
 */
export interface SuccessResult {
    type: ResultType.data;
    data: any;
}
/**
 * Redirect result from a loader or action
 */
export interface RedirectResult {
    type: ResultType.redirect;
    status: number;
    location: string;
    revalidate: boolean;
}
/**
 * Unsuccessful result from a loader or action
 */
export interface ErrorResult {
    type: ResultType.error;
    error: any;
}
/**
 * Result from a loader or action - potentially successful or unsuccessful
 */
export declare type DataResult = SuccessResult | RedirectResult | ErrorResult;
export declare const IDLE_TRANSITION: TransitionStates["Idle"];
export declare const IDLE_FETCHER: FetcherStates["Idle"];
/**
 * Create a router and listen to history POP navigations
 */
export declare function createRouter(init: RouterInit): Router;
export {};
