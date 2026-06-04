# Build

`three-bundle.js.txt` is Three.js r0.167.0 plus OrbitControls and GLTFExporter,
bundled into one same-origin ES module so the page makes zero third-party requests
for the 3D engine. v4-v6 imported Three.js from esm.sh / jsDelivr and the module
failed to load on the customer's network, surfacing as "3D engine did not load".

Regenerate the bundle:

    npm i three@0.167.0 esbuild
    npx esbuild vendor-entry.js --bundle --format=esm --minify --outfile=three-bundle.js.txt

The Worker (`worker.js`) serves the bundle at `/three-bundle.js` with a JavaScript
MIME type; the page's importmap points all three specifiers at that path.
