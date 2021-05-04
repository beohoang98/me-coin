const express = require("express");
const app = express();
const Blockchain = require("../blockchain/blockchain");
const { v4: uuid } = require("uuid");
var path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const { generateKeyPair } = require("./utils/crypto");

if (fs.existsSync("data/account.json")) {
  const accountJson = fs.readFileSync("data/account.json", "utf8");
  const {
    publicKey,
    privateKey,
    walletAddress,
  } = JSON.parse(accountJson);

  app.request.publicKey = publicKey;
  app.request.privateKey = privateKey; 
  app.request.walletAddress = walletAddress; 
} else {
  const { privateKey, publicKey } = generateKeyPair();
  const walletAddress = uuid();
  app.request.publicKey = publicKey;
  app.request.privateKey = privateKey;
  app.request.walletAddress = walletAddress;
  fs.writeFileSync("data/account.json", JSON.stringify({
    publicKey,
    privateKey,
    walletAddress,
  }));
}
app.locals.publicKey = app.request.publicKey;
app.locals.privateKey = app.request.privateKey;
app.locals.walletAddress = app.request.walletAddress; 

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

const port = process.env.PORT || 3000;
server = http.createServer(app);
const io = require("socket.io")(server);

app.use("/css", express.static(path.resolve(__dirname, "views/css"))); //allow css in invitation page (public)
app.use("/lib", express.static(path.resolve(__dirname, "../../node_modules"), {
  extensions: "js",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./api"));
app.use("/", require("./routes"));

app.post("/transaction/broadcast", (req, res) => {
  const amount = parseFloat(req.body.amount);
  let flag = true;
  let sender = req.body.sender;
  let recipient = req.body.recipient;
  let backup;
  const nodes = [];

  const blockChains = JSON.parse(
    fs.readFileSync("data/block-chains.json", "utf8")
  );

  blockChains.forEach((e) => {
    nodes.push(
      new Blockchain(
        e.privateKey,
        e.publicKey,
        e.chain,
        e.pendingTransactions,
        e.currentNodeUrl
      )
    );
  });

  if (sender === "system-reward" || sender === "system-reward: new user") {
    const blockChain = JSON.parse(
      fs.readFileSync(`data/backup/${recipient}.json`, "utf8")
    );

    backup = new Blockchain(
      blockChain.privateKey,
      blockChain.publicKey,
      blockChain.chain,
      blockChain.pendingTransactions,
      blockChain.currentNodeUrl
    );
  } else {
    const blockChain = JSON.parse(
      fs.readFileSync(`data/backup/${sender}.json`, "utf8")
    );

    backup = new Blockchain(
      blockChain.privateKey,
      blockChain.publicKey,
      blockChain.chain,
      blockChain.pendingTransactions,
      blockChain.currentNodeUrl
    );
  }

  const newTransaction = nodes[nodes.length - 1].createNewTransaction(
    amount,
    req.body.sender,
    req.body.recipient
  );

  /*  -Authentication: check for valid private key-  */
  if (sender !== "system-reward" && sender !== "system-reward: new user") {
    const privateKey_Is_Valid = sha256(req.body.privKey) === req.body.sender;
    if (!privateKey_Is_Valid) {
      flag = false;
      res.json({
        note: false,
      });
    }
    /*  -Authentication: check if user have the require amount of coins for current transaction && if user exist in the blockchain-  */
    const addressData = backup.getAddressData(req.body.sender);
    const addressData1 = backup.getAddressData(req.body.recipient);
    if (
      addressData.addressBalance < amount ||
      addressData === false ||
      addressData1 === false
    ) {
      flag = false;
      res.json({
        note: false,
      });
    }
    /*  -Authentication: fields cannot be empty-  */
    if (
      req.body.amount.length === 0 ||
      amount === 0 ||
      amount < 0 ||
      req.body.sender.length === 0 ||
      req.body.recipient.length === 0
    ) {
      flag = false;
      return res.json({
        note: false,
      });
    }
  }

  if (amount > 0 && flag === true) {
    var pt = null;
    backup.addTransactionToPendingTransactions(newTransaction); //put new transaction in global object

    console.log({ backup });

    nodes.forEach((node) => {
      node.addTransactionToPendingTransactions(newTransaction);

      // io.clients().sockets[node.privateKey.toString()].pendingTransactions =
      //   node.pendingTransactions; //add property to socket
      pt = node.pendingTransactions;
    });
    io.clients().emit("PT", pt); //emit to all sockets

    fs.writeFile(
      "data/block-chains.json",
      JSON.stringify(nodes),
      function (err) {
        if (err) throw err;
        console.log("write block chains complete!");
      }
    );

    if (sender === "system-reward" || sender === "system-reward: new user") {
      fs.writeFile(
        `data/backup/${recipient}.json`,
        JSON.stringify(backup),
        function (err) {
          if (err) throw err;
          console.log("write back up block chain complete!");
        }
      );

      res.json({
        note: `Transaction complete!`,
      });
    } else {
      fs.writeFile(
        `data/backup/${sender}.json`,
        JSON.stringify(backup),
        function (err) {
          if (err) throw err;
          console.log("write back up block chain complete!");
        }
      );

      res.json({
        note: `Transaction complete!`,
      });
    }
  }
});

/*
 * Title: Miner section
 * Description: user mine the last block of transaction by POW, getting reward and init a new block
 */
app.get("/mine/:address", (req, res) => {
  const address = req.params.address;
  const blockchain = JSON.parse(
    fs.readFileSync(`data/backup/${address}.json`, "utf8")
  );

  const { privateKey, publicKey, chain, pendingTransactions, currentNodeUrl } =
    blockchain;

  const backup = new Blockchain(
    privateKey,
    publicKey,
    chain,
    pendingTransactions,
    currentNodeUrl
  );

  const lastBlock = backup.getLastBlock();
  const previousBlockHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: backup.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  const nonce = backup.proofOfWork(previousBlockHash, currentBlockData); //doing a proof of work
  const blockHash = backup.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  ); //hash the block
  const newBlock = backup.createNewBlock(nonce, previousBlockHash, blockHash); //create a new block with params

  const requestOptions = {
    //a promise to make a new block
    uri: backup.currentNodeUrl + `/receive-new-block/${address}`,
    method: "POST",
    body: { newBlock: newBlock },
    json: true,
  };
  rp(requestOptions)
    .then((data) => {
      //reward the miner after mining succed and new block already created
      const requestOptions = {
        uri: backup.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 12.5,
          sender: "system-reward",
          recipient: address,
        },
        json: true,
      };
      return rp(requestOptions);
    })
    .then((data) => {
      res.json({
        note: "New block mined and broadcast successfully",
        block: newBlock,
      });
    });
});

/*
 * Title: receive new block section
 * Description: checking validity of new block.
 */
app.post("/receive-new-block/:address", (req, res) => {
  const address = req.params.address;
  const nodes = [];

  const blockChains = JSON.parse(
    fs.readFileSync("data/block-chains.json", "utf8")
  );

  blockChains.forEach((e) => {
    nodes.push(
      new Blockchain(
        e.privateKey,
        e.publicKey,
        e.chain,
        e.pendingTransactions,
        e.currentNodeUrl
      )
    );
  });

  const blockchain = JSON.parse(
    fs.readFileSync(`data/backup/${address}.json`, "utf8")
  );

  const { privateKey, publicKey, chain, pendingTransactions, currentNodeUrl } =
    blockchain;

  const backup = new Blockchain(
    privateKey,
    publicKey,
    chain,
    pendingTransactions,
    currentNodeUrl
  );

  const newBlock = req.body.newBlock;
  const lastBlock = backup.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

  if (correctHash && correctIndex) {
    backup.chain.push(newBlock);
    backup.pendingTransactions = [];

    const idxCurrBlockChain = nodes.findIndex(
      (e) =>
        e.privateKey === backup.privateKey && e.publicKey === backup.publicKey
    );

    if (idxCurrBlockChain !== -1) {
      nodes[idxCurrBlockChain] = backup;
    }

    fs.writeFile(
      `data/backup/${address}.json`,
      JSON.stringify(backup),
      function (err) {
        if (err) throw err;
        console.log("write back up block chain complete!");
      }
    );

    fs.writeFile(
      "data/block-chains.json",
      JSON.stringify(nodes),
      function (err) {
        if (err) throw err;
        console.log("write block chains complete!");
      }
    );

    res.json({
      note: "New block received and accepted.",
      newBlock: newBlock,
    });
  } else {
    res.json({
      note: "New block rejected",
      newBlock: newBlock,
    });
  }
});

/*
 * Title: emitMiningSuccess
 * Description: emit all sockets - a message to all sockets for mining operation succed
 */
app.get("/emitMiningSuccess", (req, res) => {
  io.clients().emit("mineSuccess", true); //emit to all sockets
});

/*
 * Title: pendingTransactions
 * Description: get all pending Transactions
 */
app.get("/pendingTransactions", (req, res) => {
  const transactionsData = backup.getPendingTransactions();
  res.json({
    pendingTransactions: transactionsData,
  });
});

/*
 * Title: Main Blockchain
 * Description: display the whole block chain (Developers Only!)
 */
app.get("/blockchain", (req, res) => {
  res.send(backup);
});

require("./p2p/")(io);

server.listen(port, "0.0.0.0", () => {
  console.log("Server listen at " + port);
});
