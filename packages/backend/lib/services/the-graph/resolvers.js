// import { Resolvers } from "./.graphclient"

const SNAPSHOT_HUB = "https://hub.snapshot.org"
const SNAPSHOT_HUB_GOERLI = "https://testnet.snapshot.org"

const getSnapshotSpaceSettings = async (spaceName, testSpace) => {
  const res = await fetch(`${getHubUrl(testSpace)}/api/spaces/${spaceName}`, {})
  if (res.ok) {
    try {
      const resJson = await res.json()
      console.log("resJson", resJson)
      return resJson
    } catch (error) {
      throw Error(
        `The response from the Snapshot Hub was not valid JSON. Most likely the space does not exist for ${spaceName}.`,
      )
    }
  } else {
    throw res
  }
}

const getHubUrl = (testSpace = false) =>
  testSpace ? SNAPSHOT_HUB_GOERLI : SNAPSHOT_HUB

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
      if (args.blocknumber == null || typeof args.blocknumber !== "number") {
        console.log("mainChain", args.mainChain)
        console.log("blocknumber: " + args.blocknumber)
        const blockTime = console.log("timestamp of block: ")
      }
      // Get the time of the blocknumber

      // For each chain, get the correct blocknumber (the last block before the time of the main chain blocknumber)

      // Or, modify the subgraph to keep all delegation sets (never delete, just mark them as inactive instead)

      return Promise.all(
        args.chainNames.map((chainName) =>
          meshContext.DelegateRegistry.Query.context({
            root,
            args: {
              id: args.contextId,
              contextId: args.contextId,
              chainName,
              ...(args.blocknumber != null &&
                typeof args.blocknumber === "number" &&
                args.blocknumber > 0 && {
                  block: {
                    number: args.blocknumber,
                  },
                }),
            },
            context: {
              ...meshContext,
              chainName,
            },
            info,
          }).then((contextRes) => {
            console.log("contextRes", contextRes)
            if (contextRes == null) return undefined
            // We send chainName here so we can take it in the resolver above
            return { ...contextRes, chainName }
          }),
        ),
      ).then((allContexts) => allContexts.filter((_) => _ != null).flat())
    },
    crossContexts: async (root, args, meshContext, info) =>
      Promise.all(
        args.chainNames.map((chainName) =>
          meshContext.DelegateRegistry.Query.contexts({
            root,
            args: {
              contextId: args.contextId,
              chainName,
              ...(args.blocknumber != null &&
                typeof args.blocknumber === "number" &&
                args.blocknumber > 0 && {
                  block: {
                    number: args.blocknumber,
                  },
                }),
            },
            context: {
              ...meshContext,
              chainName,
            },
            info,
          }).then((contextsRes) => {
            console.log("contextsRes", contextsRes)
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
