import { forEachValue } from "../utils";

export class Module {
  private _raw: any;
  private _children: {};
  state: any;
  constructor(rawModule) {
    this._raw = rawModule;
    this._children = {};
    this.state = rawModule.state;
  }
  addChild(key, module) {
    this._children[key] = module;
  }

  getChild(key) {
    return this._children[key];
  }

  forEachChild(fn) {
    forEachValue(this._children, fn);
  }
}
