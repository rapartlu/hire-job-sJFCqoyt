// Bundled, same-origin Three.js + addons. Replaces the runtime CDN importmap
// that failed to load on the customer's network (esm.sh and jsDelivr both
// blocked/timed out across v4-v6). esbuild resolves the full module graph at
// build time so the browser fetches one same-origin file with zero third-party
// requests and zero runtime import resolution.
export * from 'three';
export { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
