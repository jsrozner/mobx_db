import { localDB } from "./localDB";
import { fetchEmails } from "./BackendInterface";
import { DBApi } from "./DBApiToBackend";
import { Contact, UnwrapRefs } from "../src_backend/EmailModel";

const mytest = async () => {
  // todo we should probably be initializing here versus in the module
  const db = localDB;
  // fetch emails and then assume they are correctly proxied
  const emails = await DBApi.getEmailsForInbox();
  emails.forEach((e) => {
    // todo: we have to add explicit type to make it work
    // todo: import service not working..
    const s: UnwrapRefs<Contact> = e.sender;
  });
};
