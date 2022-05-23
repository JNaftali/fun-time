import { hydrateRoot } from "react-dom/client";
import { DataBrowserRouter, Route } from "react-router-dom";
import App from "./src/App";

const root = hydrateRoot(
  document,
  <DataBrowserRouter hydrationData={{}} fallbackElement={undefined as any}>
    <Route
      path="*"
      element={<App initialData={(window as any).initialData} />}
    />
  </DataBrowserRouter>
);
