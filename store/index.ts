import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';
import {pascalCaseToKebabCase} from "~/utils/alpha";

const baseUrl = 'https://raw.githubusercontent.com/comunica/comunica/master/packages/';
// const suffix = '?ref=master';

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
        Vue.set(state, actor.busGroup, state[actor.busGroup].filter((a: any) => a.actorName !== a.actor));
    }
}

export const actions = {

    async getArguments(context: any, actor: string) {
        actor = pascalCaseToKebabCase(actor);
        const componentsConfig = await this.$axios.$get(`${baseUrl}${actor}/components/components.jsonld`);

        const actorConfigUrlParts = componentsConfig.import[0].split('/');
        actorConfigUrlParts.shift();

        const actorConfig = await this.$axios.$get(`${baseUrl}${actor}/components/${actorConfigUrlParts.join('/')}`);
        const component = actorConfig.components[0];

        console.log(context.state);
        if (component.parameters) {
            // return component.parameters;
        }

        // TODO: handle super class as well (if "extends" is present)
    }

}
