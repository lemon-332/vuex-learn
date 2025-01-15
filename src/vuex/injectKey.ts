import { inject } from "vue";

export const storeKey = "store  ";

export const useStore: any = (injectKey: any = null) => {
  return inject(injectKey != null ? injectKey : storeKey);
};
