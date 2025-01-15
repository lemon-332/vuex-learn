import { inject, reactive } from "vue";

const storeKey = "store  ";

const forEachValue = (obj, fn) => {
  Object.keys(obj).forEach((key) => fn(obj[key], key));
};
class Store {
  _state: any;
  getters: any;
  _mutations: any;
  _actions: any;
  constructor(options: any) {
    const store = this;
    // vuex3 使用一个新的Vue实例 new Vue
    // vuex4 使用reactive
    // 对于这里为什么要包一层data，因为vuex有个api replaceState 可以替换state，这样就可以
    // 直接修改 store._state.data 不用reactive 不用重新赋值
    store._state = reactive({ data: options.state });
    store.getters = {};
    forEachValue(options.getters, (fn, key) => {
      Object.defineProperty(store.getters, key, {
        get: () => fn(store.state),
      });
    });

    store._mutations = Object.create(null);
    store._actions = Object.create(null);

    const _mutations = options.mutations;
    const _actions = options.actions;

    forEachValue(_mutations, (mutation, key) => {
      store._mutations[key] = (payload) => {
        // 改变this指向为store ,，并且将state传入
        // this.$store.commit('add', 1)
        /**
         * mutations: {
            add(state, payload) {
                state.count += payload;
            },
         },
         */
        mutation.call(store, store.state, payload);
      };
    });

    forEachValue(_actions, (action, key) => {
      store._actions[key] = (payload) => {
        // 参数不一样   addAsync({ commit }, payload) {}
        action.call(store, store, payload);
      };
    });
  }

  commit = (type: any, payload: any) => {
    this._mutations[type](payload);
  };

  dispatch = (type: any, payload: any) => {
    this._actions[type](payload);
  };

  // createApp(App).use(store).mount("#app");  使用use绑定，那就需要install方法
  install(app, injectKey?) {
    // 全局暴露一个变量，就是store的实例
    app.provide(injectKey || storeKey, this);
    // 挂载到全局属性上 ==   Vue.prototype.$store = this;
    app.config.globalProperties.$store = this;
  }

  get state() {
    return this._state.data;
  }
}

export const useStore: any = (injectKey: any = null) => {
  return inject(injectKey != null ? injectKey : storeKey);
};

export const createStore = (options: any) => {
  return new Store(options);
};
