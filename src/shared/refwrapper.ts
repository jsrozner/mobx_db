/*
Handles unwrapping / wrapping references in the DB so they can play well with
our proxied clientDB implementation.

This is typegoose specific
 */
import { Types } from "mongoose";
import { BEBaseObj } from "../backend/Models";
import { isRefType, isRefTypeArray, Ref } from "@typegoose/typegoose";

// todo:
//  - we could also check for type mongoose objectID if it were unique, but it's likely to be a string
//  - database needs to disallow this representation
//  - we could also wrap as an object like { __id: val }
//  - ** when writing back to the server, we need to unwrap as well
const prefix = "__id__::";

// recursively unwrap any Typegoose Ref
export type UnwrapRefTypegoose<T> = {
  // todo: why P in keyof T
  [P in keyof T]: T[P] extends Ref<infer U>
    ? UnwrapRefTypegoose<U>
    : T[P] extends Ref<infer U>[]
      ? UnwrapRefTypegoose<U>[]
      : T[P];
};

// stores object refs in a way that is identifiable to the client
export const reWriteRefs = <T extends BEBaseObj>(
  obj: T,
): UnwrapRefTypegoose<T> => {
  for (const key in obj) {
    // todo: not sure why we need call
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as any)[key];
      if (isRefType(value, Types.ObjectId)) {
        // todo: these might break something
        (obj as any)[key] = writeAsIdentifiable((obj as any)[key]);
      } else if (isRefTypeArray(value, Types.ObjectId)) {
        // rewrite each obj in the array
        (obj as any)[key].map((val: any) => writeAsIdentifiable(val));
      }
    }
  }
  // we rewrote it, but we cast so that trpc still gives it the same typing
  // the client proxy will automatically unpack it
  return obj as unknown as UnwrapRefTypegoose<T>;
};

// Rewrite any Ref<> field in this fashion so that client can identify it at runtime
export const writeAsIdentifiable = (val: Types.ObjectId): string => {
  return `__id__::${val}`;
};
// inverts above transformation
export const getActualReferencedId = (val: any) => {
  if (!isRefOnClient(val)) {
    throw new Error("invalid");
  }
  return val.slice(prefix.length);
};

export const isRefOnClient = (val: any): val is string => {
  if (typeof val !== "string") {
    return false;
  }
  return val.startsWith(prefix);
};

export const isRefArrayOnClient = (val: any): val is Array<any> => {
  return Array.isArray(val) && val.every(isRefOnClient);
};
