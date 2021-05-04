const { v4: uuid } = require("uuid");
const crypto = require("crypto");

const DIFFICULTY = 4;

function Blockchain(
  privateKey,
  publicKey,
  chain,
  pendingTransactions
) {
  this.privateKey = privateKey;
  this.publicKey = publicKey;

  if (
    chain === undefined &&
    pendingTransactions === undefined
  ) {
    this.chain = [];
    this.pendingTransactions = [];
    this.createNewBlock(100, "0", "0"); //Genesis block.
  } else {
    this.chain = chain;
    this.pendingTransactions = pendingTransactions;
  }
}

/*init a new block to the chain and insert pending transactions into the block.*/
Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    date: new Date().toString(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash,
  };
  this.pendingTransactions = []; //reset the pendingTransactions for the next block.
  this.chain.push(newBlock); //push to the blockchain the new block.
  return newBlock;
};

/*returns the last block of the chain.*/
Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

/*init a transaction into pendingTransactions.*/
Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    transactionId: uuid(),
    amount: amount,
    date: Date.now(),
    sender: sender,
    recipient: recipient,
  };

  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function (
  transactionObject
) {
  this.pendingTransactions.push(transactionObject); //push to the pendingTransactions array a new transaction
  return this.getLastBlock()["index"] + 1;
};

/*hash block method.*/
Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData); //merge parameters into a single string.

  const hash = crypto.createHash("sha256").update(dataAsString).digest("hex");
  return hash;
};

/*Proof Of Work method.*/
Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (!hash.startsWith("0".repeat(DIFFICULTY))) {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};

Blockchain.prototype.chainIsValid = function (blockchain) {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(
      prevBlock["hash"],
      {
        transactions: currentBlock["transactions"],
        index: currentBlock["index"],
      },
      currentBlock["nonce"]
    );
    if (!blockHash.startsWith("0".repeat(DIFFICULTY))) {
      return false;
    }
    if (currentBlock["previousBlockHash"] !== prevBlock["hash"]) {
      return false;
    }
  }

  //check genesis block validation
  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock["nonce"] === 100;
  const correctPreviousBlockHash = genesisBlock["previousBlockHash"] === "0";
  const correctHash = genesisBlock["hash"] === "0";
  const correctTransactions = genesisBlock["transactions"].length === 0;

  if (
    !correctNonce ||
    !correctPreviousBlockHash ||
    !correctHash ||
    !correctTransactions
  )
    return false;

  return true;
};

Blockchain.prototype.getBlock = function (blockHash) {
  return this.chain.find((block) => block.hash === blockHash);
};

Blockchain.prototype.getTransaction = function (transactionId) {
  for (const block of this.chain) {
    for (const transaction of block.transactions) {
      if (transaction.transactionId !== transactionId) continue;
      return {
        transaction,
        block,
      };
    }
  }
  return {
    transaction: null,
    block: null,
  };
};

Blockchain.prototype.getPendingTransactions = function () {
  return this.pendingTransactions;
};

Blockchain.prototype.getAddressData = function (address) {
  const transactions = [];
  const amountArr = [];
  let balance = 0;

  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.sender === address) {
        transactions.push(transaction);
        balance -= transaction.amount;
        amountArr.push(balance);
      } else if (transaction.recipient === address) {
        transactions.push(transaction);
        balance += transaction.amount;
        amountArr.push(balance);
      }
    });
  });

  return {
    transactions,
    balance,
    amountArr,
  };
};

module.exports = Blockchain;
