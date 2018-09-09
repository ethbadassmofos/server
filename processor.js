module.exports = (rawData) => {
  const data = rawData

  const { nodes, addresses } = data

  if (!data.addresses || !data.nodes) {
    console.error('Invalid data')
    console.error(data)

    process.exit(-1)
  }

  console.log(`Loaded data dump. ${Object.keys(data.addresses).length} addresses and ${Object.keys(data.nodes).length}.`)

  // calculate top 100 node owners
  SIZE = 100
  const topOwners = []

  Object.keys(addresses).forEach(a => {
    const { current_nodes } = addresses[a]

    if (topOwners.length < SIZE) {
      topOwners.push({ address: a, total: current_nodes.length })
    } else {
      for (let i = 0; topOwners.length > i; ++i) {
        if (topOwners[i].total < current_nodes.length) {
          topOwners.splice(i, 1, { address: a, total: current_nodes.length })
          break
        }
      }
    }
  })

  data.topOwners = topOwners

  console.log('Finished calculating stats!')

  return data
}
