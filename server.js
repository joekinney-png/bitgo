const http = require("http");
const fetch = require("node-fetch");
const axios = require("axios");
const PORT = 3000;

const server = http.createServer((request, response) => {});

// test fetch request and print hello world upon successful submission using node-fetch
async function testFetch() {
  try {
    const reply = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const parsedReply = await reply.json();
    console.log("hello world, here is the response from the test fetch:");
    console.log(parsedReply);
  } catch {
    console.log("There was an error!");
  }
}
testFetch();

// example POST request usinf fetch, as alternative to .get
async function testFetchPOST() {
  try {
    const reply = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
      method: "POST",
      body: JSON.stringify({ test: "test post body" }),
    });
    const parsedReply = await reply.json();
    console.log("hello world, here is the async fetch:");
    console.log(parsedReply);
  } catch {
    console.log("There was an error!");
  }
}
// testFetchPOST();

// test fetch request and print hello world upon successful submissino using axios
axios
  .get("https://jsonplaceholder.typicode.com/todos/1")
  .then(function (response) {
    console.log("hello world, here is the axios fetch:");
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });

// example POST request using axios, as alternative to .get
// axios({
//   method: "post",
//   url: "/user/12345",
//   data: {
//     firstName: "Fred",
//     lastName: "Flintstone",
//   },
// });

server.listen(PORT, console.log(`listening on port ${PORT}`));

module.exports = server;
