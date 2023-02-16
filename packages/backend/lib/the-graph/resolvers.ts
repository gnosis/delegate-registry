import { Resolvers, MeshContext } from "../../.graphclient"

export const resolvers: Resolvers = {
  Context: {
    // chainName can exist already in root as we pass it in the other resolver
    chainName: (root, args, context, info) =>
      root.chainName || context.chainName || "gorli", // The value we provide in the config
  },
  Query: {
    crossContext: async (root, args, context, info) =>
      Promise.all(
        args.chainNames.map((chainName: string) =>
          context.DelegateRegistry.Query.contexts({
            root,
            args,
            context: {
              ...context,
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
