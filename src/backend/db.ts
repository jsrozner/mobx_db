/* Simple fake DB */

import { BEBaseObj, Email, EmailModel } from "./Models";

import { reWriteRefs } from "../shared/refwrapper";

const emails: Email[] = [];

// todo: write pre and post hooks for typegoose so that we do not need to rewriterefs in each function
// todo: potentially return supplemental objects to avoid further fetches
export const db = {
  email: {
    findMany: async () => {
      // todo: this is dumb: we created a fake db to wrap an actual DB/
      const emails: Email[] = await EmailModel.find({});
      // todo: we do not want to have to write this every time; put it as a post functoin in mongoose on an inherited base object
      return emails.map((x) => reWriteRefs(x));
    },
  },
  all: {
    findById: async (id: string) => {
      // todo: this should be a generic that searches all collections
      const obj: BEBaseObj = { id: "test" };
      return reWriteRefs(obj);
    },
  },
};
