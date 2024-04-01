/*
ClientDB ensures that the client always has only a single copy of any
server object. It also handles automatically fetching any objects from the
server if they are not present.

This implementation was designed to work with Typegoose, Mobx, and trpc.io.

Accordingly, any local object must be flat. For example, if an
email has an associated contact e.contact: Contact, e.contact will be represented
as an ID rather than as a json object. Another implementation would have
a reference to e.contact, but in the interest of flat object structure and
easy reasoning about server logic, we just add a lookup via the ClientDB.

When we access e.contact, ClientBaseObject proxies the request in ClientDB and
returns the locally stored Contact object. If Contact is not present, then
ClientDB will fetch and store the Contact.

So to summarize:
- holds the object map from the server
- normalizes data (no duplicates)
- wraps interactions with backend (either return local object or fetch and return it)

Additionally, it provides the following framework level functionalities:
- (todo) listens to backend for changes to locally stored objects and updates them
- (todo) garbage collects locally stored objects when no longer used by component (see QueryHook)
- (todo) queryhook


ClientBaseObject wraps data objects that are returned from the server.

Any get of an attribute that points to another object will be proxied to retrieve
from ClientDB.

Functionalities:
- (todo) selective update object (e.g. if fetch in another request)
- (todo) update obj when server send an update to ClientDB
- (todo) On any change to the object (e.g. by user interaction), a listener sees the change
    and writes back to the database
- (todo) Set method to modify object so that all modifications can be found; proxy should deny direct access
 */

import { ClientBaseObject, BaseObjectAny } from "./ClientBaseObject";
import { BEBaseObj } from "../../backend/Models";
import { trpc } from "../index";

// todo(note): we got rid of unwrapping refs here since trpc should take care of it
export class ClientDB {
  // map database object ids to their locally stored ClientBaseObject
  private db = new Map<string, BaseObjectAny>();

  /*
  BaseObject "factory" methods.
  For example, this method will be used when we have fetched a large set of data and
  need each of them in the ClientDB
   */
  // todo: maybe we should not use backend types on frontend - consider writing a frontend unwrapped basic type; concern is size of bundle
  createObjFromDataOrUpdate<T extends BEBaseObj>(
    data: T,
    // ): UnwrapRefTypegoose<T> {
  ): T {
    // Note we directly access our local db; We are not tring to fetch the object here because we assume it has just been fetched
    let obj = this.db.get(data.id);
    // If we have a copy of the object locally, update it (timestamps, etc are checked)
    if (obj) {
      obj.maybeUpdateObjData(data);
    } else {
      obj = this._create(data);
    }
    // note that if trpc were not communicating types, then if we used backend types here, we would need to cast here
    // return obj as unknown as UnwrapRefTypegoose<T>;
    return obj as unknown as T;
  }
  private _create<T extends BEBaseObj>(data: T): BaseObjectAny {
    const baseObject = new ClientBaseObject(data, this);
    this.storeObject(data.id, baseObject);
    return baseObject;
  }

  // todo: verify string typing on object id; check other places
  async getObjectById(id: string): Promise<any> {
    const obj = this.db.get(id);
    if (obj) {
      return obj;
    }
    // otherwise fetch and add to DB
    const data = await trpc.all.byId.query(id);
    if (!data) {
      throw new Error("Unable to fetch obj");
    }
    // this ensures that if somehow we had multiple fetches we do not duplicate
    return this.createObjFromDataOrUpdate(data);
  }

  private storeObject(id: string, object: BaseObjectAny): void {
    if (this.db.get(id)) {
      throw new Error("object already exists in db");
    }
    this.db.set(id, object);
  }
}

export const localDB = new ClientDB();
