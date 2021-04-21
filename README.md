For more details and pictures:
http://www.morc.io/CRYPTO%20CURRENCY%20BLOCKCHAIN

## First of all...
I remember it all started when there was a big buzz around the blockchain world and cryptographic currencies (especially around the Bitcoin currency). I started reading about the topic and was very excited about the idea itself. In addition, the subject of cryptography and cyber security was very interesting to me at that time. So I downloaded the article "Bitcoin: A Peer-to-Peer Electronic Cash System" by Satoshi Nakamoto (the legend) that explains in an excellent way how the system works! For example, how to solve the double-spending problem to avoid the need for a trusted third party with money transactions via "Proof Of Work" based on "Consensus Mechanism". Of course I tried to implement it. The choice was Node.js for the reason I also wanted to experiment with this platform at the time.. So why not to kill two birds with one stone? ;)

## What did I create?
A decentralized blockchain cryptocurrency network based on websockets/P2P with almost one single HTML page. The user have a distibuted ledger and can do coin transactions, see the account state, chat, invite friends by Email invitations, mine coins, and explor the network with the "Block Explorer" system. Each user have a private and public keys such that the public key used for public identification and private key for transaction and account actions. The project comes in two different versions: The first one is "pure" blockchain based on peer to peer network (each peer count as a port, eg 3001,3002 etc, at the localhost). The instructions ("How to") is on the above github link. The second version (and more developed) is based on websockets: CLICK-ME

# BLOCKCHAIN SYSTEM
A growing list of records, called blocks, that are linked using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.

# DISTRIBUTED LEDGER
The distributed ledger database is spread across several nodes (peers/PC's) on a peer-to-peer network, where each replicates and saves an identical copy of the ledger and updates itself independently. The primary advantage is the lack of central authority. When a ledger update happens, each node constructs the new transaction, and then the nodes vote by consensus algorithm on which copy is correct. Once a consensus has been determined, all the other nodes update themselves with the new, correct copy of the ledger. Security is accomplished through cryptographic keys and signatures.

# CONSENSUS MECHANISM (POW) AND CRYPTOCURRENCY MINNING SYSTEM
Validation of transction via consensus. The motivation to mine coins comes from the reward of the system that gives to the miner some amount of coins as a gift for each block that aproved by the consensus mechanism.

# CRYPTOCURRENCY WALLET
Include a private and public keys.

# INVITATION SYSTEM 
Each user can invite a friend via Email invitation including a temporary link that expires after some time if not clicked. The system reward each user with some amount of coins to motivate the user to invite a friend and the friend to be invited.

# BLOCK EXPLORER SYSTEM
A blockchain browser which displays the contents of individual coin blocks and transactions and the transaction histories and balances of addresses.

# THE WEBSOCKET VERSION
Virtual guide system.
Chat system
Have Fun :)


# Connect MongoDB
## Setup with docker 

- step 1 
```
docker-compose build
```

- step 2
```
docker-compose up
```

- Connection string

```
mongodb://admin:admin@localhost:27017
```

# Start

- setup
```
npm install
```

- node 1
```
npm run node_1
```

- node 2
```
npm run node_2
```

- node 3
```
npm run node_3
```

- node 4
```
npm run node_4
```

- node 5
```
npm run node_5
```


