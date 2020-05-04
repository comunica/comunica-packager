import {BusGroup} from "~/assets/interfaces";
import Vue from 'vue';

export const state: () => any = () => ({
    busGroups: []
})

export const mutations = {
    addBusGroups(state: any, busGroups: BusGroup[]) {
        state.busGroups = busGroups;
    },

    addActor(state: any, actor: any) {
        const updatedAddedActors = state[actor.busGroup] ? state[actor.busGroup] : [];
        updatedAddedActors.push(actor.actor);
        Vue.set(state, actor.busGroup, updatedAddedActors);
    }
}
