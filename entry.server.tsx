import path from "path";
import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import App from "./src/App";

const app = express();

app.get("/", (req, res) => {
  const stream = renderToPipeableStream(<App />);
  stream.pipe(res);
});

app.use(express.static(path.resolve("./dist")));

const port = 3000;
app.listen(port, () => {
  console.log(`express app listening on ${port}`);
});
