declare module '*.wasm' {
  const module: WebAssembly.Module | string;
  export default module;
}

declare module '*.ttf' {
  const source: string;
  export default source;
}
