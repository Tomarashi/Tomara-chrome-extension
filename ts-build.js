import * as fs from "fs";
import { execSync } from "child_process";


const UTF_8 = "utf8";

const TS_CONFIG_JSON = "tsconfig.json";


const process = (tsConfig) => {
    const outDir = tsConfig["compilerOptions"]["outDir"];

    if(outDir) {
        fs.rmSync(outDir, { recursive: true, force: true });
    }

    const stdout = execSync("npm run build");
    console.log(stdout.toString());
};

(() => {
    const TIME_ALIAS = "Build finished";
    console.time(TIME_ALIAS);
    try {
        const tsConfig = fs.readFileSync(TS_CONFIG_JSON, UTF_8);
        process(JSON.parse(tsConfig));
    } catch (err) {
        console.error(err);
    }
    console.timeEnd(TIME_ALIAS);
})();
