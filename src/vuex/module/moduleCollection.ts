import { forEachValue } from "../utils";
import { Module } from "./module";

export class ModuleCollection {
  root: any;

  constructor(rootModule: any) {
    this.root = null;
    this.register(rootModule, []);
  }

  getNamespaced(path: any) {
    let module = this.root;
    return path.reduce((namespaced, key) => {
      module = module.getChild(key);
      return namespaced + (module.namespaced ? key + "/" : "");
    }, "");
  }

  register(rawModule: any, path: any) {
    const newModule = new Module(rawModule);
    if (path.length === 0) {
      this.root = newModule;
      /**
       * {
       *    raw:rawModule,
       *    _children:{},
       *    state:rawModule.state
       * }  这个地方变成new 对象的形式，是可以方便扩张，例如一些方法
       */
    } else {
      //   const parent = this.root;
      // 意思就是 [a,b,c] 拿到 a，b，然后从root开始递归，拿到root的child a，然后再拿到child a的child b，
      // 最后就可以把c注册到child b的child
      const parent = path.slice(0, -1).reduce((module, key) => {
        return module.getChild(key);
      }, this.root);

      parent.addChild(path[path.length - 1], newModule);
    }

    if (rawModule.modules) {
      forEachValue(rawModule.modules, (childrenModule, key) => {
        path.push(key);
        this.register(childrenModule, path);
      });
    }
    return newModule;
  }
}

// 格式化之后的样子
// const root = {
//   _raw: rawModule,
//   state: rawModule.state,
//   _children: {
//     a: {
//       _raw: rawModule.a,
//       state: rawModule.a.state,
//       _children: {
//         b: {
//           _raw   : rawModule.a.b,
//           state: rawModule.a.b.state,
//           _children: {},
//       },
//   },
// };
