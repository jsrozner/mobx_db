/**
 * This a minimal tRPC server adapted from starter docs
 */
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";

import { db } from "./db";

// todo: split up router
const appRouter = router({
  email: {
    list: publicProcedure.query(async () => {
      // todo: or should this just directly go to EmailModel
      return await db.email.findMany();
    }),
  },
  all: {
    byId: publicProcedure.input(z.string()).query(async (opts) => {
      const { input } = opts;
      return await db.all.findById(input);
    }),
  },
});

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});

server.listen(3000);
