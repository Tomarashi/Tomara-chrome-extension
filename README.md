# Tomara-chrome-extension
Tomara's Extension

To compile project run:
```sh
npm run build
```

To build into separate directory:
```sh
node build.js
```

#### Small Instruction
Initialization of this extension starts with `entry/loader.js`. It loads resources that are written in `manifest.json` and appends them into html.
Resources of `CSS` are located in `public/` directory, resources of `js` are located in `dist/` directory which is output directory for compiled typescript code (typescript files are `src/` folder).
