// wraps objects on the client

import { makeAutoObservable } from "mobx";
import { RefObject } from "../src_backend/EmailModel";
import { LocalDB } from "./localDB";
import { Ref } from "@typegoose/typegoose";

// todo: potentially update object if changed (called by clientDB through a backend listener)
// todo: use a set method to modify attributes

// todo: should be const function
function isRef(value: any): value is RefObject {
  return value && typeof value === "object" && "__id" in value;
}
function isRefArray(value: any): value is RefObject[] {
  return Array.isArray(value) && value.every(isRef);
}

export type Unwrap<T> = {
  // todo: why P in keyof T
  [P in keyof T]: T[P] extends Ref<infer U>
    ? Unwrap<U>
    : T[P] extends Ref<infer U>[]
      ? Unwrap<U>[]
      : T[P];
};

// todo: is this bad practice - avoid dealing with typing
export type BaseObjectAny = BaseObject<any>;

// todo: think bout extension
// export class BaseObject<T extends BEBaseObj> {
export class BaseObject<T extends object> {
  constructor(
    // todo: typing on attributes should be a record?
    private _data: T,
    private localDB: LocalDB,
  ) {
    makeAutoObservable(this._data);
    return new Proxy(this, this.makeProxyHandler());
  }
  maybeUpdateObjData(data: T) {
    // todo: only change if diff; check that it does not trigger an observation change
    //  should probably use timestamps in case of race condition
    // write an object update function that lives in BaseObject
    // todo is this right - assignng to _attributes
    Object.assign(this._data, data); // Update existing object with new data
  }

  private makeProxyHandler() {
    const proxyHandler: ProxyHandler<BaseObject<T>> = {
      get: async (target: BaseObject<T>, prop: string | symbol) => {
        // get: async (target: BaseObject<T>, prop: string | symbol) => {
        // get: async (target: BaseObject<T>, prop: keyof ProxyTarget<T>) => {
        // get: async (
        //   target: BaseObject<T>,
        //   prop: keyof TransformRefs<T> | symbol,
        // ) => {
        // get: async (target: BaseObject<T>, prop : keyof T) => {
        // type will not be a symbol (i don't really understand symbols)
        if (typeof prop !== "string" || !(prop in target._data)) {
          // throw new Error("invalid access");
          // todo check reflect use
          // todo: check invalid accesses
          return Reflect.get(this, prop);
        }
        const attr = target._data[prop as keyof T];
        if (isRef(attr)) {
          return await this.localDB.getObjectById(attr.__id);
          // return fetched as UnwrapRef<typeof attr>;
        } else if (isRefArray(attr)) {
          return await Promise.all(
            attr.map((ref) => this.localDB.getObjectById(ref.__id)),
          );
        }
        return attr;
      },
    };
    return proxyHandler;
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

// interface me {
//   s: string;
//   t: string;
// }
// const e: me = { s: "hi", t: "bye" };
// const x = new BaseObject2(e, localDB);

// type UnwrapRef<T> =
//   T extends Ref<infer X extends BEBaseObj> ? BaseObject<X> : T;
// type UnwrapRefArray<T> = T extends (infer V extends BEBaseObj)[]
//   ? BaseObject<V>[]
//   : T;
// export class BaseObject<T extends BEBaseObj> implements T {
//
//   constructor(
//     private _data: T,
//     private localDB: LocalDB,
//   ) {
//     makeAutoObservable(this._data);
//     return new Proxy(this, this.makeProxyHandler());
//   }
//
//   private makeProxyHandler() {
//     const proxyHandler = {
//       get: async (target: BaseObject<T>, prop: string | symbol) => {
//         // if not in the _data object return access to this object rather than the data obj
//         if (typeof prop !== "string" || !(prop in this._data)) {
//           return Reflect.get(this, prop);
//         }
//
//         const attr = this._data[prop as keyof T];
//         if (isRef(attr)) {
//           const fetched = await this.localDB.getObjectById(attr.__id);
//           return fetched as UnwrapRef<typeof attr>;
//         } else if (isRefArray(attr)) {
//           const fetched = await Promise.all(
//             attr.map((ref) => this.localDB.getObjectById(ref.__id)),
//           );
//           return fetched as UnwrapRefArray<typeof attr>;
//         }
//         return attr;
//       },
//     };
//     return proxyHandler;
//   }
// }

// get(target: BaseObject<T>, prop: keyof ProxyTarget<T>) {
//   const value = target._data[prop];
//   if (typeof value === 'string' && prop.toString().endsWith('Id')) {
//     // Fetch the referenced object from localDB and return it as a BaseObject
//     const referencedObject = target.localDB.getObjectById(value);
//     return new BaseObject(referencedObject, localDB);
//   }
//   return value;
// },
// return {
//   // todo: why not key of T
//   // get: async (target: BaseObject<T>, prop: keyof T) => {
//   get: async (target: BaseObject<T>, prop: string | symbol) => {
//     // type will not be a symbol (i don't really understand symbols)
//     // todo: should we use reflect? see below
//     if (typeof prop !== "string" || !(prop in target._data)) {
//       throw new Error("invalid access");
//     }
//     const attr = target._data[prop as keyof T];
//     if (isRef(attr)) {
//       const fetched = await this.localDB.getObjectById(attr.__id);
//       return fetched as UnwrapRef<typeof attr>;
//     } else if (isRefArray(attr)) {
//       const fetched = await Promise.all(
//         attr.map((ref) => this.localDB.getObjectById(ref.__id)),
//       );
//       return fetched as UnwrapRefArray<typeof attr>;
//     }
//
//     return attr;
//   },
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
// export class BaseObject2<T extends BEBaseObj> {
//   constructor(
//     // todo: typing on attributes should be a record?
//     private _data: T,
//     private localDB: LocalDB,
//   ) {
//     makeAutoObservable(this._data);
//     Object.keys(_data).forEach((key) => {
//       Object.defineProperty(this, key, {
//         get: () => this._data[key as keyof T],
//         // get: () => this.internalGet(key),
//         // set: (value) => { this._data[key as keyof T] = value; }
//       });
//     });
//   }
//
//   maybeUpdateObjData(data: T) {
//     // todo: only change if diff; check that it does not trigger an observation change
//     //  should probably use timestamps in case of race condition
//     // write an object update function that lives in BaseObject
//     // todo is this right - assignng to _attributes
//     Object.assign(this._data, data); // Update existing object with new data
//   }
//
//   private async internalGet(prop: string) {
//     if (!(prop in this._data)) {
//       throw new Error("invalid access");
//     }
//     const attr = this._data[prop as keyof T];
//     if (isRef(attr)) {
//       return await this.localDB.getObjectById(attr.__id);
//       // return fetched as UnwrapRef<typeof attr>;
//     } else if (isRefArray(attr)) {
//       return await Promise.all(
//         attr.map((ref) => this.localDB.getObjectById(ref.__id)),
//       );
//     }
//
//     return attr;
//   }
// }
