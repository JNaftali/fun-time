/** @type {import('@babel/core').ConfigFunction} */
export default () => ({
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
});
