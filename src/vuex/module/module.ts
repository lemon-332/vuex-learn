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
  forEachGetter(fn) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, fn);
    }
  }
  forEachAction(fn) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, fn);
    }
  }
  forEachMutation(fn) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, fn);
    }
  }
}
