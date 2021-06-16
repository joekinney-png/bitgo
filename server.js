const http = require("http");
const fetch = require("node-fetch");
const axios = require("axios");

const PORT = 3000;

const server = http.createServer((request, response) => {});

// function which queries the blockstream API endpoint and returns total number of transactions for that block
async function retrieveTotalNumberOfTxs(block) {
  try {
    const blockIdObj = await axios.get(
      `https://blockstream.info/api/block-height/${block}`
    );
    const blockId = blockIdObj.data;
    const blockTransactionsObj = await axios.get(
      `https://blockstream.info/api/block/${blockId}`
    );
    return blockTransactionsObj.data.tx_count;
  } catch {
    console.log("error in transaction number!");
  }
}

// function which queries the blockstream API endpoint and returns lists of transactions for the specified block
async function retrieveTxsList(startIndex) {
  try {
    const blockIdObj = await axios.get(
      "https://blockstream.info/api/block-height/680000"
    );
    const blockId = blockIdObj.data;
    const blockTransactionsObj = await axios.get(
      `https://blockstream.info/api/block/${blockId}/txs/${startIndex}`
    );
    return blockTransactionsObj.data;
  } catch {
    console.log("error in transaction list!");
  }
}

// function which invokes async calls to API to pull transaction information
// returns array of edges (ancestor/descendant relationships)
async function returnEdges() {
  // retrieve the total number of transactions from the API for the specified block
  const block = 680000;
  const totalTxs = await retrieveTotalNumberOfTxs(block);

  // instantiate an array to hold all of the transactions in the block
  // populate allTxs array with all of the transactions from the block, 25 at a time
  // replace the placeholder with 'totalTxns'
  let allTxs = [];
  for (let startIndex = 0; startIndex < totalTxns; startIndex) {
    const next25Txs = await retrieveTxsList(startIndex);
    startIndex = startIndex + 25;
    allTxs = [...allTxs, ...next25Txs];
  }

  // create and populate array to hold all ancestors and descendants
  const txsEdgeArray = new Array(allTxs.length);
  for (let i = 0; i < allTxs.length; i++) {
    const ancestor = allTxs[i].vin[0].txid.toString();
    const descendant = allTxs[i].txid.toString();
    txsEdgeArray[i] = [ancestor, descendant];
  }

  return txsEdgeArray;
}

// function which returns an array that contains all sorted orders of complete parent / child relationships in graph
function findAllAncestrySets(
  graph,
  inDegree,
  sources,
  sortedOrder,
  allSortedOrders
) {
  if (sources.length > 0) {
    for (let i = 0; i < sources.length; i++) {
      const ancestor = sources[i];
      sortedOrder.push(ancestor);
      const sourcesForNextCall = sources.slice(0); // clone current sources
      sourcesForNextCall.splice(sourcesForNextCall.indexOf(ancestor), 1); // remove current source
      // get ancestors descendants and decrement their inDegrees
      if (graph[ancestor]) {
        graph[ancestor].forEach((descendant) => {
          inDegree[descendant]--;
          if (inDegree[descendant] === 0) {
            sourcesForNextCall.push(descendant);
          }
        });

        // recursive call the print other orderings from the remaining and new sources
        findAllAncestrySets(
          graph,
          inDegree,
          sourcesForNextCall,
          sortedOrder,
          allSortedOrders
        );

        // backtrack, remove the ancestor from the sorted order and pull all descendants back to consider next source
        sortedOrder.splice(sortedOrder.indexOf(ancestor), 1);
        for (i = 0; i < graph[ancestor].length; i++) {
          inDegree[graph[ancestor][i]] += 1;
        }
      }
    }
  }

  allSortedOrders.push(sortedOrder);
}

// function receiving the output of the returnEdges function which then generates graph, inDegree and sources
// for the specified block and then invokes find allAncestrySets to generate list of all relationships in block
async function countAncestors() {
  const txsEdgeArray = await returnEdges();

  // iterate through edge array and create adjacency list and inDegree
  const graph = {};
  const inDegree = {};
  txsEdgeArray.forEach((edge) => {
    const ancestor = edge[0];
    const descendant = edge[1];
    if (!graph[ancestor]) graph[ancestor] = [descendant];
    else graph[ancestor.push(descendant)];
    if (!inDegree[descendant]) inDegree[descendant] = 1;
    else inDegree[descendant]++;
  });

  // create array to hold the sources (ultimate parent nodes with no ancestors)
  const sources = [];
  for (let i = 0; i < txsEdgeArray.length; i++) {
    if (!inDegree[txsEdgeArray[i][0]]) sources.push(txsEdgeArray[i][0]);
  }

  // find all topological sorted orders of the graph
  const sortedOrder = [];
  const allSortedOrders = [];
  // const allAncestrySets = findAllAncestrySets(
  //   graph,
  //   inDegree,
  //   sources,
  //   sortedOrder,
  //   allSortedOrders
  // );

  console.log(allSortedOrders);
}

countAncestors();

server.listen(PORT, console.log(`listening on port ${PORT}`));

module.exports = server;
