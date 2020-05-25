import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';
import {pascalCaseToKebabCase} from "~/utils/alpha";
import JSZip from "jszip";
import { saveAs } from 'file-saver';
import {stateToJsonld} from "~/utils/json";

const baseUrl = 'https://api.github.com/repos/comunica/comunica/contents/packages/';
const baseSuffix = '?ref=master';

function getParentComponentUrl(extend: string): any {

    if (extend === 'cc:Actor')
        return `${baseUrl}core/components/Actor.jsonld${baseSuffix}`

    const parts = extend.split(':');
    const packageType = parts[0][1] === 'a' ? 'actor' : 'bus';
    let componentParts = parts[1].split('/')[1].split(/(?=[A-Z])/);

    // Special edge case where the standard rule does not apply
    if (componentParts[1] === 'Media' && componentParts[2] === 'Typed') {
        componentParts[1] += 'typed';
        componentParts.splice(2, 1);
    }

    let busGroup: any = componentParts.splice(0, parts[0].substring(2).length);
    busGroup = pascalCaseToKebabCase(busGroup.join(''));

    return `${baseUrl}${packageType}-${busGroup}/components/Actor/${extend.split('/')[1]}.jsonld${baseSuffix}`

}

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

function mergeDuplicateKeys(o: any, key: string) {
    let i = 0;

    while (o[i]['@id'] !== key)
        i++;

    o[i] = {
        ...o[i],
        ...o[i+1]
    };

    o.splice(i+1, 1);

    return o;
}

export const state: () => any = () => ({
    busGroups: [],
    mediators: [],
    createdActors: {},
    createdMediators: [],
    loggers: [],
    buses: [],
    // TODO: context
    context: []
})

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
        console.log(payload);
        console.log(currentBusGroup);
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload['@id']);
        const indexParameter = currentBusGroup[indexActor].parameters.findIndex(
            (x: any) => x['@id'] === payload.parameterName
        );

        state.createdActors[payload.busGroup][indexActor].parameters[indexParameter].value = payload.value;
    },

    changeParameterValueOfMediator(state: any, payload: any) {

        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload['@id']);
        const indexParameter = state.createdMediators[indexMediator].parameters.findIndex(
            (x: any) => x['@id'] === payload.parameterName
        );

        state.createdMediators[indexMediator].parameters[indexParameter].value = payload.value;

    },

    changeIDOfActor(state: any, payload: any) {
        const currentBusGroup = state.createdActors[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload.currentID);
        state.createdActors[payload.busGroup][indexActor]['@id'] = payload.newID;
    },

    changeIDOfMediator(state: any, payload: any) {
        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload.currentID);
        state.createdMediators[indexMediator]['@id'] = payload.newID;
    }
}

export const actions = {

    async addActor(context: any, payload: any) {

        const actorName = pascalCaseToKebabCase(payload.actorName);
        const componentsConfig = await (this as any).$axios.$get(`${baseUrl}${actorName}/components/components.jsonld${baseSuffix}`);
        const componentsConfigContent = JSON.parse(atob(componentsConfig.content));
        const actorConfigUrlParts = componentsConfigContent.import[0].split('/');
        actorConfigUrlParts.shift();
        const actorConfig = await (this as any).$axios.$get(
            `${baseUrl}${actorName}/components/${actorConfigUrlParts.join('/')}${baseSuffix}`
        );
        const actorConfigContent = JSON.parse(atob(actorConfig.content));
        let componentContent = actorConfigContent.components[0];
        let parameters = []

        if (componentContent.parameters)
            parameters.push(...componentContent.parameters);

        while (componentContent.extends) {
            const parentComponents = Array.isArray(componentContent.extends) ? componentContent.extends : [componentContent.extends];
            for (const p of parentComponents) {
                const componentUrl = getParentComponentUrl(p);
                const component = await (this as any).$axios.$get(componentUrl);
                componentContent = JSON.parse(atob(component.content)).components[0];
                if (componentContent.parameters) {
                    parameters.push(...componentContent.parameters);
                }
            }
        }

        parameters = mergeDuplicateKeys(parameters, 'cc:Actor/bus');

        for (const [i, p] of parameters.entries()) {
            if (p.hasOwnProperty('default'))
                parameters[i].value = handleDefault(p.range, p.default);
            if (p.hasOwnProperty('defaultScoped'))
                parameters[i].value = handleDefault(p.range, p.defaultScoped.defaultScopedValue);
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
        zip.file('test.json', stateToJsonld(context.state));
        zip.generateAsync({type: 'blob'}).then(
            content => {
                saveAs(content, 'engine.zip');
            }
        )
    }

}
