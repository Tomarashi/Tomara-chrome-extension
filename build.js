import * as fs from "fs";
import * as uglifyJS from "uglify-js";
import { execSync } from "child_process";
import { join, dirname } from "path";


const USE_LOG = true;


const UTF_8 = "utf8";
const TAB = new Array(4).fill(" ").join("");

const MANIFEST_JSON = "manifest.json";
const TS_CONFIG_JSON = "tsconfig.json";
const GITIGNORE_FILE = ".gitignore";
const ENTRY_JS = "src/entry.js";

const BUILD_DIR = "tomara-extension";


class FileInfo {
    constructor(path, doMinify = true) {
        this.path = path;
        this.doMinify = doMinify;
    }
}

const info = console.log;
const log = (...data) => {
    if(USE_LOG) {
        console.log(...data);
    }
};

const getField = (config, nestedFieldName) => {
    const nestedFieldNames = nestedFieldName.split(".")
        .map((name) => name.trim())
        .filter((name) => name !== "");
    let nested = config;
    for(let i = 0; i < nestedFieldNames.length; i++) {
        const fieldName = nestedFieldNames[i];
        nested = nested[fieldName];
        if(!nested) {
            throw new Error(`'${fieldName}' field not found`);
        }
    }
    return nested;
};

const createDir = (fileName) => {
    const newDir = dirname(fileName);
    if (!fs.existsSync(newDir)){
        fs.mkdirSync(newDir, { recursive: true });
    }
};

const writeFile = (fileName, data) => {
    createDir(fileName);
    fs.writeFileSync(fileName, data);
};

const copyFile = (inputFile, outputFile) => {
    createDir(outputFile);
    fs.copyFileSync(inputFile, outputFile);
};

const minifyJsFile = (inputFile, outputFile) => {
    const inputCode = fs.readFileSync(inputFile, UTF_8);
    const minifiedCode = uglifyJS.minify(inputCode);
    createDir(outputFile);
    writeFile(outputFile, minifiedCode.code);
};

const round = (n) => {
    const roundRate = 100;
    return Math.round(n * roundRate) / roundRate;
};


const process = (manifest, tsConfig) => {
    const FI = (...args) => new FileInfo(...args);
    const filterResources = (resources, fileExtention) => {
        return resources.filter((res) => {
            return res.toLowerCase().endsWith(fileExtention);
        });
    };

    const outDir = getField(tsConfig, "compilerOptions.outDir");
    const icons = Object.values(getField(manifest, "icons"));
    const webResources = getField(manifest, "web_accessible_resources").map((entry) => {
        return entry["resources"] || [];
    }).flat();
    const jsResources = filterResources(webResources, ".js").map(res => FI(res, true));
    const otherResources = (() => {
        const usedResources = new Set(jsResources);
        return webResources.filter((res) => {
            return !usedResources.has(res);
        }).map(res => FI(res, false));
    })();

    info("Building...");
    execSync("npm run build");

    info("Copying...");
    let originalSize = 0;
    let compressedSize = 0;
    [
        FI(MANIFEST_JSON, false),
        FI(ENTRY_JS),
        ...jsResources,
        ...otherResources,
        ...icons,
    ].forEach((srcFileInfo) => {
        const srcFile = (srcFileInfo instanceof FileInfo)? srcFileInfo.path: srcFileInfo;
        const newFile = join(BUILD_DIR, srcFile);

        if(srcFileInfo.doMinify || false) {
            minifyJsFile(srcFile, newFile);
            originalSize += fs.statSync(srcFile).size;
            compressedSize += fs.statSync(newFile).size;
        } else {
            copyFile(srcFile, newFile);
        }

        log(`${TAB}  TO: '${newFile}'`);
        log(`${TAB}FROM: '${srcFile}'`);
    });

    writeFile(join(BUILD_DIR, GITIGNORE_FILE), "*\n");

    if(originalSize > 0) {
        const compressRate = round((1 - (compressedSize / originalSize)) * 100);
        log(`${TAB}[Compress Rate: ${compressRate}%]`);
    }

    info(`Deleting '${outDir}' Directory...`);
    fs.rmSync(outDir, { recursive: true, force: true });

    info(`Folder '${BUILD_DIR}' is created!`);
};

(() => {
    const TIME_ALIAS = "Build finished";
    console.time(TIME_ALIAS);
    try {
        const manifest = fs.readFileSync(MANIFEST_JSON, UTF_8);
        const tsConfig = fs.readFileSync(TS_CONFIG_JSON, UTF_8);
        process(JSON.parse(manifest), JSON.parse(tsConfig));
    } catch (err) {
        console.error(err);
    }
    console.timeEnd(TIME_ALIAS);
})();
