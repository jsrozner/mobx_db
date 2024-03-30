// todo: think about the non-null assertions here
// todo: rename this file

import {
  prop,
  getModelForClass,
  Ref,
  modelOptions,
} from "@typegoose/typegoose";
import mongoose, { Types } from "mongoose";

// todo: this needs to be incorporated somehow into the response (need to rewrite)/ or we can update the typing...
export interface RefObject {
  __id: string; // Assuming __id is a string
}

// export type UnwrapRefRecursive<T> =
//   T extends Ref<infer U>
//     ? NoObjectId<U>
//     : T extends Array<Ref<infer U>>
//       ? NoObjectId<U>[]
//       : T extends object
//         ? { [K in keyof T]: UnwrapRefRecursive<T[K]> }
//         : T;

// Utility type to recursively unwrap Ref types in an object
export type UnwrapRefs<T> =
  T extends Ref<infer U>
    ? UnwrapRef<U>
    : T extends (infer V)[]
      ? UnwrapRef<V>[]
      : T extends object
        ? { [K in keyof T]: UnwrapRefs<T[K]> }
        : T;

export type NoObjectId<T> = Exclude<T, Types.ObjectId>;
export type UnwrapRef<T> = T extends Ref<infer X> ? NoObjectId<X> : T;
export type UnwrapRefArray<T> = T extends (infer V)[] ? UnwrapRef<V>[] : T;

@modelOptions({ schemaOptions: { timestamps: true } })
export class BEBaseObj {
  @prop()
  id!: mongoose.Types.ObjectId;
  _id!: mongoose.Types.ObjectId;
}

export class Contact extends BEBaseObj {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true, type: () => [String] })
  public emailAddr!: string[];
}

export class Email extends BEBaseObj {
  @prop({ required: true })
  public fromaddr!: string;

  @prop({ required: true })
  public toaddr!: string;

  @prop({ required: true })
  public content!: string;

  @prop({ ref: () => Contact })
  public sender!: Ref<Contact>;
}

// const EmailModel = getModelForClass(Email);
// const ContactModel = getModelForClass(Contact);
