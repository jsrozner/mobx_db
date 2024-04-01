/*
See ClientDB.ts for details of the functionality.
 */

import { makeAutoObservable } from "mobx";
import { BEBaseObj } from "../../backend/Models";
import { ClientDB } from "./ClientDB";
import {
  getActualReferencedId,
  isRefArrayOnClient,
  isRefOnClient,
} from "../../shared/refwrapper";

export type BaseObjectAny = ClientBaseObject<any>;

export class ClientBaseObject<T extends BEBaseObj> {
  constructor(
    // todo: maybe typing on attributes should be a record?; seems not to matter
    private _data: T,
    private clientDB: ClientDB,
  ) {
    makeAutoObservable(this._data);
    return new Proxy(this, this.makeProxyHandler());
  }

  private makeProxyHandler() {
    const proxyHandler: ProxyHandler<ClientBaseObject<T>> = {
      get: async (target: ClientBaseObject<T>, prop) => {
        // type will not be a symbol (I don't really understand symbols)
        if (typeof prop !== "string" || !(prop in target._data)) {
          // todo check reflect use and check invalid accesses
          // should return ClientBaseObject methods
          return Reflect.get(this, prop);
        }
        const attr = target._data[prop as keyof T];

        // unpack any references into pointers to other locally stored objects
        if (isRefOnClient(attr)) {
          return await this.clientDB.getObjectById(getActualReferencedId(attr));
        } else if (isRefArrayOnClient(attr)) {
          return await Promise.all(
            attr.map((ref) => this.clientDB.getObjectById(ref)),
          );
        }
        return attr;
      },
    };
    return proxyHandler;
  }

  // todo: Implement
  // - this should be called only by localDB (no friend classes like in java?)
  // - only modify if different (but maybe mobx knows not to do anything if the object itself is unchanged)
  //  - consider using timestamps for race condition
  // - if change is triggered by another process, do not trigger an additional observation
  // - current implementation is untested
  maybeUpdateObjData(data: T) {
    Object.assign(this._data, data);
  }

  // todo: implement
  //    set up an observer to write changes back to DB on change
  //    handle errors writing back on fail

  //   private setupObserver() {
  //   reaction(
  //     () => this._attributes,
  //     (attributes) => {
  //        call via TRPC
  //       updateDatabase(attributes.id, attributes);
  //     },
  //     {
  //       deep: true // To observe nested changes
  //     }
  //   );
  // }
}
