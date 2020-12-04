const utils = require("./utils");
const log = require("@ui5/logger").getLogger("builder:customtask:i18ncheck");

module.exports = async function ({ workspace, dependencies, options }) {


    let propertyFilesP = workspace.byGlob(['**/i18n*.properties', '!**/node_modules/**'])
    let xmlviewFilesP = workspace.byGlob(['**/*.view.xml', '!**/node_modules/**']);

    let propertyFiles, xmlviewFiles
    try {
        [propertyFiles, xmlviewFiles] = await Promise.all([propertyFilesP, xmlviewFilesP]);
    } catch (e) {
        log.error(`Couldn't read files: ${e}`);
    }

    // Start all the async work concurrently

    //: PromiseLike<any>[]
    let xmlviewFileContentsP = []
    for (let resource of xmlviewFiles) {
        let asyncWorkForContent = async () => {
            options.configuration && options.configuration.debug && log.info(`Reading XML view: ${resource.getPath()} .`);
            let fileContent = await resource.getString();
            return utils.readI18nUsageFromXML(fileContent, resource.getPath());
        }
        xmlviewFileContentsP.push(asyncWorkForContent());
    }

    let xmlReadingResultArr;
    try {
        xmlReadingResultArr = await Promise.all(xmlviewFileContentsP);
    } catch (e) {
        log.error(`Error while reading content of XML view files: ${e}`);
    }

    let i18nUsageXMLArr = Array.prototype.concat.apply([], xmlReadingResultArr);


    let i18nAll = {};
    i18nUsageXMLArr.forEach((i18nUsage) => {
        if (!i18nAll.hasOwnProperty(i18nUsage.value)) {
            i18nAll[i18nUsage.value] = {};
            i18nAll[i18nUsage.value]["key"] = i18nUsage.value;
            i18nAll[i18nUsage.value]["usedIn"] = new Set([i18nUsage.file]);
        } else {
            i18nAll[i18nUsage.value]["usedIn"].add(i18nUsage.file);
        }
    });

    //: PromiseLike<any>[]
    let propertyFileContentsP = []

    for (let resource of propertyFiles) {
        let asyncWorkForContent = async () => {
            options.configuration && options.configuration.debug && log.info(`Reading i18n.properties file: ${resource.getPath()} .`);
            let fileContent = await resource.getString();
            let properties = utils.readProperties(fileContent);

            let notFoundProperties = [];
            // let notUsedProperties = [];
            //Look for undefined properties
            Object.keys(i18nAll).forEach((i18nKey) => {
                //let i18n = i18nAll[i18nKey];
                if (!properties.hasOwnProperty(i18nKey)) {
                    notFoundProperties.push(i18nAll[i18nKey]);
                }
            });

            notFoundProperties.forEach((i18nUsage) => {
                log.warn(`🌍 Missing translation key ${i18nUsage.key} in: ${resource.getPath()}`);
                i18nUsage.usedIn.forEach((usedIn) => {
                    log.warn(`---☝️ Used in view: ${usedIn} `);
                });

            });

            return
        }
        propertyFileContentsP.push(asyncWorkForContent());
    }


    try {
        await Promise.all(propertyFileContentsP);
    } catch (e) {
        log.error(`Error while reading content of i18n property files: ${e}`);
    }


};