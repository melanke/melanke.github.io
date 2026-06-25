declare module "highlightjs-solidity" {
  import type { HLJSApi } from "highlight.js";
  /** Registers the `solidity` and `yul` languages on a highlight.js instance. */
  const hljsDefineSolidity: (hljs: HLJSApi) => void;
  export default hljsDefineSolidity;
}
