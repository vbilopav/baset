import { sync as spawnSync } from 'cross-spawn';
import fs from 'fs';
import path from 'path';

export = fs.readdirSync(__dirname)
    .filter(source => fs.lstatSync(path.join(__dirname, source)).isDirectory())
    .filter(project => project !== 'scaffolded-project')
    .map(project => {
        const cwd = path.resolve(__dirname, `./${project}`);
        const testProccess = spawnSync('npm', ['test'], { cwd, encoding: 'utf8' });

        return {
            project,
            stdout: testProccess.stdout.split('\n')
                // we don't need to check npm tasks output (like `> baset` or `> path/to/node.exe index.js`)
                .filter(line => !line.startsWith('>'))
                .filter(line => !line.startsWith('PixiJS'))
                .map(line => line
                    .replace(/\(.*m?s\)/, '') // we don't need timing output from `tap-diff` here
                    .replace(/(✔|√)/, ' ')), // `tap-diff` has different signs on win and *nix
            stderr: testProccess.stderr.split('\n')
                // we don't need to check npm warn about node version used in script
                .filter(line => !line.search('`--scripts-prepend-node-path`')),
        };
    });
