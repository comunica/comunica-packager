import {BusGroup} from "~/assets/interfaces";

interface State {
  busGroups: BusGroup[],
}

export const state: () => State = () => ({
  busGroups: [],
})

export const mutations = {
  addBusGroups (state: State, busGroups: BusGroup[]) {
    state.busGroups = busGroups;
  }
}
