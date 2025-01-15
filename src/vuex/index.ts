const storeKey = "store  ";
class Store {
  constructor(options: any) {}

  // createApp(App).use(store).mount("#app");  使用use绑定，那就需要install方法
  install(app, injectKey?) {
    // 全局暴露一个变量，就是store的实例
    app.provide(injectKey || storeKey, this);
  }
}

export const useStore = () => {};

export const createStore = (options: any) => {
  return new Store(options);
};
