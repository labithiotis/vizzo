declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}

declare module '*.ttf?inline' {
  const dataUrl: string;
  export default dataUrl;
}
