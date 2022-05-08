import baseConfig from "./webpack.config.js";

/** @type {import('webpack').Configuration} */
const config = {
  ...baseConfig,
  entry: "./entry.server.tsx",
  target: "node16",
  output: {
    ...baseConfig.output,
    filename: "server.js",
  },
  experiments: {
    outputModule: true,
  },
};

export default config;
