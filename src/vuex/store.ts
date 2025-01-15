import { reactive } from "vue";
import { forEachValue } from "./utils";
import { storeKey } from "./injectKey";
import { ModuleCollection } from "./module/moduleCollection";

const installModule = (store: any, rootState: any, path: any, module: any) => {
  let isRoot = !path.length; // 根模块

  if (!isRoot) {
    const parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState);

    parentState[path[path.length - 1]] = module.state;
  }

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  });
};

export default class Store {
  _state: any;
  getters: any;
  _mutations: any;
  _actions: any;

  private _modules: ModuleCollection;
  constructor(options: any) {
    this._modules = new ModuleCollection(options);
    const state = this._modules.root.state;
    // 类似的 this.store.state.aModule.state
    installModule(this, state, [], this._modules.root);
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
