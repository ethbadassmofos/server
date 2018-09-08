const { gql } = require('apollo-server-koa')

module.exports = gql`
type Owner {
	address: String
	block: Int
  txId: String
}

type Node {
  name: String
  label: String
  node: String
	subNodes: [Node]
}

type NodeAction {
  node: Node
  block: Int
	action: String
}

type Resolver {
  address: String
  block: Int
  txId: String
}

type EnsNode {
	ownerHistory: [Owner]
	resolverHistory: [Resolver]
}

type EthereumAddress {
	address: String
	nodeActions: [NodeAction]
	nodesOwned: Int
}

type Query {
	ensNode(node: String!): EnsNode
	ethereumAddress(address: String!): EthereumAddress
}
`
