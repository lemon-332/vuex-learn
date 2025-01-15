import { createStore } from "@/vuex";

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
  modules: {
    aModules: {
      state: {
        aCount: 5,
      },
      getters: {
        aDouble(state) {
          return state.aCount * 2;
        },
      },
      mutations: {
        aAdd(state, payload) {
          state.aCount += payload;
        },
      },
      actions: {
        aAddAsync({ commit }, payload) {
          setTimeout(() => {
            commit("aAdd", payload);
          }, 1000);
        },
      },
    },
    bModules: {
      state: {
        bCount: 5,
      },
      modules: {
        cModules: {
          state: {
            cCount: 5,
          },
        },
      },
    },
  },
});
