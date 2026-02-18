# Storage Node
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In the 0G network, storage nodes play a vital role in maintaining the system's decentralized storage layer. They are responsible for storing and serving data, ensuring data availability and reliability across the network. By running a storage node, you actively contribute to the network and earn rewards for your participation.
This guide details the process of running a storage node, including hardware specifications and interaction with on-chain contracts.

### Hardware Requirements

| Component | Storage Node | Storage KV |
|-----------|--------------|------------|
| Memory    | 32 GB RAM    | 32 GB RAM  |
| CPU       | 8 cores      | 8 cores    |
| Disk      | 500GB / 1TB SSD | Size matches the KV streams it maintains |
| Bandwidth | 100 Mbps (Download / Upload) | - |

:::note
- For Storage Node: The SSD ensures fast read/write operations, critical for efficient blob storage and retrieval.
- For Storage KV: The disk size requirement is flexible and should be adjusted based on the volume of KV streams you intend to maintain.
:::
### Next Steps
For detailed instructions on setting up and operating your Storage Node or Storage KV, please refer to our comprehensive setup guides below:

<Tabs>
  <TabItem value="binary" label="Storage Node" default>

## Prerequisites

Before setting up your storage node:

- Understand that 0G Storage interacts with on-chain contracts for blob root confirmation and PoRA mining.
- Choose your network: [Testnet](../developer-hub/testnet/testnet-overview.md) or [Mainnet](../developer-hub/mainnet/mainnet-overview.md)
- Check the respective network overview pages for deployed contract addresses and RPC endpoints.
- **For mainnet deployment**: Ensure you have real 0G tokens for transaction fees and mining rewards.


## Install Dependencies
Start by installing all the essential tools and libraries required to build the 0G storage node software.

<Tabs
  defaultValue="linux"
  values={[
    {label: 'Linux', value: 'linux'},
    {label: 'Mac', value: 'mac'},
    ]}>
  <TabItem value="linux">

        ```bash
        sudo apt-get update
        sudo apt-get install clang cmake build-essential pkg-config libssl-dev protobuf-compiler
        ```
</TabItem>
  <TabItem value="mac">
        ```bash
        brew install llvm cmake
        ```
</TabItem>
</Tabs>
**Install `rustup`**: rustup is the Rust toolchain installer, necessary as the 0G node software is written in Rust.

    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

 **Download the Source Code**:

    ```bash
    git clone -b <latest_tag> https://github.com/0gfoundation/0g-storage-node.git
    ```

**Build the Source Code**

    ```bash
    cd 0g-storage-node

    # Build in release mode
    cargo build --release
    ```

This compiles the Rust code into an executable binary. The `--release` flag optimizes the build for performance.

## Setup and Configuration

Navigate to the run directory and configure your storage node for either testnet or mainnet.

:::info Config File References
The official configuration files are in the `run/` directory. Currently only `turbo` is available:
```
run/config-testnet-turbo.toml
run/config-mainnet-turbo.toml
```

Always use the latest versions from the repository as they contain the most up-to-date network parameters.
:::

**Turbo vs Standard**
Both `turbo` and `standard` configs are identical in structure and fields. The only difference is pricing; choose the file that matches the pricing tier you want to run.

**Where The Full Config Is Explained**
The most detailed, up-to-date comments for every field live in `run/config-testnet-turbo.toml` (and the corresponding `run/config-testnet-standard.toml`). Use those files as the authoritative field-by-field explanation.

**Key Fields (Same Wording As `run/config-testnet-turbo.toml`)**
`network_boot_nodes`
Note: List of nodes to bootstrap UDP discovery. Note, `network_enr_address` should be configured as well to enable UDP discovery.

`log_contract_address`
Note: Flow contract address to sync event logs.

`mine_contract_address`
Note: Mine contract address for incentive.

`reward_contract_address`
Note: Reward contract address.

`db_max_num_sectors`
Note: The max number of chunk entries to store in db. Each entry is 256B, so the db size is roughly limited to `256 * db_max_num_sectors` Bytes. If this limit is reached, the node will update its `shard_position` and store only half data.

`chunk_pool_write_window_size`
Note: Maximum number of threads to upload segments of a single file simultaneously.

`chunk_pool_max_writings`
Note: Maximum number of threads to upload segments for all files simultaneously.

`auto_sync_enabled`
Note: Enable file sync among peers automatically. When enabled, each node will store all files, and sufficient disk space is required.

`neighbors_only`
Note: Indicates whether to sync file from neighbor nodes only. This is to avoid flooding file announcements in the whole network, which leads to high latency or even timeout to sync files.

**CLI Options**
CLI flags override values in `config.toml`.
- `-c`, `--config <FILE>`: Sets a custom config file.
- `--log-config-file [FILE]`: Sets log configuration file (Default: `log_config`).
- `--miner-key [KEY]`: Sets miner private key (Default: None).
- `--blockchain-rpc-endpoint [URL]`: Sets blockchain RPC endpoint (Default: `http://127.0.0.1:8545`).
- `--db-max-num-chunks [NUM]`: Sets the max number of chunks to store in DB (Default: None).
- `--network-enr-address [URL]`: Sets the network ENR address (Default: None).

**Configuration Reference**
Full configuration keys are defined in `node/src/config/mod.rs` and log sync behavior is implemented in `node/log_entry_sync/src/sync_manager/config.rs`.

**Network**
- `network_dir`: Directory for node keyfile and network data (Default: `network`).
- `network_listen_address`: IP address to listen on (Default: `0.0.0.0`).
- `network_enr_address`: Public address advertised in ENR (Default: None).
- `network_enr_tcp_port`: TCP port advertised in ENR (Default: `1234`).
- `network_enr_udp_port`: UDP port advertised in ENR (Default: `1234`).
- `network_libp2p_port`: Libp2p TCP port (Default: `1234`).
- `network_discovery_port`: Discovery UDP port (Default: `1234`).
- `network_target_peers`: Target number of connected peers (Default: `50`).
- `network_boot_nodes`: ENR boot nodes list for discovery (Default: empty list).
- `network_libp2p_nodes`: Initial libp2p peers to connect to (Default: empty list).
- `network_private`: Enable private mode (Default: `false`).
- `network_disable_discovery`: Disable discovery protocol (Default: `false`).
- `network_find_chunks_enabled`: Enable find-chunks behavior (Default: `false`).

**Discv5**
- `discv5_request_timeout_secs`: Timeout per UDP request (Default: `5`).
- `discv5_query_peer_timeout_secs`: Timeout to mark a query peer unresponsive (Default: `2`).
- `discv5_request_retries`: Retry count for UDP requests (Default: `1`).
- `discv5_query_parallelism`: Parallelism per query (Default: `5`).
- `discv5_report_discovered_peers`: Emit discovered ENRs during traversal (Default: `false`).
- `discv5_disable_packet_filter`: Disable incoming packet filter (Default: `false`).
- `discv5_disable_ip_limit`: Disable /24 subnet limit in kbuckets (Default: `false`).
- `discv5_disable_enr_network_id`: Disable ENR network ID checks (Default: `false`).

**Log Sync**
- `blockchain_rpc_endpoint`: RPC endpoint to sync EVM logs (Default: `http://127.0.0.1:8545`).
- `log_contract_address`: Flow contract address to sync logs from (Default: empty).
- `log_sync_start_block_number`: Block number to start syncing logs (Default: `0`).
- `force_log_sync_from_start_block_number`: Force sync from start block even if progress exists (Default: `false`).
- `confirmation_block_count`: Blocks required for confirmation to handle reorgs (Default: `3`).
- `log_page_size`: Max number of logs per poll (Default: `999`).
- `max_cache_data_size`: Max cached data size in bytes (Default: `104857600`).
- `cache_tx_seq_ttl`: Cache TTL for tx sequence entries (Default: `500`).
- `rate_limit_retries`: Retries after RPC timeouts (Default: `100`).
- `timeout_retries`: Retries for rate-limited responses (Default: `100`).
- `initial_backoff`: Initial backoff in ms before retry (Default: `500`).
- `recover_query_delay`: Delay in ms between paginated getLogs calls (Default: `50`).
- `default_finalized_block_count`: Finality lag assumed behind latest block (Default: `100`).
- `remove_finalized_block_interval_minutes`: Interval in minutes to prune finalized blocks (Default: `30`).
- `watch_loop_wait_time_ms`: Watch loop delay in ms (Default: `500`).
- `blockchain_rpc_timeout_secs`: RPC connect/read timeout in seconds (Default: `120`).

**Chunk Pool**
- `chunk_pool_write_window_size`: Max threads per file upload (Default: `4`).
- `chunk_pool_max_cached_chunks_all`: Max cached chunk bytes across all files (Default: `4194304`).
- `chunk_pool_max_writings`: Max concurrent file uploads (Default: `16`).
- `chunk_pool_expiration_time_secs`: Cached chunk expiration in seconds (Default: `300`).

**Database**
- `db_dir`: Directory to store data (Default: `db`).
- `db_max_num_sectors`: Max number of chunk entries to store (Default: None).
- `prune_check_time_s`: Interval to check prune conditions in seconds (Default: `60`).
- `prune_batch_size`: Number of entries per prune batch (Default: `16384`).
- `prune_batch_wait_time_ms`: Wait between prune batches in ms (Default: `1000`).
- `merkle_node_cache_capacity`: Merkle node cache capacity in bytes (Default: `33554432`).

**Misc**
- `log_config_file`: Log configuration file name (Default: `log_config`).
- `log_directory`: Directory for log output (Default: `log`).

**Mining**
- `mine_contract_address`: Mine contract address (Default: empty).
- `miner_id`: Optional miner ID (Default: None).
- `miner_key`: Miner private key (Default: None).
- `miner_cpu_percentage`: CPU usage percentage for mining (Default: `100`).
- `mine_iter_batch_size`: Mining iteration batch size (Default: `100`).
- `reward_contract_address`: Reward contract address (Default: empty).
- `shard_position`: Shard selector in `<shard_id>/<shard_number>` format (Default: None).
- `mine_context_query_seconds`: Interval to query mine context in seconds (Default: `5`).

<Tabs>
  <TabItem value="testnet" label="Testnet">

### Configuration

1. Copy the testnet configuration:

```bash
cd run
cp config-testnet-turbo.toml config.toml
```

2. Update the following fields in `config.toml`:

```toml
# Contract addresses for testnet
log_contract_address = "FLOW_CONTRACT_ADDRESS"
mine_contract_address = "MINE_CONTRACT_ADDRESS"

# Testnet RPC endpoint
blockchain_rpc_endpoint = "https://evmrpc-testnet.0g.ai"

# Start sync block number for testnet
log_sync_start_block_number = 1

# Reward contract for testnet
reward_contract_address = "REWARD_CONTRACT_ADDRESS"

# Your private key for mining (64 chars, no '0x' prefix)
miner_key = "YOUR_PRIVATE_KEY"
```

3. Optional: Configure network settings if needed:

```toml
# Target number of connected peers (can be increased for better connectivity)
network_target_peers = 50
```

### Sharding Configuration

Sharding allows you to control how much data your storage node stores. This is particularly useful when disk space is limited.

#### Understanding Shard Position

The `shard_position` parameter determines which portion of the total network data your node stores:

```toml
# Format: shard_id/shard_number where shard_number is 2^n
# This only applies if there is no stored shard config in db
shard_position = "0/2"
```

**Format**: `<shard_id>/<shard_number>`
- `shard_id`: Which shard this node stores (0, 1, 2, 3, etc.)
- `shard_number`: Total number of shards (must be a power of 2: 2, 4, 8, 16, etc.)

**Examples**:
- `shard_position = "0/2"` → Store 50% of data (shard 0 of 2 total shards)
- `shard_position = "1/2"` → Store 50% of data (shard 1 of 2 total shards)
- `shard_position = "0/4"` → Store 25% of data (shard 0 of 4 total shards)
- `shard_position = "2/4"` → Store 25% of data (shard 2 of 4 total shards)

Each shard stores a **specific range** of the total data. For example, with `0/2` and `1/2`, both store 50% of data but on different, non-overlapping ranges.

#### How Sharding Works

Consider a scenario with 128 GB total network data and a 100 GB disk:

1. **Initial Setup** (`shard_position = "0/2"`):
   - Your node stores 64 GB (50% of 128 GB)
   - Stores a specific, deterministic data range
   - Fits comfortably on your 100 GB disk

2. **Network Growth** (total data becomes 256 GB):
   - Your node would be responsible for 128 GB (50% of 256 GB)
   - This exceeds your 100 GB disk capacity
   - **Automatic adjustment**: Node automatically splits to `x/4`
   - Now stores 64 GB (25% of 256 GB)
   - `shard_id` changes: `0` → `0 or 2`, `1` → `1 or 3` (randomly assigned by the node, you cannot control which)

#### Automatic Shard Division

When network data exceeds your disk capacity, the node automatically:
- Doubles the shard number (2 → 4 → 8 → 16, etc.)
- Randomly reassigns to a new shard within the split (you cannot control which)
- Maintains storage within disk limits

:::warning Important Notes
- **Initial setup is deterministic**: When you first configure `shard_position`, the shard_id deterministically maps to a specific data range
- This setting only applies on **first startup** if no shard config exists in the database
- **Auto-splitting is NOT deterministic**: When the node automatically splits shards due to capacity limits, you cannot control which new shard_id you get - it's randomly assigned
- Once shard config is stored in the database, the node manages all future shard adjustments automatically
:::

#### Choosing Your Shard Configuration

To determine the right shard configuration:

1. **Estimate network data size**: Check current total data on the network
2. **Consider disk capacity**: Leave headroom for growth (e.g., use 70-80% of disk)
3. **Calculate shard number**: `shard_number = total_data / (disk_capacity * 0.75)`
4. **Round up to nearest power of 2**: 2, 4, 8, 16, 32, etc.

**Example**:
- Network data: 500 GB
- Your disk: 200 GB
- Safe storage: 150 GB (75% of disk)
- Calculation: 500 / 150 ≈ 3.33 → Round up to 4
- Configuration: `shard_position = "0/4"` (stores ~125 GB)

### Running the Node

1. Check configuration options:
```bash
../target/release/zgs_node -h
```

2. Run the testnet storage service:
```bash
cd run
../target/release/zgs_node --config config.toml --miner-key <your_private_key>
```

  </TabItem>
  <TabItem value="mainnet" label="Mainnet">

### Configuration

1. Copy the mainnet configuration:

```bash
cd run
cp config-mainnet-turbo.toml config.toml
```

2. Update the following fields in `config.toml`:

```toml
# Contract addresses for mainnet
log_contract_address = "FLOW_CONTRACT_ADDRESS"
mine_contract_address = "MINE_CONTRACT_ADDRESS"
reward_contract_address = "REWARD_CONTRACT_ADDRESS"

# Mainnet RPC endpoint
blockchain_rpc_endpoint = "https://evmrpc.0g.ai"

# Start sync block number for mainnet
log_sync_start_block_number = 2387557

# Your private key for mining (64 chars, no '0x' prefix)
miner_key = "YOUR_PRIVATE_KEY"
```

3. The mainnet configuration includes predefined boot nodes for network connectivity:

```toml
network_boot_nodes = ["/ip4/34.66.131.173/udp/1234/p2p/16Uiu2HAmG81UgZ1JJLx9T2HqELgJNP36ChHzYkCdA9HdxvAbb5jQ","/ip4/34.60.163.4/udp/1234/p2p/16Uiu2HAmL3DoA7e7mbxs7CkeCPtNrAcfJFFtLpJDr2HWuR6QwJ8k","/ip4/34.169.236.186/udp/1234/p2p/16Uiu2HAm489RdhEgZUFmNTR4jdLEE4HjrvwaPCkEpSYSgvqi1CbR","/ip4/34.71.110.60/udp/1234/p2p/16Uiu2HAmBfGfbLNRegcqihiuXhgSXWNpgiGm6EwW2SYexfPUNUHQ"]
```

### Sharding Configuration

Sharding allows you to control how much data your storage node stores. This is particularly useful when disk space is limited.

#### Understanding Shard Position

The `shard_position` parameter determines which portion of the total network data your node stores:

```toml
# Format: shard_id/shard_number where shard_number is 2^n
# This only applies if there is no stored shard config in db
shard_position = "0/2"
```

**Format**: `<shard_id>/<shard_number>`
- `shard_id`: Which shard this node stores (0, 1, 2, 3, etc.)
- `shard_number`: Total number of shards (must be a power of 2: 2, 4, 8, 16, etc.)

**Examples**:
- `shard_position = "0/2"` → Store 50% of data (shard 0 of 2 total shards)
- `shard_position = "1/2"` → Store 50% of data (shard 1 of 2 total shards)
- `shard_position = "0/4"` → Store 25% of data (shard 0 of 4 total shards)
- `shard_position = "2/4"` → Store 25% of data (shard 2 of 4 total shards)

Each shard stores a **specific range** of the total data. For example, with `0/2` and `1/2`, both store 50% of data but on different, non-overlapping ranges.

#### How Sharding Works

Consider a scenario with 128 GB total network data and a 100 GB disk:

1. **Initial Setup** (`shard_position = "0/2"`):
   - Your node stores 64 GB (50% of 128 GB)
   - Stores a specific, deterministic data range
   - Fits comfortably on your 100 GB disk

2. **Network Growth** (total data becomes 256 GB):
   - Your node would be responsible for 128 GB (50% of 256 GB)
   - This exceeds your 100 GB disk capacity
   - **Automatic adjustment**: Node automatically splits to `x/4`
   - Now stores 64 GB (25% of 256 GB)
   - `shard_id` changes: `0` → `0 or 2`, `1` → `1 or 3` (randomly assigned by the node, you cannot control which)

#### Automatic Shard Division

When network data exceeds your disk capacity, the node automatically:
- Doubles the shard number (2 → 4 → 8 → 16, etc.)
- Randomly reassigns to a new shard within the split (you cannot control which)
- Maintains storage within disk limits

:::warning Important Notes
- **Initial setup is deterministic**: When you first configure `shard_position`, the shard_id deterministically maps to a specific data range
- This setting only applies on **first startup** if no shard config exists in the database
- **Auto-splitting is NOT deterministic**: When the node automatically splits shards due to capacity limits, you cannot control which new shard_id you get - it's randomly assigned
- Once shard config is stored in the database, the node manages all future shard adjustments automatically
:::

#### Choosing Your Shard Configuration

To determine the right shard configuration:

1. **Estimate network data size**: Check current total data on the network
2. **Consider disk capacity**: Leave headroom for growth (e.g., use 70-80% of disk)
3. **Calculate shard number**: `shard_number = total_data / (disk_capacity * 0.75)`
4. **Round up to nearest power of 2**: 2, 4, 8, 16, 32, etc.

**Example**:
- Network data: 500 GB
- Your disk: 200 GB
- Safe storage: 150 GB (75% of disk)
- Calculation: 500 / 150 ≈ 3.33 → Round up to 4
- Configuration: `shard_position = "0/4"` (stores ~125 GB)

### Running the Node

1. Check configuration options:
```bash
../target/release/zgs_node -h
```

2. Run the mainnet storage service:
```bash
cd run
../target/release/zgs_node --config config.toml --miner-key <your_private_key>
```

**Important Mainnet Notes**:
- Ensure your miner key has sufficient 0G tokens for transaction fees
- Mainnet nodes should have stable internet connectivity and sufficient bandwidth
- Monitor your node's performance and logs regularly

</TabItem>
</Tabs>

## Snapshot
Make sure to only include `flow_db` and delete `data_db` under `db` folder when you use a snapshot from a 3rd party !
> Using others' `data_db` will make the node mine for others!

**Additional Notes**
*   **Security:** Keep your private key (`miner_key`) safe and secure. Anyone with access to it can control your node and potentially claim your mining rewards.

*   **Network Connectivity:** Ensure your node has a stable internet connection and that the necessary ports are open for communication with other nodes.

*   **Monitoring:** Monitor your node's logs and resource usage to ensure it's running smoothly.

*   **Updates:** Stay informed about updates to the 0G storage node software and follow the project's documentation for any changes in the setup process.

**Remember:** Running a storage node is a valuable contribution to the 0G network. You'll be helping to maintain its decentralization and robustness while earning rewards for your efforts.

  </TabItem>
  <TabItem value="docker" label="Storage KV Node">

## Overview
  0G Storage KV is a key-value store built on top of the 0G Storage system. This guide provides detailed steps to deploy and run a 0G Storage KV node.

## Prerequisites

Before setting up your 0G Storage KV node:

- Understand that 0G KV interacts with on-chain contracts and storage nodes to simulate KV data streams.
- For official deployed contract addresses, visit the [testnet information page](../developer-hub/testnet/testnet-overview.md).

## Install Dependencies

Follow the same steps to install dependencies and Rust as in the storage node setup:
<Tabs>
  <TabItem value="linux">

        ```bash
        sudo apt-get update
        sudo apt-get install clang cmake build-essential pkg-config libssl-dev protobuf-compiler
        ```
</TabItem>
  <TabItem value="mac">
        ```bash
        brew install llvm cmake
        ```
</TabItem>
</Tabs>
**Install `rustup`**: rustup is the Rust toolchain installer, necessary as the 0G node software is written in Rust.

    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

#### 1. Download the Source Code

```bash
git clone -b <latest_tag> https://github.com/0gfoundation/0g-storage-kv.git
```

#### 2. Build the Source Code

```bash
cd 0g-storage-kv

# Build in release mode
cargo build --release
```

## Configuration

1. Copy the example configuration file and update it:

```bash
cp config_example.toml config.toml
nano config.toml
```

2. Update the following fields in `config.toml`:

```toml
#######################################################################
###                   Key-Value Stream Options                      ###
#######################################################################

# Streams to monitor.
stream_ids = ["000000000000000000000000000000000000000000000000000000000000f2bd", "000000000000000000000000000000000000000000000000000000000000f009", "0000000000000000000000000000000000000000000000000000000000016879", "0000000000000000000000000000000000000000000000000000000000002e3d"]

#######################################################################
###                     DB Config Options                           ###
#######################################################################

# Directory to store data.
db_dir = "db"
# Directory to store KV Metadata.
kv_db_dir = "kv.DB"

#######################################################################
###                     Log Sync Config Options                     ###
#######################################################################

blockchain_rpc_endpoint = "BLOCKCHAIN_RPC_ENDPOINT" #rpc endpoint, see testnet information
log_contract_address = "LOG_CONTRACT_ADDRESS" #flow contract address, see testnet information
# log_sync_start_block_number should be earlier than the block number of the first transaction that writes to the stream being monitored.
log_sync_start_block_number = 0

#######################################################################
###                     RPC Config Options                          ###
#######################################################################

# Whether to provide RPC service.
rpc_enabled = true

# HTTP server address to bind for public RPC.
rpc_listen_address = "0.0.0.0:6789"

# Zerog storage nodes to download data from.
zgs_node_urls = "http://127.0.0.1:5678,http://127.0.0.1:5679"

#######################################################################
###                     Misc Config Options                         ###
#######################################################################

log_config_file = "log_config"
```

## Running the Storage KV Node

1. Navigate to the `run` directory:
```bash
cd run
```

2. Run the KV service:
```bash
../target/release/zgs_kv --config config.toml
```

For long-running sessions, consider using `tmux` or `screen` to run the node in the background.

## Monitoring and Maintenance

1. Check logs:
   The node outputs logs based on the `log_config` file specified in your configuration.

2. Updating the node:

 To update to the latest version, pull the latest changes from the repository and rebuild:

 ```bash
   git pull
   cargo build --release
   ```

## Troubleshooting

If you encounter issues:

1. Check the logs for any error messages.
2. Ensure your node meets the hardware requirements.
3. Verify that your `config.toml` file is correctly formatted and contains valid settings.
4. Check your internet connection and firewall settings.
5. Ensure the specified blockchain RPC endpoint and contract addresses are correct and accessible.

## Getting Help

If you need assistance:

1. Check the [GitHub Issues](https://github.com/0gfoundation/0g-storage-kv/issues) for known problems and solutions.
2. Join the 0G community channels (Discord, Telegram, etc.) for community support.
3. For critical issues, consider reaching out to the 0G team directly.

## Conclusion

Running a 0G Storage KV node is an important part of the 0G ecosystem, providing key-value storage capabilities. By following this guide, you should be able to set up and operate your node successfully. Remember to keep your node updated and monitor its performance regularly to ensure optimal operation.
</TabItem>
</Tabs>
