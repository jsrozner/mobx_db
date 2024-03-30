// wraps objects on the client

import { makeAutoObservable } from "mobx";
import {
  BEBaseObj,
  RefObject,
  UnwrapRef,
  UnwrapRefArray,
} from "../src_backend/EmailModel";
import { LocalDB } from "./localDB";

// todo: potentially update object if changed (called by clientDB through a backend listener)
// todo: use a set method to modify attributes

// todo: is this bad practice - avoid dealing with typing
export type BaseObjectAny = BaseObject<any>;
export class BaseObject<T extends BEBaseObj> {
  constructor(
    // todo: typing on attributes should be a record?
    private _data: T,
    private localDB: LocalDB,
  ) {
    makeAutoObservable(this._data);
    return new Proxy(this, this.proxyHandler());
  }
  maybeUpdateObjData(data: T) {
    // todo: only change if diff; check that it does not trigger an observation change
    //  should probably use timestamps in case of race condition
    // write an object update function that lives in BaseObject
    // todo is this right - assignng to _attributes
    Object.assign(this._data, data); // Update existing object with new data
  }

  private proxyHandler() {
    return {
      // todo: why not key of T
      // get: async (target: BaseObject<T>, prop: keyof T) => {
      get: async (target: BaseObject<T>, prop: string | symbol) => {
        // type will not be a symbol (i don't really understand symbols)
        // todo: should we use reflect? see below
        if (typeof prop !== "string" || !(prop in target._data)) {
          throw new Error("invalid access");
        }
        const attr = target._data[prop as keyof T];
        if (isRef(attr)) {
          const fetched = await this.localDB.getObjectById(attr.__id);
          return fetched as UnwrapRef<typeof attr>;
        } else if (isRefArray(attr)) {
          const fetched = await Promise.all(
            attr.map((ref) => this.localDB.getObjectById(ref.__id)),
          );
          return fetched as UnwrapRefArray<typeof attr>;
        }

        return attr;
      },
      // get: async (target: BaseObject<T>, prop: string | symbol) => {
      //   const value = Reflect.get(target._data, prop);
      //   if (isRef(value)) {
      //     const fetched = await this.localDB.getObjectById(value.__id);
      //     return fetched as UnwrapRef<typeof value>;
      //   } else if (isRefArray(value)) {
      //     const fetched = await Promise.all(
      //       value.map((ref) => this.localDB.getObjectById(ref.__id)),
      //     );
      //     return fetched as UnwrapRefArray<typeof value>;
      //   } else {
      //     return value;
      //   }
      // },
    };
  }
  // todo: set up an observer to write changes back to DB
  //  other option would be to observe in the LocalDB any object change and write back?

  //   private setupObserver() {
  //   reaction(
  //     () => this._attributes,
  //     (attributes) => {
  //       // Logic to update the database
  //       // This could be an async function call to your backend API
  //       updateDatabase(attributes.id, attributes);
  //     },
  //     {
  //       deep: true // To observe nested changes
  //     }
  //   );
  // }
}

// todo: should be const function
function isRef(value: any): value is RefObject {
  return value && typeof value === "object" && "__id" in value;
}
function isRefArray(value: any): value is RefObject[] {
  return Array.isArray(value) && value.every(isRef);
}
