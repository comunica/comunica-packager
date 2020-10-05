import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';
import {pascalCaseToKebabCase} from "~/utils/alpha";
import JSZip from "jszip";
import {saveAs} from 'file-saver';
import {getExpandedIRI, jsonldToState, parseContext, stateToJsonld} from "~/utils/json";
import _ from 'lodash';
import * as jsonldParser from 'jsonld';
import {handleParameters} from "~/middleware/packages";


const baseUrl = 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/';
const baseContext = [`${baseUrl}runner/^1.0.0/components/context.jsonld`];
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
};

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
        sets: ['default'],
        currentSet: 'default'
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
        if (typeof payload === 'string')
            state.context[state.currentSet].add(payload);
        else
            payload.forEach((x: string) => state.context[state.currentSet].add(x));
    },

    addSet(state: any, set: string) {
        state.sets.push(set);
        state.context[set] = new Set();
    },

    setSelectedSet(state: any, set: string) {
        state.currentSet = set;
    },

    removeSet(state: any, set: string) {
        if (set === state.currentSet)
            state.currentSet = 'default'

        state.sets.forEach( (item: string, index: number) => {
            if(item === set) state.sets.splice(index,1);
        });
        delete state.context[set];
    },

    resetState(state: any) {
        state.context = {'default': new Set(baseContext)}
        state.createdMediators = [];
        Object.keys(state.createdActors).forEach(key => {
            state.createdActors[key] = [];
        });
        state.sets = ['default'];
        state.currentSet = 'default';
    },

    changeID(state: any, id: string) {
        state.id = id;
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
            set: state.currentSet,
        };

        commit('addActor', {busGroup: payload.busGroup, actor: actor});
    },

    addMediator({state, commit}: any, payload: any) {
        const selectedMediatorType =  _.cloneDeep(state.mediators.find((m: any) => m.name === payload.mediator));
        commit('addToContext', selectedMediatorType.context);
        commit('createNewMediator', {
            type: payload.mediator,
            '@id': payload.id ? payload.id : `${payload.mediator}#${state.createdMediators.length}`,
            parameters: selectedMediatorType.parameters,
            name: payload.mediator,
            set: state.currentSet,
        });
    },

    mapMediatorToState({state, commit, dispatch}: any, payload: any) {
        dispatch('addMediator', {
            mediator: payload['@type'],
            id: payload['@id']
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
            parameters: payload.parameters
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

        commit('addToContext', atContext);

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
        let bin = zip.folder('bin');
        for (const v of ['query.js', 'http.js', 'query-dynamic.js']) {
            bin.file(v, await (this as any).$axios.$get(`/comunica-packager/output/bin/${v}`));
        }
        bin.file('query.js', await (this as any).$axios.$get('/comunica-packager/output/bin/query.js'));
        zip.file('.gitignore', await (this as any).$axios.$get('/comunica-packager/output/.gitignore'));
        zip.file('.npmignore', await (this as any).$axios.$get('/comunica-packager/output/.npmignore'));
        let config = zip.folder('config');

        if (context.state.sets.length > 1) {
            let sets = config.folder('sets');
            config.file('config-default.json', 'jeepse');
        } else {
            // config.file('config-default.json', await stateToJsonld(context.state));
            config.file('config-default.json', '"test": "jeepse"');
        }

        zip.generateAsync({type: 'blob'}).then(
            content => {
                saveAs(content, 'engine.zip');
            }
        );
    },

    async uploadZip({commit, dispatch}: any, file: any) {

        let zip = new JSZip();
        zip.loadAsync(file).then(function(z) {
            zip.file('config.json').async('text').then(async function(json) {
                commit('resetState');
                const s = await jsonldToState(JSON.parse(json));
                commit('changeID', s.id);
                commit('addToContext', s.context);
                // Handle mediators
                for (const mediator of s.mediators) {
                    dispatch('mapMediatorToState', mediator);
                }
                // Handle actors
                for (const actor of s.actors) {
                    dispatch('mapActorToState', actor);
                }
            });
        }, function() {alert('Invalid zip.')});
    },

    async importPreset({commit, dispatch}: any, presetLink: any) {
        // First reset everything
        commit('resetState');

        const data = await (this as any).$axios.$get(presetLink);
        const dataExpanded: any = await jsonldParser.expand(data);
        let imports = dataExpanded[0]['http://www.w3.org/2002/07/owl#imports'];

        // Use entries() to get index for potential progress bar when fetching
        for (const [index, imp] of imports.entries()) {
            const fetchedImp = await (this as any).$axios.$get(imp['@id']);
            const s = await jsonldToState(fetchedImp);
            commit('addToContext', s.context);

            // Handle mediators
            for (const mediator of s.mediators)
                dispatch('mapMediatorToState', mediator);
            // Handle actors
            for (const actor of s.actors)
                dispatch('mapActorToState', actor);
        }
    }
}
