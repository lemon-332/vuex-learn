import { createStore } from "vuex";

export default createStore({
  state: {
    count: 5,
  },
  getters: {
    double(state) {
      return state.count * 2;
    },
  },
  mutations: {
    add(state, payload) {
      state.count += payload;
    },
  },
  actions: {
    addAsync({ commit }, payload) {
      setTimeout(() => {
        commit("add", payload);
      }, 1000);
    },
  },
});
