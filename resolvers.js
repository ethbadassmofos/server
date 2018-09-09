const { hash: hashEnsName } = require('eth-ens-namehash')

module.exports = getData => ({
  Query: {
    ensNode: (_, { name }, ctx) => {
      const hash = hashEnsName(name)

      const ret = getData().nodes[hash]

      if (!ret) return null

      ctx.node = { name, nameHash: hash }

      return ret
    },
    ethereumAddress: (_, { address }, ctx) => {
      const ret = getData().addresses[address]

      if (!ret) return null

      ctx.address = address

      return ret
    },
    ownerStats: (_, { limit }) => getData().topOwners.slice(0, limit)
  },
  EthereumAddress: {
    nodeHistory: ({ history }) => history,
    nodes: ({ current_nodes }) => current_nodes
  },
  EnsNode: {
    node: (_, __, { node }) => node,
  	owner: ({ current_address }) => current_address,
		ownerHistory: ({ history }) => history,
  },
  OwnerStat: {
    owner: ({ address }) => address,
    nodesOwned: ({ total }) => total,
  },
  NodeEvent: {
    node: ({ node }, _, ctx) => node ? { nameHash: node } : ctx.node,
    actor: ({ address }, _, ctx) => address || ctx.address,
  },
  Node: {
    name: data => {
      switch (typeof data) {
        case 'object':
          return data.name
        default:
          return null
      }
    },
    nameHash: data => {
      switch (typeof data) {
        case 'object':
          return data.nameHash
        case 'string':
          return data
        default:
          return null
      }
    }
  },
  Address: {
    address: a => a
  }
})
