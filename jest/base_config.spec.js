const fs = require('fs');
const path = require('path');
const newEngineDynamic = require('@comunica/actor-init-sparql').newEngineDynamic;

const downloadFolder = path.join(__dirname, '..', 'cypress', 'downloads', 'engine');

test('engine folder contains necessary files and subfolders', () => {
    const engineFolderFiles = fs.readdirSync(downloadFolder);
    expect(engineFolderFiles).toContain('package.json');
    expect(engineFolderFiles).toContain('.gitignore');
    expect(engineFolderFiles).toContain('.npmignore');
    expect(engineFolderFiles).toContain('bin');
    expect(engineFolderFiles).toContain('config');
    expect(engineFolderFiles).toContain('components');
    expect(engineFolderFiles).toContain('tsconfig.json');
});

test('config folder contains config-default.json', () => {
    const configFolder = fs.readdirSync(downloadFolder + '/config');
    expect(configFolder).toContain('config-default.json');
});

test('engine is correctly set up in dynamic engine', async () => {
    const myEngine = await newEngineDynamic({
        configResourceUrl: downloadFolder + '/config/config-default.json'
    });

    const result = await myEngine.query(`
        SELECT ?s ?p ?o WHERE {
        ?s ?p <http://dbpedia.org/resource/Belgium>.
        ?s ?p ?o
        } LIMIT 100`, {
            sources: ['http://fragments.dbpedia.org/2015/en'],
    });

    return result.bindings().then(bindings => {
        expect(bindings[0].get('?s').value).toBe('http://dbpedia.org/resource/Alfa_Romeo_1900');
        expect(bindings[0].get('?p').value).toBe('http://dbpedia.org/ontology/assembly');
    }).catch(r => console.error(r));
});