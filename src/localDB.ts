// holds the object map from the server
// wraps ineractions with backend

// obj map: id -> DBBaseObj
// function getObj -> either get from map or fetch from server

// functionalities
// keep track of query to object map for "garbage collection"
// will handle updates from server back to obj map (i.e. sets up a listener hook)

import { BaseObject, BaseObjectAny } from "./BaseObject";
import { DBApi } from "./DBApiToBackend";

export class LocalDB {
  private db = new Map<string, BaseObjectAny>();

  // constructor() {
  //   this.db = new Map<string, BaseObjectAny>();
  //   // makeAutoObservable(this);
  // }

  // BaseObject "factory" methods
  // this method should be used when we have fetched a large set of data and
  // need each of them in the DB
  // createObjFromDataOrUpdate<T extends BEBaseObj>(data: T): T {
  createObjFromDataOrUpdate(data: any): BaseObjectAny {
    // note the direct access to db; we do not want to fetch here
    const existingObj = this.db.get(data.id);
    // update if it exists
    if (existingObj) {
      existingObj.maybeUpdateObjData(data);
      return existingObj;
    }
    return this._create(data);
  }
  // factory method
  // private _create<T extends BEBaseObj>(data: T): T {
  private _create(data: any): BaseObjectAny {
    const baseObject = new BaseObject(data, this);
    this.storeObject(data.id, baseObject);
    // return baseObject as unknown as T;
    return baseObject;
  }

  async getObjectById(id: string): Promise<BaseObjectAny> {
    const obj = this.db.get(id);
    if (obj) {
      // todo: investigate the typing with the BaseObject proxy
      return obj;
    }
    // otherwise fetch and add to DB
    // todo: consider an error if it is empty
    const data = await DBApi.fetchSingleObject(id);
    // makes sure that if somehow we had multiple fetches we do not duplicate
    // todo: investigate the typing with the BaseObject proxy
    return this.createObjFromDataOrUpdate(data);
  }

  storeObject(id: string, object: BaseObjectAny): void {
    this.db.set(id, object);
  }
}

export const localDB = new LocalDB();
