let [ , , message ] = process.argv

const { exec  } = require("child_process")

const cmd = function(s) {
    exec(s, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
}

cmd(`git status`)
cmd(`git add -A`)
let s = message || `Update files`
cmd(`git commit -am "${s}"`)
