const childProcess = require("child_process");

module.exports = {
    pull(){
        console.log("Git: pull");
        childProcess.execSync("git pull")
    },
    add(){
        console.log("Git: add all");
        childProcess.execSync("git add --all");
    },
    commit(message){
        console.log("Git: commit with message: ", message);
        childProcess.execSync(`git commit -m '${message}'`);
    },
    push(){
        console.log("Git: push");
        childProcess.execSync("git push origin master");
    },
    reset(){
        console.log("Git: reset");
        childProcess.execSync("git add --all && git reset --hard");
    }
};