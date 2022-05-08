import path from "path";
import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import App from "./src/App";
import { StaticRouter } from "react-router-dom/server";

const app = express();
app.use(express.static(path.resolve("./dist")));

app.get("*", (req, res) => {
  const stream = renderToPipeableStream(
    <StaticRouter location={req.url}>
      <>
        <App />
      </>
    </StaticRouter>
  );
  stream.pipe(res);
});

const port = 3000;
app.listen(port, () => {
  console.log(`express app listening on ${port}`);
});
