// api to interact with database

// eg backend API req, getEmailsForInbox()

// eg call api function, returns collection of data objects
// - list of desired objects
// - supplemental / linked objects?

// so our function wrapper should
// - wrap all as BaseObj, store those in clientDB
// - also wrap any supplemental objects and store those in clientDB
// - register who (component / hook) is accessing these objects, so that they can be garbage collected

import { fetchEmails, fetchObj } from "./BackendInterface";
import { BEBaseObj, Email, UnwrapRefs } from "../src_backend/EmailModel";
import { localDB, LocalDB } from "./localDB";
import { BaseObject } from "./BaseObject";

function wrapFn<T>(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const result = await originalMethod.apply(this, args);
    // todo: can this handle list vs not list?
    // todo: should we add an instance of localDB or just import it like this?
    return result.map((item: T) => localDB.createObjFromDataOrUpdate(item));
  };
}

// todo: implement; all of these may return supplemental objects
// functions that will get wrapped to turn response into BaseObj
export class DBApi {
  @wrapFn
  static async getEmailsForInbox(): Promise<UnwrapRefs<Email>[]> {
    // static async getEmailsForInbox(): Promise<BaseObject<Email>[]> {
    return await fetchEmails();
  }

  @wrapFn
  static async fetchSingleObject(id: string): Promise<BEBaseObj> {
    return await fetchObj(id);
  }
}
