import { reactive, watch } from "vue";
import { storeKey } from "./injectKey";
import { ModuleCollection } from "./module/moduleCollection";
import { forEachValue, isPromise } from "./utils";

const getNestedState = (state: any, path: any) => {
  return path.length ? path.reduce((state, key) => state[key], state) : state;
};

const installModule = (store: any, rootState: any, path: any, module: any) => {
  let isRoot = !path.length; // 根模块

  const namespaced = store._modules.getNamespaced(path);

  if (!isRoot) {
    /**
     * 这个地方就是，如果path有值，那么就说明不是根模块，需要把子模块的state放到父模块的state中
     * 举例：root{a{b,c}}
     * 首先从root插入state，之后path插入root，之后插入a在root上，并且定义a的key，
     * 之后来到了b，首先从slice(0, -1) 就是排除的本身b自己，从root和a中间开始
     * 然后查找root和a之中，哪个里面有b的key，就把这个b插入到谁里面
     * 举例中a中有b，所以插入到了a里面，c也是以此类推
     */
    const parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState);

    parentState[path[path.length - 1]] = module.state;
  }

  module.forEachGetter((getter, key) => {
    store._wrapperGetters[namespaced + key] = () => {
      // 这里不能使用 module.state，因为module.state不是响应式的，但是store._state是响应式的
      //   return getter(module.state);
      return getter(getNestedState(store.state, path));
    };
  });

  module.forEachMutation((mutation, key) => {
    const entry =
      store._mutations[namespaced + key] ||
      (store._mutations[namespaced + key] = []);
    entry.push((payload: any) => {
      // this.store.commit("aModule/mutationName",payload);
      mutation.call(store, getNestedState(store.state, path), payload);
    });
  });

  module.forEachAction((action, key) => {
    const entry =
      store._actions[namespaced + key] ||
      (store._actions[namespaced + key] = []);
    entry.push((payload: any) => {
      // this.store.dispatch("aModule/actionName",payload);
      // 第一个参数是绑定this的指向为store，第二个是 addAsync({ commit }, payload) {  结构的时候的 commit
      let res = action.call(store, store, payload);
      if (!isPromise(res)) {
        return Promise.resolve(res);
      }
      return res;
    });
  });

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  });
};

export default class Store {
  _mutations: any;
  _actions: any;
  _wrapperGetters: any;
  _state: any;
  _modules: ModuleCollection;
  strict: boolean;
  _committing: boolean;
  _subscribes: any[];

  constructor(options: any) {
    this._modules = new ModuleCollection(options);
    this._wrapperGetters = Object.create(null);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);

    this.strict = options.strict || false;
    this._committing = false;

    // 定义状态
    const state = this._modules.root.state;
    // 类似的 this.store.state.aModule.state
    installModule(this, state, [], this._modules.root);

    resetStoreState(this, state);

    this._subscribes = [];
    options?.plugins.forEach((plugin: any) => plugin(this));

    console.log(this, state);
  }

  subscribe(fn) {
    this._subscribes.push(fn);
  }

  _withCommitting(fn) {
    // 这里为什么不直接写true 和 false的原因，是可能之前为true，
    // 所以直接保存之前的状态，后面改回就行
    const committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  }

  replaceState(state: any) {
    // 严格模式下不能直接修改状态
    this._withCommitting(() => {
      this._state.data = state;
    });
  }

  commit = (type: any, payload: any) => {
    const entry = this._mutations[type] || [];
    this._withCommitting(() => {
      entry.forEach((handler: any) => {
        handler(payload);
      });
    });
    this._subscribes.forEach((fn: any) => fn({ type, payload }, this._state));
  };

  dispatch = (type: any, payload: any) => {
    const entry = this._actions[type] || [];
    return Promise.all(entry.map((handler: any) => handler(payload)));
  };

  get state() {
    return this._state.data;
  }

  // createApp(App).use(store).mount("#app");  使用use绑定，那就需要install方法
  install(app, injectKey?) {
    // 全局暴露一个变量，就是store的实例
    app.provide(injectKey || storeKey, this);
    // 挂载到全局属性上 ==   Vue.prototype.$store = this;
    app.config.globalProperties.$store = this;
  }
}

const resetStoreState = (store: any, state: any) => {
  store._state = reactive({ data: state });
  const wrappedGetters = store._wrapperGetters;

  store.getters = {};
  forEachValue(wrappedGetters, (getter, key) => {
    Object.defineProperty(store.getters, key, {
      get: getter,
      enumerable: true,
    });
  });

  if (store.strict) {
    enableStrictMode(store);
  }
};

const enableStrictMode = (store: any) => {
  watch(
    () => store._state.data,
    () => {
      console.assert(store._committing, "不允许在mutation之外修改状态");
    },
    {
      deep: true,
      flush: "sync",
    }
  );
};

export const createStore = (options: any) => {
  return new Store(options);
};
