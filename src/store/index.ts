import { createStore } from "@/vuex";

const customPlugin = (store) => {
  const state = JSON.parse(localStorage.getItem("vuex:state"));
  if (state) store.replaceState(state);
  store.subscribe((mutation, state) => {
    localStorage.setItem("vuex:state", JSON.stringify(state.data));
  });
};
export default createStore({
  plugins: [customPlugin],
  strict: true,
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
      return new Promise((resolve) => {
        setTimeout(() => {
          commit("add", payload);
          resolve("11");
        }, 1000);
      });
    },
  },
  modules: {
    aModules: {
      namespaced: true, // 开启命名空间
      state: {
        aCount: 5,
      },
      getters: {
        adouble(state) {
          return state.aCount * 2;
        },
      },
      mutations: {
        add(state, payload) {
          state.aCount += payload;
        },
      },
      actions: {
        addAsync({ commit }, payload) {
          setTimeout(() => {
            commit("aAdd", payload);
          }, 1000);
        },
      },
    },
    bModules: {
      namespaced: true,
      state: {
        bCount: 5,
      },
      modules: {
        cModules: {
          namespaced: true, // 开启命名空间
          state: {
            cCount: 5,
          },
        },
      },
    },
  },
});
