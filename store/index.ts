import {BusGroup} from "~/assets/interfaces";

interface State {
  busGroups: BusGroup[],
}

export const state: () => State = () => ({
  busGroups: [],
})

export const mutations = {
  addBusGroup (state: State, busGroup: BusGroup) {
    state.busGroups.push(busGroup)
  }
}
