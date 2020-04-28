interface State {
  buses: string[],
}

export const state: () => State = () => ({
  buses: [],
})

export const mutations = {
  addBus (state: State, payload: string) {
    state.buses.push(payload)
  }
}
