const childProcess = require("child_process");

module.exports = {
    pull(){
        console.log("Git: pull");
        childProcess.execSync("git pull",
        {
            cwd: process.cwd()
        })
    },
    add(){
        console.log("Git: add all");
        childProcess.execSync("git add --all", {
            cwd: process.cwd()
        });
    },
    commit(message){
        console.log("Git: commit with message: ", message);
        childProcess.execSync(`git commit -m '${message}'`, {
            cwd: process.cwd()
        });
    },
    push(){
        console.log("Git: push");
        childProcess.execSync("git push origin master", {
            cwd: process.cwd()
        });
    },
    reset(){
        console.log("Git: reset");
        childProcess.execSync("git add --all && git reset --hard", {
            cwd: process.cwd()
        });
    }
};