import * as fs from "fs";
import * as uglifyJS from "uglify-js";
import cleanCss from 'clean-css';
import { execSync } from "child_process";
import { join, dirname } from "path";

const CleanCSS = cleanCss;


const UTF_8 = "utf8";
const TAB = "    ";

const MANIFEST_JSON = "manifest.json";
const TS_CONFIG_JSON = "tsconfig.json";
const GITIGNORE_FILE = ".gitignore";
const ENTRY_JS = "src/entry.js";
const BUILD_DIR = "tomara-extension";

const DO_MINIFY = false;
const MINIFY_JS_OPTS = {
    mangle: false,
    compress: {
        passes: 3,
    },
};
const MINIFY_CSS_OPTS = {
    level: {
        1: {
            all: true,
        },
    },
};


const info = console.log;
const withLog = (func) => {
    return srcFile => {
        const newFile = join(BUILD_DIR, srcFile);
        func(srcFile, newFile);
        const srcFileSize = fs.statSync(srcFile).size;
        const newFileSize = fs.statSync(newFile).size;
        const toLineEnd = (() => {
            if(!DO_MINIFY || srcFileSize === newFileSize) {
                return "";
            }
            const diff = 1 - newFileSize / srcFileSize;
            const scaledDiff = Math.round(diff * 100 * 100) / 100;
            return ` [-${scaledDiff}%]`;
        })();
        info(`${TAB}FROM: '${srcFile}'`);
        info(`${TAB}  TO: '${newFile}${toLineEnd}'`);
    };
};

const getField = (config, nestedFieldName) => {
    const nestedFieldNames = nestedFieldName.split(".");
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
    const minifiedCode = uglifyJS.minify(inputCode, MINIFY_JS_OPTS);
    createDir(outputFile);
    writeFile(outputFile, minifiedCode.code);
};

const minifyCssFile = (inputFile, outputFile) => {
    const inputCode = fs.readFileSync(inputFile, UTF_8);
    const result = new CleanCSS(MINIFY_CSS_OPTS).minify(inputCode);
    createDir(outputFile);
    writeFile(outputFile, result.styles);
};


const process = (manifest, tsConfig) => {
    const filterResources = (resources, fileExtention) => {
        return resources.filter((res) => {
            return res.toLowerCase().endsWith(fileExtention);
        });
    };

    const webResources = getField(manifest, "web_accessible_resources").map((entry) => {
        return entry["resources"] || [];
    }).flat();

    const jsResources = filterResources(webResources, ".js");
    const cssResources = filterResources(webResources, ".css");
    const otherResources = (() => {
        const usedResources = new Set([
            ...jsResources,
            ...cssResources,
        ]);
        const result = webResources.filter((res) => {
            return !usedResources.has(res);
        });
        result.push(
            ...Object.values(getField(manifest, "icons"))
        );
        result.push(MANIFEST_JSON, ENTRY_JS);
        return result;
    })();

    info("Building...");
    try {
        const outBuf = execSync("npm run build");
        console.log(outBuf.toString());
    } catch(e) {
        const stdout = e.stdout.toString();
        const stderr = e.stderr.toString();
        throw new Error(`Can't execute build commnad:\n[OUT] ${stdout}\n[ERR] ${stderr}`);
    }

    info("Copying...");
    jsResources.forEach(withLog(
        (DO_MINIFY)? minifyJsFile: copyFile
    ));
    cssResources.forEach(withLog(
        (DO_MINIFY)? minifyCssFile: copyFile
    ));
    otherResources.forEach(withLog(copyFile));

    writeFile(join(BUILD_DIR, GITIGNORE_FILE), "*\n");

    const convertedFileCount = jsResources.length
        + cssResources.length
        + otherResources.length;
    info("Number of converted files: " + convertedFileCount);

    const outDir = getField(tsConfig, "compilerOptions.outDir");
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
