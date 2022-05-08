import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Configuration } from "webpack";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: Configuration = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  target: "browserslist",
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
};

export default config;
