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
        inits: [],
        context: {
            'default': _.cloneDeep(baseContext),
        },
        sets: baseSet(),
        currentSet: 'default',
        isPresetLoading: false,
        packageName: 'my-package',
        author: '',
        prefix: 'files-ex',
        description: '',
        appConfig: null,
        currConnectedObjects: [],
        currConnectedSets: [],
        persistUrl: true,
        initialLoad: false
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
        if (localStorage.getItem('areBusGroupsFetched') !== 'true') {
            busGroups.forEach((bs) => {
                state.createdActors[bs.busGroupName] = []
            });
            localStorage.setItem('areBusGroupsFetched', 'true');
        }

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

        if (Array.isArray(payload.context)) {
            payload.context.forEach((x: any) => {
                if (!state.context[payload.set].includes(x))
                    state.context[payload.set].push(x);
            });
        }
        else {
            if (!state.context[payload.set].includes(payload.context))
                state.context[payload.set].push(payload.context);
        }

    },

    addSet(state: any, set: any) {
        state.sets.push(set);
        state.context[set.name] = [];
    },

    setSelectedSet(state: any, set: string) {
        state.currentSet = set;
    },

    removeSet(state: any, set: string) {
        if (set === state.currentSet)
            state.currentSet = 'default'

        state.sets.forEach( (item: any, index: number) => {
            if(item.name === set) state.sets.splice(index, 1);
        });

        Object.keys(state.createdActors).forEach((busGroup: string) => {
            state.createdActors[busGroup].forEach((actor: any, index: number) => {
                if (actor.set === set) state.createdActors[busGroup].splice(index, 1);
            })
        });

        state.createdMediators.forEach((mediator: any, index: number) => {
            if (mediator.set === set) state.createdMediators.splice(index, 1);
        });

        delete state.context[set];

        if (state.persistUrl) {
            (this as any).$router.replace('/');
            state.persistUrl = false;
        }
    },

    resetState(state: any) {
        state.context = {'default': _.cloneDeep(baseContext)}
        state.createdMediators = [];
        Object.keys(state.createdActors).forEach(key => {
            state.createdActors[key] = [];
        });
        state.sets = baseSet();
        state.currentSet = 'default';
        state.isPresetLoading = false;
        state.currConnectedObjects = [];
        state.currConnectedSets = [];
        state.packageName = 'my-package';
        state.author = '';
        state.prefix = 'files-ex';
        state.description = '';
        state.persistUrl = true;
        (this as any).$router.replace('/');
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

    setAppConfigEntry(state: any, payload: any) {
        state.appConfig[payload.key] = payload.value;
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
        state.sets.forEach((item: any, index: number) => {
            if (item.name === state.currentSet) state.sets[index].edited = true;
        });
        if (state.persistUrl) {
            (this as any).$router.replace('/');
            state.persistUrl = false;
        }
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
        state.sets.forEach((item: any, index: number) => {
            if (item.name === state.currentSet) state.sets[index].edited = true;
        });
        if (state.persistUrl) {
            (this as any).$router.replace('/');
            state.persistUrl = false;
        }
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
        let prefixObj: any = {};
        prefixObj[context.state.prefix] = "https://linkedsoftwaredependencies.org/bundles/npm/" + context.state.packageName + "/^1.0.0/"
        components.file('context.jsonld', JSON.stringify({
            "@context": [
                "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^3.0.0/components/context.jsonld",
                prefixObj
            ]
        }, null, '  '));

        let appConfig = context.state.appConfig;
        let bin = zip.folder('bin');
        for (const v of ['query.js', 'http.js', 'query-dynamic.js']) {
            bin.file(v, appConfig['bin'][v]);
        }

        zip.file('package.json', JSON.stringify(appConfig['package'], null, '  ')
            .replace(/%package_name%/g, context.state.packageName)
            .replace(/%author%/g, context.state.author)
            .replace(/%description%/g, context.state.description));
        zip.file('.gitignore', appConfig['.gitignore']);
        zip.file('.npmignore', appConfig['.npmignore']);
        zip.file('tsconfig.json', appConfig['tsconfig.json']);
        zip.file('index-browser.ts', appConfig['index-browser.ts']);
        zip.file('index.ts', appConfig['index.ts']);
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

    async loadSet({commit, dispatch, state}: any, payload: any) {
        const fetchedImp = payload.url ? await (this as any).$axios.$get(payload.url) : payload.fetchedImp;

        const s = await jsonldToState(fetchedImp, payload.name);

        commit('addToContext', {context: s.context, set: payload.name});

        // Handle mediators
        for (const mediator of s.mediators) {
            mediator.set = payload.name;
            await dispatch('mapMediatorToState', mediator);
        }
        // Handle actors
        for (const actor of s.actors) {
            actor.set = payload.name;
            await dispatch('mapActorToState', actor);
        }

        commit('setLoadedOfSet', payload.name);
    },

    async uploadZip({commit, dispatch, state}: any, file: any) {

        let zip = new JSZip();

        zip.loadAsync(file).then(async function (z) {

            // Reset
            commit('resetState');

            // Static files
            ['.npmignore', '.gitignore'].forEach((s: string) => {

                z.files[s].async('text').then(function (c) {
                    commit('setAppConfigEntry', {
                        key: s,
                        value: c
                    })
                });
            });
            z.files['package.json'].async('text').then(function (packageString) {
                let json = JSON.parse(packageString);
                commit('setStateEntry', {
                    key: name,
                    value: json.name
                });
                commit('setStateEntry', {
                    key: 'author',
                    value: json.author
                });
                commit('setStateEntry', {
                    key: 'description',
                    value: json.description
                });

                json = JSON.parse(packageString.replace(new RegExp(json.name, 'g'), '%package_name%'));
                json.author = '%author%';
                json.description = '%description%';

                commit('setAppConfigEntry', {
                    key: 'package',
                    value: json
                });
            });

            // Config

            const configItems = zip.folder('config').filter((rel, file) => true);
            if (configItems.length > 1) {
                // Using sets
                let prefix = '';
                await zip.file('components/context.jsonld').async('text').then(content => {
                    let context = JSON.parse(content);
                    prefix = Object.keys(context['@context'][1])[0];
                });
                const presetUrls = Object.values<string>(state.appConfig.presets);

                zip.file('config/config-default.json').async('text').then(async content => {
                    const configDefault = JSON.parse(content);

                    const configDefaultExpanded: any = await jsonldParser.expand(configDefault);
                    let imports = configDefaultExpanded[0]['http://www.w3.org/2002/07/owl#imports'];
                    const imps = [];

                    for (const imp of imports) {
                        if (!presetUrls.includes(imp['@id'])) {
                            const splitted = imp['@id'].split('/');
                            const setName = splitted[splitted.length-1].slice(0, -5);
                            const set: any = {name: setName, loaded: false, edited: false}

                            if (imp['@id'].startsWith(prefix)) {
                                await zip.file(`config/sets/${setName}.json`).async('text').then((content) => {
                                    set.fetchedImp = JSON.parse(content);
                                });
                            } else {
                                set.url = imp['@id'];
                            }
                            commit('addSet', set);
                            imps.push(set);
                        } else {
                            await dispatch('importPreset', imp);
                        }
                    }

                    for (const imp of imps) {
                        await dispatch('loadSet', imp);
                    }
                });

            } else {
                // Only default
                zip.file('config/config-default.json').async('text').then(async (content) => {
                    const configDefault = JSON.parse(content);
                    await dispatch('loadSet', {
                        fetchedImp: configDefault,
                        name: 'default'
                    });
                });
            }


        });

    },

    async importPreset({commit, dispatch, state}: any, presetLink: string) {

        commit('setIsPresetLoading', true);

        const data = await (this as any).$axios.$get(presetLink);
        const dataExpanded: any = await jsonldParser.expand(data);
        let imports = dataExpanded[0]['http://www.w3.org/2002/07/owl#imports'];

        const presetUrls = Object.values<string>(state.appConfig.presets);

        commit('addToContext', {context: data['@context'], set: 'default'});

        const imps = [];

        for (const imp of imports) {

            if (!presetUrls.includes(imp['@id'])) {
                const splitted = imp['@id'].split('/');
                const setName = splitted[splitted.length-1].slice(0, -5);
                const set = {name: setName, url: imp['@id'], loaded: false, edited: false}
                commit('addSet', set);
                imps.push(set);
            } else {
                await dispatch('importPreset', imp['@id']);
            }
        }

        commit('setIsPresetLoading', false);

        for (const imp of imps) {
            await dispatch('loadSet', imp);
        }
    }
}
