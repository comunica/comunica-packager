import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';
import {pascalCaseToKebabCase} from "~/utils/alpha";
import JSZip from "jszip";
import {saveAs} from 'file-saver';
import {defaultJsonld, getExpandedIRI, jsonldToState, parseContext, stateToJsonld} from "~/utils/json";
import _ from 'lodash';
import * as jsonldParser from 'jsonld';
import {handleParameters} from "~/middleware/packages";


const baseUrl = 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/';
const baseContext = [`${baseUrl}runner/^1.0.0/components/context.jsonld`];
const defaultPackage = {
    "name": '%package_name%',
    "version": '1.0.0',
    "description": '',
    "main": 'index.js',
    "scripts": {
        "prepublishOnly": "npm run build",
        "build:engine": "comunica-compile-config config/config-default.json > engine-default.js",
        "build:lib": "tsc",
        "build": "npm run build:lib && npm run build:engine",
        "postinstall": "npm run build"
    },
    "dependencies": {
        "@comunica/actor-init-sparql": "^1.17.0",
    },
    "devDependencies": {
        "typescript": "^4.0.0"
    },
    "license": "MIT",
    "lsd:module": "https://linkedsoftwaredependencies.org/bundles/npm/%package_name%",
    "lsd:contexts": {
        "https://linkedsoftwaredependencies.org/bundles/npm/%package_name%/^1.0.0/components/context.jsonld": "components/context.jsonld"
    },
    "lsd:importPaths": {
        "https://linkedsoftwaredependencies.org/bundles/npm/%package_name%/^1.0.0/components/": "components/",
        "https://linkedsoftwaredependencies.org/bundles/npm/%package_name%/^1.0.0/config/": "config/"
    },
    "bin": {
        "my-comunica": "./bin/query.js",
        "my-comunica-http": "./bin/http.js",
        "my-comunica-dynamic": "./bin/query-dynamic.js"
    }
};

function baseSet() {
    return [{name: 'default', loaded: true, edited: false}];
}

/**
 * The extend part of an actor isn't fully correct which is handled here
 * @param extend: The wrong URL of a parent actor
 */
function getParentComponentUrl(extend: string): any {
    let urlParts = extend.split('/');
    urlParts.splice(7, 0, '^1.0.0', 'components');
    return urlParts.join('/') + '.jsonld';
}

/**
 * Returns the default state without any actors or mediators
 */
function getDefaultState() {
    return {
        id: 'urn:comunica:my',
        busGroups: [],
        mediatorPackages: [],
        actors: {},
        mediators: [],
        createdActors: {},
        createdMediators: [],
        loggers: [],
        buses: [],
        context: {
            'default': new Set(baseContext),
        },
        npmPackage: defaultPackage,
        sets: baseSet(),
        currentSet: 'default',
        isPresetLoading: false,
        packageName: 'my-package-test'
    }
}

/**
 * Retrieve the bus group of a given actor
 * @param busGroups: The available bus groups
 * @param actor: The actor to retrieve the bus group from
 */
export function getBusGroupOfActor(busGroups: any, actor: string) {
    let b = '';

    busGroups.forEach((busGroup: any) => {
        if (busGroup.actors.includes(actor)) {
            b = busGroup.busGroupName;
        }
    });

    return b;
}

export const state = getDefaultState();

export const mutations = {

    /**
     * Global state mutations
     */

    addBusGroups(state: any, busGroups: BusGroup[]) {
        state.busGroups = busGroups;
        busGroups.forEach((bs) => {
            state.createdActors[bs.busGroupName] = []
        });
    },

    addMediatorPackages(state: any, packages: string[]) {
        state.mediatorPackages = packages;
    },

    addMediators(state: any, mediators: string[]) {
        state.mediators = mediators;
    },

    addLoggers(state: any, loggers: string[]) {
        state.loggers = loggers;
    },

    addBuses(state: any, buses: string[]) {
        state.buses = buses;
    },

    addToContext(state: any, payload: any) {
        if (Array.isArray(payload.context))
            payload.context.forEach((x: string) => state.context[payload.set].add(x));
        else
            state.context[payload.set].add(payload.context);
    },

    addSet(state: any, set: any) {
        state.sets.push(set);
        state.context[set.name] = new Set();
    },

    setSelectedSet(state: any, set: string) {
        state.currentSet = set;
    },

    removeSet(state: any, set: string) {
        if (set === state.currentSet)
            state.currentSet = 'default'

        state.sets.forEach( (item: any, index: number) => {
            if(item.name === set) state.sets.splice(index,1);
        });
        delete state.context[set];
    },

    resetState(state: any) {
        state.context = {'default': new Set(baseContext)}
        state.createdMediators = [];
        Object.keys(state.createdActors).forEach(key => {
            state.createdActors[key] = [];
        });
        state.sets = baseSet();
        state.currentSet = 'default';
        state.isPresetLoading = false;
    },

    changeID(state: any, id: string) {
        state.id = id;
    },

    setIsPresetLoading(state: any, value: boolean) {
        state.isPresetLoading = value;
    },

    setLoadedOfSet(state: any, set: string) {
        state.sets.forEach((item: any, index: number) => {
            if (item.name === set) state.sets[index].loaded = true;
        });
    },

    setEditedOfSet(state: any, set: string) {
        state.sets.forEach((item: any, index: number) => {
            if (item.name === set) state.sets[index].edited = true;
        });
    },

    setStateEntry(state: any, payload: any) {
        state[payload.key] = payload.value;
    },

    /**
     * Mediator mutations
     */

    createNewMediator(state: any, mediator: any) {
        const createdMediators = state.createdMediators;
        createdMediators.push(mediator);
        Vue.set(state, 'createdMediators', createdMediators);
    },

    deleteMediator(state: any, mediator: string) {
        Vue.set(state, 'createdMediators', state.createdMediators.filter((m: any) => m['@id'] !== mediator));
    },

    changeParameterValueOfMediator(state: any, payload: any) {
        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload['@id']);
        state.createdMediators[indexMediator].parameters[payload.parameterName].value = payload.value;
    },

    changeIDOfMediator(state: any, payload: any) {
        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload.currentID);
        state.createdMediators[indexMediator]['@id'] = payload.newID;
    },

    /**
     * Actor mutations
     */

    addActor(state: any, payload: any) {
        const updatedAddedActors = state.createdActors[payload.busGroup];
        updatedAddedActors.push(payload.actor);
        delete state.createdActors[payload.busGroup];
        Vue.set(state.createdActors, payload.busGroup, updatedAddedActors);
    },

    deleteActor(state: any, payload: any) {
        Vue.set(state.createdActors, payload.busGroup, state.createdActors[payload.busGroup].filter((a: any) => a['@id'] !== payload['@id']));
    },

    addParametersToActor(state: any, payload: any) {
        const currentBusGroup = state.createdActors[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload['@id']);

        for (let k of Object.keys(payload.parameters)) {
            if (state.createdActors[payload.busGroup][indexActor].parameters.hasOwnProperty(k)) {
                let value = _.cloneDeep(state.createdActors[payload.busGroup][indexActor].parameters[k].value);
                state.createdActors[payload.busGroup][indexActor].parameters[k] = payload.parameters[k];
                state.createdActors[payload.busGroup][indexActor].parameters[k].value = value;
            } else {
                state.createdActors[payload.busGroup][indexActor].parameters[k] = payload.parameters[k];
            }
        }

    },

    changeParameterValueOfActor(state: any, payload: any) {
        const currentBusGroup = state.createdActors[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload['@id']);

        state.createdActors[payload.busGroup][indexActor].parameters[payload.parameterName].value = payload.value;
    },

    changeIDOfActor(state: any, payload: any) {
        const currentBusGroup = state.createdActors[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload.currentID);
        state.createdActors[payload.busGroup][indexActor]['@id'] = payload.newID;
    }
}

export const actions = {

    addActor({state, commit}: any, payload: any) {

        let parameters = payload.parameters ? payload.parameters : {};

        const actor = {
            actorName: payload.actorName,
            '@id': payload['@id'],
            parameters: parameters,
            set: payload.set,
        };

        commit('addActor', {busGroup: payload.busGroup, actor: actor});
    },

    addMediator({state, commit}: any, payload: any) {
        const selectedMediatorType =  _.cloneDeep(state.mediators.find((m: any) => m.name === payload.mediator));
        commit('addToContext', {
            context: selectedMediatorType.context,
            set: payload.set,
        });
        commit('createNewMediator', {
            type: payload.mediator,
            '@id': payload.id ? payload.id : `${payload.mediator}#${state.createdMediators.length}`,
            parameters: selectedMediatorType.parameters,
            name: payload.mediator,
            set: payload.set,
        });
    },

    mapMediatorToState({state, commit, dispatch}: any, payload: any) {
        dispatch('addMediator', {
            mediator: payload['@type'],
            id: payload['@id'],
            set: payload.set
        });

        for (const parameter of Object.keys(payload.parameters)) {
            commit('changeParameterValueOfMediator', {
                '@id': payload['@id'],
                parameterName: parameter,
                value: payload.parameters[parameter].value
            });

        }
    },

    mapActorToState({state, commit, dispatch}: any, payload: any) {
        dispatch('addActor', {
            actorName: payload['@type'],
            '@id': payload['@id'],
            busGroup: getBusGroupOfActor(state.busGroups, payload['@type']),
            parameters: payload.parameters,
            set: payload.set
        });
    },

    async fetchArgumentsOfActor({state, commit}: any, payload: any) {
        const actorName = pascalCaseToKebabCase(payload.actorName);
        let busGroup = payload.busGroup;
        if (payload.actorName === 'ActorRdfParseHtml' || payload.actorName === 'ActorRdfParseHtmlScript')
            busGroup = 'RdfParse';
        const actorPart = payload.actorName.slice(`Actor${busGroup}`.length)
        const actorConfig = await (this as any).$axios.$get(
            `${baseUrl}${actorName}/^1.0.0/components/Actor/${busGroup}/${actorPart}.jsonld`
        );

        let componentContent = actorConfig.components[0];
        let atContext = actorConfig['@context'];
        const normalizedContext = await parseContext(atContext);
        let parameters: any = {};

        commit('addToContext', {context: atContext, set: payload.set});

        if (componentContent.parameters)
            handleParameters(normalizedContext, parameters, componentContent.parameters);

        while (componentContent.extends) {
            const parentComponents = Array.isArray(componentContent.extends) ? componentContent.extends : [componentContent.extends];
            for (const p of parentComponents) {
                const componentURL = getParentComponentUrl(getExpandedIRI(normalizedContext, p));
                let componentContentRaw = await (this as any).$axios.$get(componentURL);
                componentContent = componentContentRaw.components[0];
                if (componentContent.parameters)
                    handleParameters(normalizedContext, parameters, componentContent.parameters);
            }
        }

        commit('addParametersToActor', {
            busGroup: payload.busGroup,
            actorName: payload.actorName,
            parameters: parameters,
            '@id': payload['@id']
        });
    },

    async downloadZip(context: any) {
        let zip = new JSZip();

        let components = zip.folder('components');
        components.file('context.jsonld', JSON.stringify({
            "@context": [
                "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^3.0.0/components/context.jsonld",
                {
                    "files-ex": "https://linkedsoftwaredependencies.org/bundles/npm/" + context.state.packageName + "/^1.0.0/"
                }
            ]
        }, null, '  '));

        let bin = zip.folder('bin');
        for (const v of ['query.js', 'http.js', 'query-dynamic.js']) {
            bin.file(v, await (this as any).$axios.$get(`/comunica-packager/output/bin/${v}`));
        }
        bin.file('query.js', await (this as any).$axios.$get('/comunica-packager/output/bin/query.js'));

        zip.file('package.json', JSON.stringify(defaultPackage, null, '  ')
            .replace(/%package_name%/g, context.state.packageName));
        zip.file('.gitignore', await (this as any).$axios.$get('/comunica-packager/output/.gitignore'));
        zip.file('.npmignore', await (this as any).$axios.$get('/comunica-packager/output/.npmignore'));
        let config = zip.folder('config');

        if (context.state.sets.length > 1) {
            let sets = config.folder('sets');
            for (const s of context.state.sets) {
                if (s.name !== 'default' && s.edited)
                    sets.file(s.name + '.json', JSON.stringify(
                        await stateToJsonld(context.state, s.name), null, '  '
                    ));
            }
        }

        config.file('config-default.json', JSON.stringify(await defaultJsonld(context.state), null, '  '));

        zip.generateAsync({type: 'blob'}).then(
            content => {
                saveAs(content, 'engine.zip');
            }
        );
    },

    async uploadZip({commit, dispatch}: any, file: any) {

        // TODO: fix
        let zip = new JSZip();
        // zip.loadAsync(file).then(function(z) {
        //     zip.file('config.json').async('text').then(async function(json) {
        //         commit('resetState');
        //         const s = await jsonldToState(JSON.parse(json));
        //         commit('changeID', s.id);
        //         commit('addToContext', s.context);
        //         // Handle mediators
        //         for (const mediator of s.mediators) {
        //             dispatch('mapMediatorToState', mediator);
        //         }
        //         // Handle actors
        //         for (const actor of s.actors) {
        //             dispatch('mapActorToState', actor);
        //         }
        //     });
        // }, function() {alert('Invalid zip.')});
    },

    async importPreset({commit, dispatch, state}: any, presetLink: string) {
        // First reset everything
        commit('resetState');
        commit('setIsPresetLoading', true);

        const data = await (this as any).$axios.$get(presetLink);
        const dataExpanded: any = await jsonldParser.expand(data);
        let imports = dataExpanded[0]['http://www.w3.org/2002/07/owl#imports'];

        commit('addToContext', {context: data['@context'], set: 'default'});

        const imps = [];

        for (const imp of imports) {
            const splitted = imp['@id'].split('/');
            const setName = splitted[splitted.length-1].slice(0, -5);
            const set = {name: setName, url: imp['@id'], loaded: false, edited: false}
            commit('addSet', set);
            imps.push(set);
        }

        commit('setIsPresetLoading', false);

        for (const imp of imps) {
            const fetchedImp = await (this as any).$axios.$get(imp.url);
            const s = await jsonldToState(fetchedImp, imp.name);
            commit('addToContext', {context: s.context, set: imp.name});

            // Handle mediators
            for (const mediator of s.mediators) {
                mediator.set = imp.name;
                await dispatch('mapMediatorToState', mediator);
            }
            // Handle actors
            for (const actor of s.actors) {
                actor.set = imp.name;
                await dispatch('mapActorToState', actor);
            }
            commit('setLoadedOfSet', imp.name);
        }
    }
}
