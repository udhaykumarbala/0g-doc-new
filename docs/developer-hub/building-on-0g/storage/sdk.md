---
id: sdk
title: Storage SDK
description: "Integrate 0G decentralized storage using Go and TypeScript SDKs. Upload, download, and manage files with key-value storage and browser support."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 0G Storage SDKs

Build decentralized storage into your applications with our powerful SDKs designed for modern development workflows.

## Available SDKs

- **Go SDK**: Ideal for backend systems and applications built with Go
- **TypeScript SDK**: Perfect for frontend development and JavaScript-based projects

## Core Features

Both SDKs provide a streamlined interface to interact with the 0G Storage network:

- **Upload and Download Files**: Securely store and retrieve data of various sizes and formats
- **Manage Data**: List uploaded files, check their status, and control access permissions
- **Leverage Decentralization**: Benefit from the 0G network's distributed architecture for enhanced data availability, immutability, and censorship resistance

## Quick Start Resources

:::tip Starter Kits Available
Get up and running quickly with our starter kits:

- **[TypeScript Starter Kit](https://github.com/0gfoundation/0g-storage-ts-starter-kit)** - CLI scripts, importable library, and browser UI with MetaMask wallet connect. Supports turbo/standard modes.
- **[Go Starter Kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)** - Ready-to-use examples with Gin server and CLI tool

```bash
# TypeScript — upload a file in under 5 minutes
git clone https://github.com/0gfoundation/0g-storage-ts-starter-kit
cd 0g-storage-ts-starter-kit && npm install
cp .env.example .env   # Add your PRIVATE_KEY
npm run upload -- ./file.txt
```
:::

<Tabs>
<TabItem value="go" label="Go SDK" default>

## Installation

Install the 0G Storage Client library:

```bash
go get github.com/0gfoundation/0g-storage-client
```

## Setup

### Import Required Packages

```go
import (
    "context"
    "github.com/0gfoundation/0g-storage-client/common/blockchain"
    "github.com/0gfoundation/0g-storage-client/common"
    "github.com/0gfoundation/0g-storage-client/indexer"
    "github.com/0gfoundation/0g-storage-client/transfer"
    "github.com/0gfoundation/0g-storage-client/core"
)
```

### Initialize Clients

Create the necessary clients to interact with the network:

```go
// Create Web3 client for blockchain interactions
w3client := blockchain.MustNewWeb3(evmRpc, privateKey)
defer w3client.Close()

// Create indexer client for node management
indexerClient, err := indexer.NewClient(indRpc, indexer.IndexerClientOption{
    LogOption: common.LogOption{},
})
if err != nil {
    // Handle error
}
```

**Parameters:**
`evmRpc` is the chain RPC endpoint, `privateKey` is your signer key, and `indRpc` is the indexer RPC endpoint. Use the current values published in the network overview docs for your network.

## Core Operations

### Node Selection

Select storage nodes before performing file operations:

```go
nodes, err := indexerClient.SelectNodes(ctx, expectedReplicas, droppedNodes, method, fullTrusted)
if err != nil {
    // Handle error
}
```

**Parameters:**
`ctx` is the context for the operation. `expectedReplicas` is the number of replicas to maintain. `droppedNodes` is a list of nodes to exclude, `method` can be `min`, `max`, `random`, or a positive number string, and `fullTrusted` limits selection to trusted nodes.

### File Upload

Upload files to the network with the indexer client:

```go
file, err := core.Open(filePath)
if err != nil {
    // Handle error
}
defer file.Close()

fragmentSize := int64(4 * 1024 * 1024 * 1024)
opt := transfer.UploadOption{
    ExpectedReplica:  1,
    TaskSize:         10,
    SkipTx:           true,
    FinalityRequired: transfer.TransactionPacked,
    FastMode:         true,
    Method:           "min",
    FullTrusted:      true,
}

txHashes, roots, err := indexerClient.SplitableUpload(ctx, w3client, file, fragmentSize, opt)
if err != nil {
    // Handle error
}
```

`fragmentSize` controls the split size for large files. The returned `roots` contain the merkle root(s) to download later.

### File Hash Calculation

Calculate a file's Merkle root hash for identification:

```go
rootHash, err := core.MerkleRoot(filePath)
if err != nil {
    // Handle error
}
fmt.Printf("File hash: %s\n", rootHash.String())
```

:::info Important
Save the root hash - you'll need it to download the file later!
:::

### File Download

Download files from the network:

```go
rootHex := rootHash.String()
err = indexerClient.Download(ctx, rootHex, outputPath, withProof)
if err != nil {
    // Handle error
}
```

`withProof` enables merkle proof verification during download.

## Best Practices

1. **Error Handling**: Implement proper error handling and cleanup
2. **Context Management**: Use contexts for operation timeouts and cancellation
3. **Resource Cleanup**: Always close clients when done using `defer client.Close()`
4. **Verification**: Enable proof verification for sensitive files
5. **Monitoring**: Track transaction status for important uploads

## Additional Resources

- [Go SDK Repository](https://github.com/0gfoundation/0g-storage-client)
- [Go Starter Kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)

</TabItem>
<TabItem value="typescript" label="TypeScript SDK">

## Installation

Install the SDK and its peer dependency:

```bash
npm install @0gfoundation/0g-storage-ts-sdk ethers
```

:::note
`ethers` is a required peer dependency for blockchain interactions
:::

## Setup

### Import Required Modules

```javascript
import { ZgFile, Indexer, MemData } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';
```

### Initialize Configuration

```javascript
// Network endpoints — see network overview docs for current values
// Turbo indexer (recommended):
const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// Initialize indexer — flow contract is auto-discovered
const indexer = new Indexer(INDEXER_RPC);
```

:::info Turbo vs Standard
0G Storage has two independent networks: **Turbo** (faster, higher fees) and **Standard** (slower, lower fees). Each uses a different indexer URL. The SDK auto-discovers the correct flow contract from the indexer. See [Testnet](/developer-hub/testnet/testnet-overview) or [Mainnet](/developer-hub/mainnet/mainnet-overview) for current endpoints.
:::

## Core Operations

### File Upload

Upload a file from the filesystem:

```javascript
async function uploadFile(filePath) {
  const file = await ZgFile.fromFilePath(filePath);

  // Must call merkleTree() before upload — populates internal state
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null) throw new Error(`Merkle tree error: ${treeErr}`);

  console.log("Root Hash:", tree?.rootHash());

  const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer);
  if (uploadErr !== null) throw new Error(`Upload error: ${uploadErr}`);

  await file.close(); // Always close when done

  // Handle both single and fragmented (>4GB) responses
  if ('rootHash' in tx) {
    return { rootHash: tx.rootHash, txHash: tx.txHash };
  } else {
    return { rootHashes: tx.rootHashes, txHashes: tx.txHashes };
  }
}
```

### Upload In-Memory Data

Upload strings or buffers without writing to disk using `MemData`:

```javascript
const data = new TextEncoder().encode('Hello, 0G Storage!');
const memData = new MemData(data);
const [tree, treeErr] = await memData.merkleTree();
const [tx, err] = await indexer.upload(memData, RPC_URL, signer);
```

### File Download

Download with optional verification:

```javascript
async function downloadFromIndexer(rootHash, outputPath) {
  // withProof = true enables Merkle proof verification
  const err = await indexer.download(rootHash, outputPath, true);
  if (err !== null) {
    throw new Error(`Download error: ${err}`);
  }
  console.log("Download successful!");
}
```

### Key-Value Storage

Store and retrieve key-value data:

```javascript
// Upload data to 0G-KV
async function uploadToKV(streamId, key, value) {
  const [nodes, err] = await indexer.selectNodes(1);
  if (err !== null) {
    throw new Error(`Error selecting nodes: ${err}`);
  }

  const batcher = new Batcher(1, nodes, flowContract, RPC_URL);

  const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
  const valueBytes = Uint8Array.from(Buffer.from(value, 'utf-8'));
  batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);

  const [tx, batchErr] = await batcher.exec();
  if (batchErr !== null) {
    throw new Error(`Batch execution error: ${batchErr}`);
  }

  console.log("KV upload successful! TX:", tx);
}

// Download data from 0G-KV
async function downloadFromKV(streamId, key) {
  const kvClient = new KvClient("http://3.101.147.150:6789");
  const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
  const value = await kvClient.getValue(streamId, ethers.encodeBase64(keyBytes));
  return value;
}
```

### Browser Support

For browser environments, use the SDK's `Blob` class (alias it to avoid collision with native `Blob`):

```javascript
import { Blob as ZgBlob, Indexer } from '@0gfoundation/0g-storage-ts-sdk';
import { BrowserProvider } from 'ethers';

// Connect wallet via MetaMask
const provider = new BrowserProvider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = await provider.getSigner();

// Upload a browser File object
const zgBlob = new ZgBlob(fileInput.files[0]);
const [tree, treeErr] = await zgBlob.merkleTree();
const indexer = new Indexer(INDEXER_RPC);
const [tx, err] = await indexer.upload(zgBlob, RPC_URL, signer);
```

:::note Browser Downloads
`indexer.download()` uses `fs.appendFileSync` internally and does not work in browsers. For browser downloads, use `StorageNode.downloadSegmentByTxSeq()` to fetch segments manually and reassemble in memory. See the [TypeScript Starter Kit](https://github.com/0gfoundation/0g-storage-ts-starter-kit) `web/src/storage.ts` for a complete working implementation.
:::

:::caution Vite/Webpack Setup
The SDK imports Node.js modules (`fs`, `crypto`) at load time. You need polyfills and stub aliases for browser bundlers. See the starter kit's `web/vite.config.ts` for a working Vite configuration with `vite-plugin-node-polyfills`.
:::

### Encryption & Decryption

:::note
Requires `@0gfoundation/0g-storage-ts-sdk` v1.2.6 or later.
:::

Files are encrypted client-side before upload — the 0G network never sees plaintext. A compact header (17–50 bytes) is prepended so the SDK can auto-detect encryption mode on download.

| Mode | Key material | Header size |
|------|-------------|-------------|
| `aes256` | 32-byte symmetric key | 17 bytes |
| `ecies` | secp256k1 keypair | 50 bytes |

#### AES-256

```javascript
import { ZgFile, Indexer } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

const indexer = new Indexer(indexerRpc);
const signer = new ethers.Wallet(privateKey, provider);

// save this: there is no server-side recovery
const key = crypto.randomBytes(32); // Node.js — or crypto.getRandomValues in browser

const file = await ZgFile.fromFilePath('./secret.txt');
const [tx, err] = await indexer.upload(file, rpcUrl, signer, {
  encryption: { type: 'aes256', key },
});

// Download + decrypt
const [blob, dlErr] = await indexer.downloadToBlob(rootHash, {
  proof: true,
  decryption: { symmetricKey: key },
});
```

#### ECIES

For encrypt-to-self, your wallet's existing secp256k1 key works for both storage signing and decryption. Pass any recipient's compressed public key to encrypt for someone else.

```javascript
import { ZgFile, Indexer } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

const wallet = new ethers.Wallet(privateKey, provider);
const recipientPubKey = ethers.SigningKey.computePublicKey(
  wallet.signingKey.publicKey, true  // true = compressed 33-byte key
);

const file = await ZgFile.fromFilePath('./secret.txt');
const [tx, err] = await indexer.upload(file, rpcUrl, signer, {
  encryption: { type: 'ecies', recipientPubKey },
});

// Download + decrypt
const [blob, dlErr] = await indexer.downloadToBlob(rootHash, {
  proof: true,
  decryption: { privateKey },
});
```

#### Detecting encryption mode

```javascript
import { Indexer } from '@0gfoundation/0g-storage-ts-sdk';

const [header, err] = await indexer.peekHeader(rootHash);
// returns null for plaintext files
// header.version === 1 → aes256
// header.version === 2 → ecies
```

:::note
Wrong key does not throw — `downloadToBlob` silently returns raw ciphertext if the key doesn't match. Call `peekHeader` first if you are unsure whether a file is encrypted.

`indexer.download()` does not support decryption. For encrypted files, always use `indexer.downloadToBlob()`. Large files will be fully buffered in memory.
:::

## Best Practices

1. **Initialize Once**: Create the indexer once and reuse it for multiple operations
2. **Handle Errors**: Always implement proper error handling for network issues
3. **Use Appropriate Methods**: Use `ZgFile.fromFilePath` for Node.js and `Blob` for browsers
4. **Secure Keys**: Never expose private keys in client-side code
5. **Close Resources**: Remember to call `file.close()` after operations

## Additional Resources

- [TypeScript SDK Repository](https://github.com/0gfoundation/0g-storage-ts-sdk)
- [TypeScript Starter Kit](https://github.com/0gfoundation/0g-storage-ts-starter-kit) — Scripts, library, and browser UI with MetaMask

</TabItem>
</Tabs>

---

*Need more control? Consider running your own [storage node](/run-a-node/storage-node) to participate in the network and earn rewards.*
