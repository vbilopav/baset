const { sync: spawnSync } = require('cross-spawn');
const path = require('path');

const results = [
    'sample-project',
    'typescript-project',
].map(project => {
    const testProccess = spawnSync('npm', ['test'], { cwd: path.resolve(__dirname, `./${project}`), encoding: 'ascii' });
    const acceptProccess = spawnSync('npm', ['run', 'accept'], { cwd: path.resolve(__dirname, `./${project}`), encoding: 'ascii' });
    return {
        project,
        test: {
            stdout: testProccess.stdout.split('\n')
                .filter((line) => !line.startsWith('>')), // we don't need to check npm tasks output (like `> baset` or `> path/to/node.exe index.js`)
            stderr: testProccess.stderr.split('\n')
                .filter((line) => !line.search('`--scripts-prepend-node-path`')), // we don't need to check npm warn about node version used in script
        },
        accept: {
            stdout: acceptProccess.stdout.split('\n')
                .filter((line) => !line.startsWith('>')), // we don't need to check npm tasks output (like `> baset` or `> path/to/node.exe index.js`)
            stderr: acceptProccess.stderr.split('\n')
                .filter((line) => !line.search('`--scripts-prepend-node-path`')), // we don't need to check npm warn about node version used in script
        }
    }
});

module.exports = results;
