const extract = require("extract-zip")
const fs = require("fs-extra")
const got = require("got")
const path = require("path")
const os = require("os")
const log = require("@ui5/logger").getLogger("builder:customtask:mvn-lib-provider")

async function download(url, to) {
    return new Promise((resolve, reject) => {
        const jarStream = fs.createWriteStream(to)
        got.stream(url).pipe(jarStream)
        jarStream.on("finish", resolve)
    })
}
/**
 * downloads a ui5 library packed as a .jar and provides it to the ui5 serve runtime
 *
 * @param {Object} parameters Parameters
 * @param {DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} parameters.options.projectNamespace Project namespace
 * @param {string} [parameters.options.archiveName] ZIP archive name (defaults to project namespace)
 * @param {string} [parameters.options.additionalFiles] List of additional files to be included
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async function ({ workspace, dependencies, options }) {
    // debug mode?
    const isDebug = options?.configuration?.debug || true

    // safeguard params
    if (!options?.configuration?.jar || !options?.configuration?.targetDir) {
        log.error("no input jar or no output dir configured -> exiting!")
        return
    }

    // download file via got
    const _tmpDownloadDir = await fs.mkdtemp("mvn-lib-provider-download")
    const tmpDownloadDir = path.resolve(os.tmpdir(), _tmpDownloadDir)
    await fs.mkdir(tmpDownloadDir)
    const _jar = `${tmpDownloadDir}/jar.jar`
    await download(options.configuration.jar, _jar)

    isDebug ? log.info(`downloaded jar to ${_jar}`) : null

    // extract jar to tmp location
    const _tmpDir = await fs.mkdtemp("mvn-lib-provider")
    const tmpDir = path.resolve(os.tmpdir(), _tmpDir)
    await extract(_jar, { dir: tmpDir })

    isDebug ? log.info(`extracted jar to ${tmpDir}`) : null

    // either the entire unjar'ed content or subfolders within into target dir
    let dirsToMove = []
    if (options.configuration?.subDirs) {
        dirsToMove = options.configuration?.subDirs.map((dir) => path.resolve(`${tmpDir}`, dir))
    } else {
        dirsToMove.push(tmpDir)
    }

    const targetDir = path.resolve(options.configuration.targetDir)
    isDebug ? log.info(`received these dirs:\n${dirsToMove.join(", ")}\nto move into\n${targetDir}`) : null

    // actual async move
    for (const dir of dirsToMove) {
        await fs.move(dir, targetDir, { overwrite: true })
    }
    isDebug ? log.info(`done moving ${dirsToMove.length} dirs!`) : null
}
