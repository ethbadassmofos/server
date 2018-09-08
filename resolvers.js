const dump = require('./dump.json')

module.exports = {
  Query: {
    ensNode: (_, { node }) => null,
    ethereumAddress: (_, { address }) => (
      dump.addresses[address]
        ? [ address, dump.addresses[address] ]
        : null
    ),
  },
  EthereumAddress: {
    address: ([ address ]) => address,
    nodeActions: ([ _, { history } ]) => history,
    nodesOwned: ([ _, { current_nodes } ]) => current_nodes.length
  },
  NodeAction: {
    block: data => data[0],
    action: data => data[1],
    node: data => data[2],
  },
  Node: {
    node: n => n
  },
}
