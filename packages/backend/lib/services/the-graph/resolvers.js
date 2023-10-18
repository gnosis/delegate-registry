module.exports.resolvers = {
  DelegationSet: {
    chainName: (root, args, context, info) => context.chainName || "gorli", // The value we provide in the config
  },
  Context: {
    chainName: (root, args, context, info) => context.chainName || "gorli", // The value we provide in the config
  },
}
