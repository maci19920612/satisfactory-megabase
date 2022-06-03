const parseSaveFile = require("./save-file-parse");
const gitHelper = require("./git-helper");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const yesno = require("yesno");
const childProcess = require("child_process");

const rootDirectory = "../../";

const sabeFileDirectory = "Saves";
const saveFileDirectoryPath = path.join(rootDirectory, sabeFileDirectory);

const lockFile = "lock";
const lockFilePath = path.join(rootDirectory, lockFile);

async function main() {
    let config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "config.json")));
    gitHelper.reset();
    gitHelper.pull();
    if (fs.existsSync(lockFilePath)) {
        console.log("lock file is present, someone is sneaky or this shit bugget out!");
        let result = await yesno({
            question: "Do you want to proceeed?: (y|n)"
        });
        if (!result) {
            process.exit();
        }
    }
    fs.writeFileSync(lockFilePath, "");
    gitHelper.add();
    gitHelper.commit("Lock file creation");
    gitHelper.push();
    fs.readdirSync(saveFileDirectoryPath).forEach(file => {
        fs.copyFileSync(path.join(saveFileDirectoryPath, file), path.join(config.saveLocation, file))
    });
    try {
        childProcess.execFileSync(config.installLocation);
    } catch (ex) {
        //Ignored
    }
    await new Promise((resolve, reject) => {
        let ii = setInterval(() => {
            let contains = childProcess.execSync("tasklist").toString("utf-8").split("\n").some(item => item.includes("FactoryGame.exe"));
            if(contains){
                clearInterval(ii);
                resolve();
            }
        }, 1000);
    });
    fs.unlinkSync(lockFilePath);
    let promises = fs.readdirSync(config.saveLocation).filter(file => file.includes(".sav")).map(saveFile => {
        return parseSaveFile(path.join(config.saveLocation, saveFile));
    });
    let updatedSaveFiles = (await Promise.all(promises)).filter(saveData => saveData.sessionName == config.sessionName).map(saveData => saveData.file)
    updatedSaveFiles.forEach(updatedSaveFile => {
        fs.copyFileSync(updatedSaveFile, path.join(saveFileDirectoryPath, path.basename(updatedSaveFile)))
    });
    gitHelper.add();
    gitHelper.commit("Update save files");
    gitHelper.push();
}



main().catch(error => console.error(error));