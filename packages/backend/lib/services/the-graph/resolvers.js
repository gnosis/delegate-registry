// import { Resolvers } from "./.graphclient"

module.exports.resolvers = {
  //: Resolvers = {
  Context: {
    // chainName can exist already in root as we pass it in the other resolver
    chainName: (root, args, meshContext, info) =>
      root.chainName || meshContext.chainName || "gorli", // The value we provide in the config
  },
  Query: {
    crossContext: async (root, args, meshContext, info) => {
      // Get the snapshot space, to figure out the main blockchain
      const timestamp = info.variableValues.timestamp
      return Promise.all(
        args.chainNames.map((chainName) =>
          meshContext.DelegateRegistry.Query.context({
            root,
            args: {
              id: args.contextId,
              contextId: args.contextId,
              chainName,
              ...(timestamp != null && { timestamp }),
            },
            context: {
              ...meshContext,
              chainName,
            },
            info,
          }).then((contextRes) => {
            // console.log("GraphQl contextRes (in resolver): ", contextRes)
            if (contextRes.toString().includes("GraphQLError")) {
              console.log("GraphQLError for: ", {
                id: args.contextId,
                contextId: args.contextId,
                chainName,
                ...(timestamp != null && { timestamp }),
              })
              console.log("GraphQL contextRes (in resolver) error:", contextRes)

              return undefined
            }
            if (contextRes == null) return undefined
            // We send chainName here so we can take it in the resolver above
            return { ...contextRes, chainName }
          }),
        ),
      ).then((allContexts) => allContexts.filter((_) => _ != null).flat())
    },
    crossContexts: async (root, args, meshContext, info) => {
      const timestamp = info.variableValues.timestamp
      return Promise.all(
        args.chainNames.map((chainName) =>
          meshContext.DelegateRegistry.Query.contexts({
            root,
            args: {
              contextId: args.contextId,
              chainName,
              ...(timestamp != null && { timestamp }),
            },
            context: {
              ...meshContext,
              chainName,
            },
            info,
          }).then((contextsRes) => {
            // console.log("GraphQl contextsRes (in resolver): ", contextsRes)
            if (contextsRes.toString().includes("GraphQLError")) {
              console.log("GraphQLError for: ", {
                contextId: args.contextId,
                chainName,
                ...(timestamp != null && { timestamp }),
              })
              console.log(
                "ResGraphQL contextsRes (in resolver) error:error:",
                contextsRes,
              )

              return []
            }
            // We send chainName here so we can take it in the resolver above
            return contextsRes.map((contextRes) => ({
              ...contextRes,
              chainName,
            }))
          }),
        ),
      ).then((allContexts) => allContexts.flat())
    },
  },
}
