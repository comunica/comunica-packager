#!/usr/bin/env node
import {HttpServiceSparqlEndpoint} from "@comunica/actor-init-sparql";
HttpServiceSparqlEndpoint.runArgsInProcess(process.argv.slice(2), process.stdout, process.stderr,
    __dirname + '/../', process.env, __dirname + '/../config/config-default.json', () => process.exit(1));