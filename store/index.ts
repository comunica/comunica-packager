import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';
import {pascalCaseToKebabCase} from "~/utils/alpha";
import JSZip from "jszip";
import { saveAs } from 'file-saver';

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

function mapParameters(parameters: any, actor: any): any {
    parameters = parameters.map(
        (x: any) => {
            return {
                ...x,
                value: ''
            }
        }
    );

    return {
        busGroup: actor.busGroup,
        actorName: actor.actorName,
        parameters: parameters
    }
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

export const state: () => any = () => ({
    busGroups: [],
    mediators: [],
    createdMediators: [],
    loggers: [],
    buses: [],
    // TODO: context
    context: []
})

export const mutations = {
    addBusGroups(state: any, busGroups: BusGroup[]) {
        state.busGroups = busGroups;
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

    addActor(state: any, actor: any) {
        const updatedAddedActors = state[actor.busGroup] ? state[actor.busGroup] : [];
        updatedAddedActors.push({
            actorName: actor.actorName,
            '@id': actor['@id'],
            parameters: []
        });
        Vue.set(state, actor.busGroup, updatedAddedActors);
    },

    deleteActor(state: any, actor: any) {
        Vue.set(state, actor.busGroup, state[actor.busGroup].filter((a: any) => a['@id'] !== actor['@id']));
    },

    deleteMediator(state: any, mediator: string) {
        Vue.set(state, 'createdMediators', state.createdMediators.filter((m: any) => m['@id'] !== mediator));
    },

    addParametersToActor(state: any, payload: any) {
        const currentBusGroup = state[payload.busGroup];
        const index = currentBusGroup.findIndex((x: any) => x.actorName === payload.actorName);
        currentBusGroup[index].parameters.push(...payload.parameters);
    },

    fillInDefaults(state: any, payload: any) {
        const currentBusGroup = state[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload['@id']);
        for (const [i, p] of currentBusGroup[indexActor].parameters.entries()) {
            if (p.hasOwnProperty('default'))
                state[payload.busGroup][indexActor].parameters[i].value = handleDefault(p.range, p.default);
            if (p.hasOwnProperty('defaultScoped'))
                state[payload.busGroup][indexActor].parameters[i].value = handleDefault(p.range, p.defaultScoped.defaultScopedValue);

        }
    },

    mergeActorBusOfActor(state: any, payload: any) {
        const currentBusGroup = state[payload.busGroup];
        const index = currentBusGroup.findIndex((x: any) => x.actorName === payload.actorName);

        let i = 0;

        while (currentBusGroup[index].parameters[i]['@id'] !== 'cc:Actor/bus')
            i++;

        currentBusGroup[index].parameters[i] = {
            ...currentBusGroup[index].parameters[i],
            ...currentBusGroup[index].parameters[i+1]
        };

        currentBusGroup[index].parameters.splice(i+1, 1);

    },

    changeParameterValueOfActor(state: any, payload: any) {
        const currentBusGroup = state[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload['@id']);
        const indexParameter = currentBusGroup[indexActor].parameters.findIndex(
            (x: any) => x['@id'] === payload.parameterName
        );

        state[payload.busGroup][indexActor].parameters[indexParameter].value = payload.value;
    },

    changeParameterValueOfMediator(state: any, payload: any) {

        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload['@id']);
        const indexParameter = state.createdMediators[indexMediator].parameters.findIndex(
            (x: any) => x['@id'] === payload.parameterName
        );

        state.createdMediators[indexMediator].parameters[indexParameter].value = payload.value;

    },

    changeIDOfActor(state: any, payload: any) {
        const currentBusGroup = state[payload.busGroup];
        const indexActor = currentBusGroup.findIndex((x: any) => x['@id'] === payload.currentID);
        state[payload.busGroup][indexActor]['@id'] = payload.newID;
    },

    changeIDOfMediator(state: any, payload: any) {
        const indexMediator = state.createdMediators.findIndex((x: any) => x['@id'] === payload.currentID);
        state.createdMediators[indexMediator]['@id'] = payload.newID;
    }
}

export const actions = {

    async getArguments(context: any, actor: any) {
        const actorName = pascalCaseToKebabCase(actor.actorName);

        const componentsConfig = await (this as any).$axios.$get(`${baseUrl}${actorName}/components/components.jsonld${baseSuffix}`);
        const componentsConfigContent = JSON.parse(atob(componentsConfig.content));

        const actorConfigUrlParts = componentsConfigContent.import[0].split('/');
        actorConfigUrlParts.shift();

        const actorConfig = await (this as any).$axios.$get(
            `${baseUrl}${actorName}/components/${actorConfigUrlParts.join('/')}${baseSuffix}`
        );

        const actorConfigContent = JSON.parse(atob(actorConfig.content));
        let componentContent = actorConfigContent.components[0];

        if (componentContent.parameters)
            context.commit('addParametersToActor', mapParameters(componentContent.parameters, actor));

        while (componentContent.extends) {
            const parentComponents = Array.isArray(componentContent.extends) ? componentContent.extends : [componentContent.extends];
            for (const p of parentComponents) {
                const componentUrl = getParentComponentUrl(p);
                const component = await (this as any).$axios.$get(componentUrl);
                componentContent = JSON.parse(atob(component.content)).components[0];
                if (componentContent.parameters) {
                    context.commit('addParametersToActor', mapParameters(componentContent.parameters, actor));
                }

            }

        }

        context.commit('mergeActorBusOfActor', actor);
    },

    async downloadZip(context: any) {
        let zip = new JSZip();
        zip.file('test.json', context.state);
        zip.generateAsync({type: 'blob'}).then(
            content => {
                saveAs(content, 'engine.zip');
            }
        )
    }

}
