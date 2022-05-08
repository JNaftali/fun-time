import { hydrateRoot } from "react-dom/client";
import { DataBrowserRouter, Route } from "react-router-dom";
import App from "./src/App";

const root = hydrateRoot(
  document,
  <DataBrowserRouter>
    <Route path="*" element={<App />} />
  </DataBrowserRouter>
);
