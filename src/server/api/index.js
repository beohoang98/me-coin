const route = require("express").Router({ mergeParams: true });
const multer = require("multer");
const crypto = require("crypto");
const Blockchain = require("../../blockchain/blockchain");
const fs = require("fs");
const axios = require("axios");
const { v4 } = require("uuid");

route.get("/block/:blockHash", (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = backup.getBlock(blockHash);
  res.json({
    block: correctBlock,
  });
});

/*  -get transaction by transactionId-  */
route.get("/transaction/:transactionId", (req, res) => {
  const transactionId = req.params.transactionId;
  const trasactionData = backup.getTransaction(transactionId);
  res.json({
    transaction: trasactionData.transaction,
    block: trasactionData.block,
  });
});

/*  -get address by address-  */
route.get("/address/:address", (req, res) => {
  const address = req.params.address;
  const addressData = backup.getAddressData(address);
  res.json({
    addressData: addressData,
  });
});

/*  -get wallet info by address-  */
route.get("/address-info/:address", (req, res) => {
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

  const addressData = backup.getAddressData(address);
  const lastBlock = backup.getLastBlock();

  res.json({
    amount: addressData.addressBalance,
    lastBlock: lastBlock.index,
  });
});

/*  -get lasted block by address-  */
route.get("/lasted-blocks/:address", (req, res) => {
  const address = req.params.address;
  const blockchain = JSON.parse(
    fs.readFileSync(`data/backup/${address}.json`, "utf8")
  );

  const blocks = [];

  const { chain } = blockchain;

  chain.forEach((e) => {
    blocks.push({
      idx: e.index,
      date: e.date,
      nonce: e.nonce,
      hash: e.hash,
      previousHash: e.previousBlockHash,
    });
  });

  res.json({
    blocks: blocks,
  });
});

/*  -get lasted transactions by address-  */
route.get("/lasted-transactions/:address", (req, res) => {
  const address = req.params.address;
  const blockchain = JSON.parse(
    fs.readFileSync(`data/backup/${address}.json`, "utf8")
  );

  let transactions = [];

  const { chain } = blockchain;

  chain.forEach((e) => {
    transactions = transactions.concat(e.transactions);
  });

  res.json({
    transactions: transactions,
  });
});

/*  -get pending transactions by address-  */
route.get("/pending-transactions/:address", (req, res) => {
  const address = req.params.address;
  const blockchain = JSON.parse(
    fs.readFileSync(`data/backup/${address}.json`, "utf8")
  );

  const { pendingTransactions } = blockchain;

  res.json({
    pendingTransactions: pendingTransactions,
  });
});

module.exports = route;
