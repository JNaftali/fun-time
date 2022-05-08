import baseConfig from "./webpack.config.js";

/** @type {import('webpack').Configuration} */
const config = {
  ...baseConfig,
  entry: "./entry.client.tsx",
  output: {
    ...baseConfig.output,
    filename: "client.js",
  },
};

export default config;
