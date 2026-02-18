---
id: storage-cli
title: Storage CLI
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 0G Storage CLI

The 0G Storage CLI is your command-line gateway to interact directly with the 0G Storage network. It simplifies the process of uploading and downloading files while providing full control over your decentralized storage operations.

## Why Use the CLI?

- **Direct Control**: Manage data location and versioning with precision
- **Automation Ready**: Build scripts and cron jobs for regular operations
- **Full Feature Access**: Access all storage and KV operations from the terminal
- **Developer Friendly**: Perfect for integrating into your development workflow

:::tip Web-Based Alternative
For a quick and easy web interface, try the [0G Storage Web Tool](https://storagescan-galileo.0g.ai/tool) - perfect for one-off uploads and downloads.
:::

## Installation

### Prerequisites
- Go 1.18 or higher installed on your system
- Git for cloning the repository

### Setup Steps

**1. Clone the Repository**

```bash
git clone https://github.com/0gfoundation/0g-storage-client.git
cd 0g-storage-client
```

**2. Build the Binary**

```bash
go build
```

**3. Add to PATH** (Optional but recommended)

```bash
# Move binary to Go bin directory
mv 0g-storage-client ~/go/bin

# Add to PATH if not already configured
export PATH=~/go/bin:$PATH
```

## Command Overview

The CLI provides a comprehensive set of commands for storage operations:

```
0g-storage-client [command] [flags]

Available Commands:
  upload      Upload file to 0G Storage network
  download    Download file from 0G Storage network
  upload-dir  Upload directory to 0G Storage network
  download-dir Download directory from 0G Storage network
  diff-dir    Diff directory from 0G Storage network
  gen         Generate test files
  kv-write    Write to KV streams
  kv-read     Read KV streams
  gateway     Start gateway service
  indexer     Start indexer service
  deploy      Deploy storage contracts
  completion  Generate shell completion scripts
  help        Get help for any command

Global Flags:
  --gas-limit uint                Custom gas limit to send transaction
  --gas-price uint                Custom gas price to send transaction
  --log-level string              Log level (default "info")
  --log-color-disabled            Force to disable colorful logs
  --rpc-retry-count int           Retry count for rpc request (default 5)
  --rpc-retry-interval duration   Retry interval for rpc request (default 5s)
  --rpc-timeout duration          Timeout for single rpc request (default 30s)
  --web3-log-enabled              Enable Web3 RPC logging
```

## Core Operations

### File Upload

Upload files to the 0G Storage network using the indexer service or explicit nodes:

```bash
0g-storage-client upload \
  --url <blockchain_rpc_endpoint> \
  --key <private_key> \
  --indexer <storage_indexer_endpoint> \
  --file <file_path>
```

**Parameters:**
`--url` is the chain RPC endpoint, `--key` is your private key, and `--file` is the path to the file you want to upload. Use exactly one of `--indexer` or `--node`.

Common flags include `--tags`, `--submitter`, `--expected-replica`, `--skip-tx`, `--finality-required`, `--task-size`, `--fast-mode`, `--fragment-size`, `--routines`, `--fee`, `--nonce`, `--max-gas-price`, `--n-retries`, `--step`, `--method`, `--full-trusted`, `--timeout`, `--flow-address`, and `--market-address`.

Fee notes (turbo):
- `unitPrice = 11 / pricePerToken / 1024 * 256`. If `pricePerToken = 1`, then `unitPrice = 2.75` (tokens), or `2.75e18` a0gi.
- `pricePerSector(256B)/month = lifetimeMonth * unitPrice * 1e18 / 1024 / 1024 / 1024` (no `/12` since $11 is per TB per month).

### File Download

Download files from the network using the indexer or explicit nodes:

```bash
0g-storage-client download \
  --indexer <storage_indexer_endpoint> \
  --root <file_root_hash> \
  --file <output_file_path>
```

**Parameters:**
`--file` is the output path. Use exactly one of `--indexer` or `--node`. Use exactly one of `--root` or `--roots`.

### Download with Verification

Enable proof verification for enhanced security:

```bash
0g-storage-client download \
  --indexer <storage_indexer_endpoint> \
  --root <file_root_hash> \
  --file <output_file_path> \
  --proof
```

The `--proof` flag requests cryptographic proof of data integrity from the storage node.

### Directory Upload

Upload an entire directory using explicit storage nodes:

```bash
0g-storage-client upload-dir \
  --url <blockchain_rpc_endpoint> \
  --key <private_key> \
  --node <storage_node_endpoint> \
  --file <directory_path>
```

### Directory Download

Download a directory by root:

```bash
0g-storage-client download-dir \
  --indexer <storage_indexer_endpoint> \
  --root <directory_root_hash> \
  --file <output_directory>
```

### Directory Diff

Compare a local directory with the on-chain version:

```bash
0g-storage-client diff-dir \
  --indexer <storage_indexer_endpoint> \
  --root <directory_root_hash> \
  --file <local_directory>
```

## Practical Examples

### Upload Example

```bash
# Upload a document to 0G Storage
0g-storage-client upload \
  --url <blockchain_rpc_endpoint> \
  --key YOUR_PRIVATE_KEY \
  --indexer <storage_indexer_endpoint> \
  --file ./documents/report.pdf

# Output:
# ✓ File uploaded successfully
# Root hash: 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
# Transaction: 0x742d35cc6634c0532925a3b844bc454e8e4a0e3f...
```

### Download Example

```bash
# Download file using root hash
0g-storage-client download \
  --indexer <storage_indexer_endpoint> \
  --root 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 \
  --file ./downloads/report.pdf

# With verification
0g-storage-client download \
  --indexer <storage_indexer_endpoint> \
  --root 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 \
  --file ./downloads/report.pdf \
  --proof
```

## Key-Value Operations

### Write to KV Store (Batch Operations)

Write multiple key-value pairs in a single operation:

```bash
0g-storage-client kv-write \
  --url <blockchain_rpc_endpoint> \
  --key <private_key> \
  --indexer <storage_indexer_endpoint> \
  --stream-id <stream_id> \
  --stream-keys <comma_separated_keys> \
  --stream-values <comma_separated_values>
```

**Important:** `--stream-keys` and `--stream-values` are comma-separated string lists and their length must be equal.

You can use `--indexer` for node selection or pass storage nodes directly with `--node`. If `--indexer` is omitted, `--node` is required.

**Example:**
```bash
0g-storage-client kv-write \
  --url <blockchain_rpc_endpoint> \
  --key YOUR_PRIVATE_KEY \
  --indexer <storage_indexer_endpoint> \
  --stream-id 1 \
  --stream-keys "key1,key2,key3" \
  --stream-values "value1,value2,value3"
```

### Read from KV Store

```bash
0g-storage-client kv-read \
  --node <kv_node_rpc_endpoint> \
  --stream-id <stream_id> \
  --stream-keys <comma_separated_keys>
```

:::info KV Read Endpoint
Note that for KV read operations, you need to specify `--node` as the URL of a KV node, not the indexer endpoint.
:::

## RESTful API Gateway

The indexer service provides a RESTful API gateway for easy HTTP-based file access:

### File Downloads via HTTP

**By Transaction Sequence Number:**
```
GET /file?txSeq=7
```

**By File Merkle Root:**
```
GET /file?root=0x0376e0d95e483b62d5100968ed17fe1b1d84f0bc5d9bda8000cdfd3f39a59927
```

**With Custom Filename:**
```
GET /file?txSeq=7&name=foo.log
```

### Folder Support

Download specific files from within structured folders:

**By Transaction Sequence:**
```
GET /file/{txSeq}/path/to/file
```

**By Merkle Root:**
```
GET /file/{merkleRoot}/path/to/file
```

## Advanced Features

### Custom Gas Settings

Control transaction costs with custom gas parameters:

```bash
0g-storage-client upload \
  --gas-limit 3000000 \
  --gas-price 10000000000 \
  # ... other parameters
```

### RPC Configuration

Configure RPC retry behavior and timeouts:

```bash
0g-storage-client upload \
  --rpc-retry-count 10 \
  --rpc-retry-interval 3s \
  --rpc-timeout 60s \
  # ... other parameters
```

### Logging Configuration

Adjust logging for debugging:

```bash
# Verbose logging with Web3 details
0g-storage-client upload \
  --log-level debug \
  --web3-log-enabled \
  # ... other parameters

# Minimal logging
0g-storage-client download \
  --log-level error \
  --log-color-disabled \
  # ... other parameters
```

### Shell Completion

Enable tab completion for easier command entry:

```bash
# Bash
0g-storage-client completion bash > /etc/bash_completion.d/0g-storage-client

# Zsh
0g-storage-client completion zsh > "${fpath[1]}/_0g-storage-client"

# Fish
0g-storage-client completion fish > ~/.config/fish/completions/0g-storage-client.fish
```

## Indexer Service

The indexer service provides two types of storage node discovery:

### Trusted Nodes
Well-maintained nodes that provide stable and reliable service.

### Discovered Nodes
Nodes discovered automatically through the P2P network.

The indexer intelligently routes data to appropriate storage nodes based on their shard configurations, eliminating the need to manually specify storage nodes or contract addresses.

## Important Considerations

### Network Configuration

:::info Required Information
**RPC endpoints** and **indexer endpoints** are published in the network overview docs. Use the current values for your network. Keep private keys secure and never share them.
:::

### File Management

- **Root Hash Storage**: Save file root hashes after upload - they're required for downloads
- **Transaction Monitoring**: Track upload transactions on the blockchain explorer
- **Indexer Benefits**: The indexer automatically selects optimal storage nodes for better reliability

## Running Services

### Indexer Service

The indexer helps users find suitable storage nodes:

```bash
0g-storage-client indexer \
  --endpoint :12345 \
  --node <storage_node_endpoint>
```

Or start with a trusted node list:

```bash
0g-storage-client indexer \
  --endpoint :12345 \
  --trusted <node1,node2>
```

### Gateway Service

Run a gateway to provide HTTP access to storage:

```bash
0g-storage-client gateway \
  --nodes <storage_node_endpoint>
```

Optionally specify a local file repo:

```bash
0g-storage-client gateway \
  --nodes <storage_node_endpoint> \
  --repo <local_path>
```

## Automation Examples

### Backup Script

Create automated backup scripts:

```bash
#!/bin/bash
# backup.sh - Daily backup to 0G Storage

DATE=$(date +%Y%m%d)
BACKUP_FILE="/backups/daily-${DATE}.tar.gz"

# Create backup
tar -czf $BACKUP_FILE /important/data

# Upload to 0G
ROOT_HASH=$(0g-storage-client upload \
  --url $RPC_URL \
  --key $PRIVATE_KEY \
  --indexer $INDEXER_URL \
  --file $BACKUP_FILE | grep "root =" | awk '{print $NF}')

# Save root hash
echo "${DATE}: ${ROOT_HASH}" >> /backups/manifest.txt
```

### Monitoring Integration

Monitor uploads with logging:

```bash
# upload-with-monitoring.sh
0g-storage-client upload \
  --file $1 \
  --log-level info \
  # ... other parameters \
  2>&1 | tee -a /var/log/0g-uploads.log
```

## Troubleshooting

<details>
<summary>**Upload fails with "insufficient funds" error**</summary>

Ensure your wallet has enough tokens for:
- Gas fees on 0G Chain
- Storage fees for the file size

Check balance: Use a blockchain explorer or wallet to verify funds.
</details>

<details>
<summary>**"Indexer not found" error during upload/download**</summary>

This can happen if:
- The indexer service is offline
- The indexer endpoint URL is incorrect
- Network connectivity issues

Verify the indexer endpoint and try again.
</details>

<details>
<summary>**RPC timeout errors**</summary>

If you experience RPC timeouts, try adjusting the timeout settings:
```bash
--rpc-timeout 60s --rpc-retry-count 10 --rpc-retry-interval 3s
```
</details>

## Best Practices

1. **Security First**: Store private keys in environment variables, not command line
2. **Backup Root Hashes**: Always save file root hashes after uploads
3. **Use Verification**: Enable `--proof` for important downloads
4. **Monitor Transactions**: Track uploads on the blockchain explorer
5. **Test with Gen**: Use the `gen` command to create test files for development
6. **HTTP Access**: Leverage the RESTful API for web applications and integrations
7. **Batch KV Operations**: Use comma-separated lists for efficient key-value operations

---

*Need more control? Consider running your own [storage node](/run-a-node/storage-node) to participate in the network and earn rewards.*
