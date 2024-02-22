import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
import json from "@rollup/plugin-json";
import { join } from "path";
const sourcePath = process.cwd();
const outDir = join(sourcePath, "dist/tmp/widgets/");
const widgetPackageJson = require(join(sourcePath, "package.json"));
const widgetName = widgetPackageJson.widgetName;
const widgetPackage = widgetPackageJson.packagePath;
const outWidgetDir = join(widgetPackage.replace(/\./g, "/"), widgetName.toLowerCase());
const absoluteOutPackageDir = join(outDir, outWidgetDir);

export default args => {
    const result = args.configDefaultConfig;
    const [jsConfig, mJsConfig] = result;

    // We change the output because range slider widget package was wrongly named with uppercase R and S in the past.
    jsConfig.output.file = undefined;
    mJsConfig.output.file = undefined;
    jsConfig.output.dir = absoluteOutPackageDir;
    mJsConfig.output.dir = absoluteOutPackageDir;

    return result.map((config, index) => {
        if (index === 0) {
            config.plugins = [
                ...config.plugins,
                dynamicImportVars({
                    // options
                })
            ];
        }
        config.plugins.push(json());
        return config;
    });
};

// function copyTinyMCEDirToDist(outDir) {
//     return command([
//         async () => {
//             return copy(dirname(require.resolve("tinymce")), outDir, {
//                 transform: src => {},
//                 overwrite: true,
//                 filter: [
//                     "**/skins/content/default/*",
//                     "**/skins/ui/oxide/*.min.*",
//                     "**/plugins/**/*.*",
//                     "**/tinymce.js"
//                 ]
//             });
//         }
//     ]);
// }
