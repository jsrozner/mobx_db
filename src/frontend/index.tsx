import { createTRPCClient, httpBatchLink } from "@trpc/client";
// todo: think about import location
import { AppRouter } from "../backend"; // note type only import

// Pass AppRouter as generic here. This lets the `trpc` object know
// what procedures are available on the server and their input/output types.
// todo: move to an axios-like file or apis or something
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
    }),
  ],
});

// types test case
// todo: test that we actually get end to end processing of the values
const _ = async () => {
  const emails = await trpc.email.list.query();
  emails[0].sender.name;
};
