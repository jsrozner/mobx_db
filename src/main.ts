import { localDB } from "./localDB";
import { fetchEmails } from "./BackendInterface";

const mytest = async () => {
  // todo we should probably be initializing here versus in the module
  const db = localDB;
  // fetch emails and then assume they are correctly proxied
  // const emails = await DBApi.getEmailsForInbox();
  const emails = await fetchEmails();
  emails.forEach((e) => {
    e.sender.linkedContacts.forEach((s) => {
      s.name;
    });
    // todo: we have to add explicit type to make it work
    // todo: import service not working..
  });
};
