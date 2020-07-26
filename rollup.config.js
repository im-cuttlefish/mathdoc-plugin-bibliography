import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: "inline",
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: "inline",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript(),
    commonjs({ extensions: [".ts", ".tsx", ".js", ".jsx"] }),
    resolve(),
    getBabelOutputPlugin({
      presets: [
        ["@babel/preset-env", { useBuiltIns: "usage", corejs: 3 }],
        "@babel/preset-react",
      ],
    }),
    terser(),
  ],
};
