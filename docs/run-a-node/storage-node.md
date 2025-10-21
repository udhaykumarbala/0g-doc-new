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
The official configuration files are available in the [0G Storage Node GitHub repository](https://github.com/0gfoundation/0g-storage-node/tree/main/run):
- Testnet: `config-testnet-turbo.toml`
- Mainnet: `config-mainnet-turbo.toml`

Always use the latest versions from the repository as they contain the most up-to-date network parameters.
:::

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
log_contract_address = "0x22E03a6A89B950F1c82ec5e74F8eCa321a105296" # Flow contract
mine_contract_address = "0x00A9E9604b0538e06b268Fb297Df333337f9593b" # Mine contract

# Testnet RPC endpoint
blockchain_rpc_endpoint = "https://evmrpc-testnet.0g.ai"

# Start sync block number for testnet
log_sync_start_block_number = 326165

# Your private key for mining (64 chars, no '0x' prefix)
miner_key = "YOUR_PRIVATE_KEY"
```

3. Optional: Configure network settings if needed:

```toml
# Target number of connected peers (can be increased for better connectivity)
network_target_peers = 50
```

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
log_contract_address = "0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526" # Flow contract
mine_contract_address = "0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe" # Mine contract
reward_contract_address = "0x457aC76B58ffcDc118AABD6DbC63ff9072880870" # Reward contract

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
