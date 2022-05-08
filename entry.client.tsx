import { hydrateRoot } from "react-dom/client";
import { DataBrowserRouter } from "react-router-dom";
import App from "./src/App";

const root = hydrateRoot(
  document,
  <DataBrowserRouter>
    <>
      <App />
    </>
  </DataBrowserRouter>
);
