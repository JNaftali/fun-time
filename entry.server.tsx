import path from "path";
import express from "express";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import App from "./src/App";
import { DataStaticRouter } from "react-router-dom/server";
import { Route } from "react-router-dom";
import type { RouterInit } from "@remix-run/router";

type RouterState = Partial<RouterInit["hydrationData"]>;
const app = express();
app.use(express.static(path.resolve("./dist")));

app.get("*", (req, res) => {
  const data: RouterState = {};

  const markup = renderToString(
    <DataStaticRouter data={data} location={req.url}>
      <Route path="*" element={<App initialData={data} />} />
    </DataStaticRouter>
  );
  res.send(markup);
});

const port = 3000;
app.listen(port, () => {
  console.log(`express app listening on ${port}`);
});
