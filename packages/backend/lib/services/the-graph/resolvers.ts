import { Resolvers } from "../../../.graphclient"

export const resolvers: Resolvers = {
  Context: {
    // chainName can exist already in root as we pass it in the other resolver
    chainName: (root, args, meshContext, info) =>
      root.chainName || (meshContext as any).chainName || "gorli", // The value we provide in the config
  },
  Query: {
    crossContext: async (root, args, meshContext, info) =>
      Promise.all(
        args.chainNames.map((chainName: string) =>
          (meshContext as any).DelegateRegistry.Query.contexts({
            root,
            args,
            context: {
              ...meshContext,
              chainName,
            },
            info,
          }).then((contextsRes) => {
            // We send chainName here so we can take it in the resolver above
            return contextsRes.map((contextRes) => ({
              ...contextRes,
              chainName,
            }))
          }),
        ),
      ).then((allContexts) => allContexts.flat()),
    crossContexts: async (root, args, meshContext, info) =>
      Promise.all(
        args.chainNames.map((chainName: string) =>
          (meshContext as any).DelegateRegistry.Query.contexts({
            root,
            args,
            context: {
              ...meshContext,
              chainName,
            },
            info,
          }).then((contextsRes) => {
            // We send chainName here so we can take it in the resolver above
            return contextsRes.map((contextRes) => ({
              ...contextRes,
              chainName,
            }))
          }),
        ),
      ).then((allContexts) => allContexts.flat()),
  },
}
