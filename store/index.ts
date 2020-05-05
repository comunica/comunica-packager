import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';
import {pascalCaseToKebabCase} from "~/utils/alpha";

const baseUrl = 'https://raw.githubusercontent.com/comunica/comunica/master/packages/';

export const state: () => any = () => ({
    busGroups: []
})

export const mutations = {
    addBusGroups(state: any, busGroups: BusGroup[]) {
        state.busGroups = busGroups;
    },

    addActor(state: any, actor: any) {
        const updatedAddedActors = state[actor.busGroup] ? state[actor.busGroup] : [];
        updatedAddedActors.push({
            actorName: actor.actorName,
            parameters: []
        });
        Vue.set(state, actor.busGroup, updatedAddedActors);
    },

    deleteActor(state: any, actor: any) {
        Vue.set(state, actor.busGroup, state[actor.busGroup].filter((a: any) => a.actorName !== actor.actorName));
    },

    addParametersToActor(state: any, payload: any) {
        const currentBusGroup = state[payload.busGroup]
        const index = currentBusGroup.findIndex((x: any) => x.actorName === payload.actorName);
        currentBusGroup[index].parameters.push(...payload.parameters);
        Vue.set(state, payload.busGroup, currentBusGroup);
    }
}

export const actions = {

    async getArguments(context: any, actor: any) {
        const actorName = pascalCaseToKebabCase(actor.actorName);
        const componentsConfig = await (this as any).$axios.$get(`${baseUrl}${actorName}/components/components.jsonld`);

        const actorConfigUrlParts = componentsConfig.import[0].split('/');
        actorConfigUrlParts.shift();

        const actorConfig = await (this as any).$axios.$get(`${baseUrl}${actorName}/components/${actorConfigUrlParts.join('/')}`);
        const component = actorConfig.components[0];

        if (component.parameters) {
            context.commit('addParametersToActor', {
                busGroup: actor.busGroup,
                actorName: actor.actorName,
                parameters: component.parameters,
            });
        }

        // TODO: handle super class as well (if "extends" is present)
    }

}
