import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';
import {pascalCaseToKebabCase} from "~/utils/alpha";
import JSZip from "jszip";
import {saveAs} from 'file-saver';
import {getExpandedIRI, jsonldToState, parseContext, stateToJsonld} from "~/utils/json";
import _ from 'lodash';
import * as jsonldParser from 'jsonld';
import {extractJson} from "~/utils/jsonld";
import {handleParameters} from "~/middleware/packages";


const baseUrl = 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/';
const baseContext = [`${baseUrl}runner/^1.0.0/components/context.jsonld`];

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
 * Handles the default value of a parameter
 * @param range: The range of the parameter
 * @param defaultValue: The default value of the parameter
 */
function handleDefault(range: any, defaultValue: any) {
    switch (range) {
        case 'cc:Logger': {
            return defaultValue['@type'];
        }
        case 'cc:Bus': {
            return defaultValue['@id'];
        }
        default: {
            if (typeof defaultValue === 'string')
                return defaultValue;
            else
                return JSON.stringify(defaultValue);
        }
    }
}

/**
 * Returns the default state without any actors or mediators
 */
function getDefaultState() {
    return {
        id: 'urn:comunica:my',
        busGroups: [],
        actors: {},
        mediators: [],
        createdActors: {},
        createdMediators: [],
        loggers: [],
        buses: [],
        context: new Set(baseContext)
    }
}

/**
 * Retrieve the bus group of a given actor
 * @param busGroups: The available bus groups
 * @param actor: The actor to retrieve the bus group from
 */
function getBusGroupOfActor(busGroups: any, actor: string) {
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
    addBusGroups(state: any, busGroups: BusGroup[]) {
        state.busGroups = busGroups;
        busGroups.forEach((bs) => {
            state.createdActors[bs.busGroupName] = []
        });
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

    createNewMediator(state: any, mediator: any) {
        const createdMediators = state.createdMediators;
        createdMediators.push(mediator);
        Vue.set(state, 'createdMediators', createdMediators);
    },

    addActor(state: any, payload: any) {
        const updatedAddedActors = state.createdActors[payload.busGroup];
        updatedAddedActors.push(payload.actor);
        delete state.createdActors[payload.busGroup];
        Vue.set(state.createdActors, payload.busGroup, updatedAddedActors);
    },

    deleteActor(state: any, payload: any) {
        Vue.set(state.createdActors, payload.busGroup, state.createdActors[payload.busGroup].filter((a: any) => a['@id'] !== payload['@id']));
    },

    deleteMediator(state: any, mediator: string) {
        Vue.set(state, 'createdMediators', state.createdMediators.filter((m: any) => m['@id'] !== mediator));
    },

    changeParameterValueOfActor(state: any, payload: any) {
        const currentBusGroup = state.createdActors[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload['@id']);
        const indexParameter = currentBusGroup[indexActor].parameters.findIndex(
            (x: any) => x['@id'] === payload.parameterName
        );

        state.createdActors[payload.busGroup][indexActor].parameters[indexParameter].value = payload.value;
    },

    changeParameterValueOfMediator(state: any, payload: any) {
        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload['@id']);
        state.createdMediators[indexMediator].parameters[payload.parameterName].value = payload.value;

    },

    changeIDOfActor(state: any, payload: any) {
        const currentBusGroup = state.createdActors[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload.currentID);
        state.createdActors[payload.busGroup][indexActor]['@id'] = payload.newID;
    },

    changeIDOfMediator(state: any, payload: any) {
        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload.currentID);
        state.createdMediators[indexMediator]['@id'] = payload.newID;
    },

    addToContext(state: any, payload: any) {
        if (typeof payload === 'string')
            state.context.add(payload);
        else
            payload.forEach((x: string) => state.context.add(x));
    },

    resetState(state: any) {
        state.context = new Set(baseContext);
        state.createdMediators = [];
        Object.keys(state.createdActors).forEach(key => {
            state.createdActors[key] = [];
        });
    },

    changeID(state: any, id: string) {
        state.id = id;
    }
}

export const actions = {

    addMediator({state, commit}: any, payload: any) {
        const selectedMediatorType =  _.cloneDeep(state.mediators.find((m: any) => m.name === payload.mediator));
        commit('addToContext', selectedMediatorType.context);
        commit('createNewMediator', {
            type: payload.mediator,
            '@id': payload.id ? payload.id : `${payload.mediator}#${state.createdMediators.length}`,
            parameters: selectedMediatorType.parameters,
            name: payload.mediator
        });
    },

    async fetchArgumentsOfActor({state, commit}: any, payload: any) {
        const actorName = pascalCaseToKebabCase(payload.actorName);
        const actorPart = payload.actorName.slice(`Actor${payload.busGroup}`.length)
        const actorConfig = await (this as any).$axios.$get(
            `${baseUrl}${actorName}/^1.0.0/components/Actor/${payload.busGroup}/${actorPart}.jsonld`
        );

        let componentContent = actorConfig.components[0];
        let atContext = actorConfig['@context'];
        const normalizedContext = await parseContext(atContext);

        let parameters: any = {};

        commit('addToContext', atContext);

        while (componentContent.extends) {
            const parentComponents = Array.isArray(componentContent.extends) ? componentContent.extends : [componentContent.extends];
            for (const p of parentComponents) {
                const componentURL = getParentComponentUrl(getExpandedIRI(normalizedContext, p));
                let componentContentRaw = await (this as any).$axios.$get(componentURL);
                componentContent = componentContentRaw.components[0];
                if (componentContent.parameters) {
                    parameters.push(...componentContent.parameters);
                }
            }
        }

        // for (const [i, p] of parameters.entries()) {
        //     if (p.hasOwnProperty('default'))
        //         parameters[i].value = handleDefault(p.range, p.default);
        //     if (p.hasOwnProperty('defaultScoped'))
        //         parameters[i].value = handleDefault(p.range, p.defaultScoped.defaultScopedValue);
        // }
    },


    mapMediatorToState({state, commit, dispatch}: any, payload: any) {
        dispatch('addMediator', {
            mediator: payload['@type'],
            id: payload['@id']
        });

        for (const parameter of Object.keys(payload)) {
            if (parameter !== '@id' && parameter !== '@type') {
                commit('changeParameterValueOfMediator', {
                    '@id': payload['@id'],
                    parameterName: parameter,
                    value: parameter === 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/core/Mediator/bus' ?
                        payload[parameter]['@id'] : payload[parameter]
                });
            }
        }
    },

    async mapActorToState({state, commit, dispatch}: any, payload: any) {

        dispatch('addActor', {
            actorName: payload['@type'],
            '@id': payload['@id'],
            busGroup: getBusGroupOfActor(state.busGroups, payload['@type']),
            parameters: payload
        });
    },

    addActor(context: any, payload: any) {

        let parameters: any = {};



        if (payload.parameters) {
            for (let key of Object.keys(payload.parameters)) {
                if (key[0] !== '@') {
                    let p = payload.parameters[key];
                    let v = undefined;

                    if (p.range === 'cc:Logger')
                        v = payload.parameters[p['@id']]['@type'];
                    else if (p.range === 'cc:Bus' || p['@id'].includes('mediator'))
                        v = payload.parameters[p['@id']]['@id'];
                    else
                        v = JSON.stringify(payload.parameters['@id']);

                    parameters[p] = {value: v}
                }
            }
        }

        const actor = {
            actorName: payload.actorName,
            '@id': payload['@id'],
            parameters: parameters
        };

        context.commit('addActor', {busGroup: payload.busGroup, actor: actor});
    },

    async downloadZip(context: any) {
        let zip = new JSZip();
        zip.file('config.json', await stateToJsonld(context.state));
        zip.generateAsync({type: 'blob'}).then(
            content => {
                saveAs(content, 'engine.zip');
            }
        );
    },

    async uploadZip(context: any, file: any) {

        // TODO: update
        let zip = new JSZip();
        zip.loadAsync(file).then(function(z) {
            zip.file('config.json').async('text').then(function(json) {
                context.commit('resetState');
                const s = jsonldToState(JSON.parse(json));
                context.commit('changeID', s.id);
                context.commit('addToContext', s.context);
                // Handle mediators
                s.mediators.forEach((mediator: any) => {
                    const mediatorType = _.cloneDeep(context.state.mediators.find((m: any) => m.name === mediator['@type']));
                    for (let param of mediatorType.parameters) {
                        if (mediator.hasOwnProperty(param['@id'])) {
                            if (param.range === 'cc:Bus')
                                param.value = mediator[param['@id']]['@id'];
                            else
                                param.value = mediator[param['@id']];
                        }
                    }
                    // TODO: fix
                    context.commit('createNewMediator', {
                        type: mediator['@type'],
                        '@id': mediator['@id'],
                        parameters: mediatorType.parameters
                    });
                });
                // Handle actors
                s.actors.forEach((actor: any) => {
                    context.dispatch('addActor', {
                        actorName: actor['@type'],
                        '@id': actor['@id'],
                        busGroup: getBusGroupOfActor(context.state.busGroups, actor['@type']),
                        parameters: actor
                    });
                });
            });
        }, function() {alert('Invalid zip.')});
    },

    async importPreset({commit, dispatch}: any, presetLink: any) {
        // First reset everything
        commit('resetState');

        const t = performance.now();
        const data = await (this as any).$axios.$get(presetLink);
        const dataExpanded: any = await jsonldParser.expand(data);

        let mediatorsAll: any[] = [];
        let actorsAll: any[] = [];

        let imports = dataExpanded[0]['http://www.w3.org/2002/07/owl#imports'].map(
            (d: any) => (this as any).$axios.$get(d['@id'])
        );

        await Promise.all(imports).then(async (fetchedImports: any) => {
            await Promise.all(fetchedImports.map((fi: any) => extractJson(fi))).then((eps: any) => {
                eps.forEach(({atContext, actors, mediators}: any) => {
                    commit('addToContext', atContext);
                    actorsAll.push(...actors);
                    mediatorsAll.push(...mediators);
                });
            });
        });

        mediatorsAll.forEach(m => {
            dispatch('mapMediatorToState', m);
        });

        actorsAll.forEach(a => {
            dispatch('mapActorToState', a);
        })

        console.log(`Time for loading preset: ${performance.now() - t}`);
    }

}
