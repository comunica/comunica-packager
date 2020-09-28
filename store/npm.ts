const defaultPackage = {
    'name': 'temp name',
    'version': '1.0.0',
    'description': '',
    'main': 'index.js',
    'scripts': {
        "prepublishOnly": "npm run build",
        "build:engine": "comunica-compile-config config/config-default.json > engine-default.js",
        "build:lib": "tsc",
        "build": "npm run build:lib && npm run build:engine",
        "postinstall": "npm run build"
    },
    'dependencies': {
        "@comunica/actor-init-sparql": "^1.17.0",
    },
    'devDependencies': {
        "typescript": "^4.0.0"
    },
    'license': 'MIT'
}


function getDefaultState() {
    return {
        'package': defaultPackage,
        'bin/query.js': `#!/usr/bin/env node
                         import {runArgsInProcessStatic} from "@comunica/runner-cli";
                         runArgsInProcessStatic(require('../engine-default.js'));`,
        'bin/http.js': `#!/usr/bin/env node
                        import {HttpServiceSparqlEndpoint} from "@comunica/actor-init-sparql";
                        HttpServiceSparqlEndpoint.runArgsInProcess(process.argv.slice(2), process.stdout, process.stderr,
                        __dirname + '/../', process.env, __dirname + '/../config/config-default.json', () => process.exit(1));`,
        'bin/query-dynamic.js': `#!/usr/bin/env node
                                 import {runArgsInProcess} from "@comunica/runner-cli";
                                 runArgsInProcess(__dirname + '/../', __dirname + '/../config/config-default.json');`,

    };
}

export const state = getDefaultState();