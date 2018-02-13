import path from 'path';
import { isPrimitive } from 'util';
import { TestGroup } from './testGroup';
import { IDictionary, isExists, readFile, unlink, writeFile } from './utils';

export class Tester {
    private testGroups: TestGroup[];

    // tslint:disable-next-line:no-any
    constructor(plugins: IDictionary<string[]>, pluginsOptions: IDictionary<any>) {
        this.testGroups = this.initPlugins(plugins, pluginsOptions);
    }

    test(specs: string[], baselines: string[]) {
        return specs.map(this.testSpec);
    }
    accept(files: string[]) {
        return files.map(this.acceptBase);
    }

    private testSpec = async (name: string) => {
        const reader = this.testGroups.find(group => group.match(name));
        if (!reader) throw new Error(`No reader defined for ${name}!`);
        const output = (await reader.read(name)).replace(/\r?\n|\r/g, '\n').trim();
        const ext = path.extname(name);
        const baselinePath = path.resolve(name.replace(new RegExp(`${ext}$`), '.base'));
        const baselineValue = await isExists(baselinePath)
            ? (await readFile(baselinePath, { encoding: 'utf-8' })).replace(/\r?\n|\r/g, '\n').trim()
            : false;
        await writeFile(path.resolve(`${baselinePath}.tmp`), output);

        return {
            name,
            isPassed: baselineValue === output,
            expected: baselineValue || '',
            actual: output,
        };
    }

    private acceptBase = async (name: string) => {
        const baseline = await readFile(path.resolve(name), { encoding: 'utf-8' });
        const filePath = name.replace(/.tmp$/, '');
        await writeFile(path.resolve(filePath), baseline);
        await unlink(path.resolve(name));

        return filePath;
    }

    // tslint:disable-next-line:no-any
    private initPlugins = (plugins: IDictionary<string[]>, pluginsOptions: IDictionary<any>) =>
        Object.keys(plugins).map(key => {
            const firstModule = plugins[key].slice(0, 1)[0];
            const envModule = firstModule.includes('-env-') && firstModule;
            const baseliner = plugins[key].slice(-1)[0];
            const readers = plugins[key].slice(Number(!!envModule), -1);

            return new TestGroup(key, readers, baseliner, pluginsOptions, envModule || undefined);
        })
}