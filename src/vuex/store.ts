import { storeKey } from "./injectKey";
import { ModuleCollection } from "./module/moduleCollection";
import { isPromise } from "./utils";

const getNestedState = (state: any, path: any) => {
  return path.length ? path.reduce((state, key) => state[key], state) : state;
};

const installModule = (store: any, rootState: any, path: any, module: any) => {
  let isRoot = !path.length; // 根模块

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
    store._wrapperGetters[key] = () => {
      // 这里不能使用 module.state，因为module.state不是响应式的，但是store._state是响应式的
      //   return getter(module.state);
      return getter(getNestedState(store.state, path));
    };
  });

  module.forEachMutation((mutation, key) => {
    const entry = store._mutations[key] || (store._mutations[key] = []);
    entry.push((payload: any) => {
      // this.store.commit("aModule/mutationName",payload);
      mutation.call(store, getNestedState(store.state, path), payload);
    });
  });

  module.forEachAction((action, key) => {
    const entry = store._actions[key] || (store._actions[key] = []);
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

  private _modules: ModuleCollection;
  constructor(options: any) {
    this._modules = new ModuleCollection(options);
    this._wrapperGetters = Object.create(null);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);

    // 定义状态
    const state = this._modules.root.state;
    // 类似的 this.store.state.aModule.state
    installModule(this, state, [], this._modules.root);

    console.log(this, state);
  }

  // createApp(App).use(store).mount("#app");  使用use绑定，那就需要install方法
  install(app, injectKey?) {
    // 全局暴露一个变量，就是store的实例
    app.provide(injectKey || storeKey, this);
    // 挂载到全局属性上 ==   Vue.prototype.$store = this;
    app.config.globalProperties.$store = this;
  }
}

export const createStore = (options: any) => {
  return new Store(options);
};
