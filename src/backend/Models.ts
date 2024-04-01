// todo: think about the non-null assertions here

import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class BEBaseObj {
  @prop()
  // todo: figure out how these should be handled/ maybe included by default
  id!: string;
  // id!: mongoose.Types.ObjectId;
  // _id!: mongoose.Types.ObjectId;
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

export const EmailModel = getModelForClass(Email);
export const ContactModel = getModelForClass(Contact);
