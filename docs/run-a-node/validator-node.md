---
sidebar_position: 4
---

# Validator Node
---

Running a Validator node for the **0G-Galileo-Testnet** means providing validator services for the network, processing transactions and maintaining consensus.

:::info **What You'll Need**
- Linux/macOS system with adequate hardware
- Stable internet connection
:::

## Hardware Requirements

| Component  | Mainnet | Testnet |
|------------|---------|----------|
| Memory     | 64 GB   | 64 GB    |
| CPU        | 8 cores | 8 cores  |
| Disk       | 1 TB NVME SSD | 4 TB NVME SSD |
| Bandwidth  | 100 MBps for Download / Upload | 100 MBps for Download / Upload |

## Setup Guide

### 1. Download Package

Download the latest package for node binaries:

```bash
wget -O galileo.tar.gz https://github.com/0glabs/0gchain-NG/releases/download/v1.2.0/galileo-v1.2.0.tar.gz
```

### 2. Extract Package

Extract the package to your home directory:

```bash
tar -xzvf galileo.tar.gz -C ~
```

### 3. Copy Files and Set Permissions

Copy the configuration files and set proper permissions:

```bash
cd galileo
cp -r 0g-home {your data path}
sudo chmod 777 ./bin/geth
sudo chmod 777 ./bin/0gchaind
```

### 4. Initialize Geth

Initialize the Geth client with the genesis file:

```bash
./bin/geth init --datadir /{your data path}/0g-home/geth-home ./genesis.json
```

### 5. Initialize 0gchaind

Create a temporary directory for initial configuration:

```bash
./bin/0gchaind init {node name} --home /{your data path}/tmp
```

### 6. Copy Node Files

Move the generated keys to the proper location:

```bash
cp /{your data path}/tmp/data/priv_validator_state.json /{your data path}/0g-home/0gchaind-home/data/
cp /{your data path}/tmp/config/node_key.json /{your data path}/0g-home/0gchaind-home/config/
cp /{your data path}/tmp/config/priv_validator_key.json /{your data path}/0g-home/0gchaind-home/config/
```

> Note: The temporary directory can be deleted after this step.

### 7. Start 0gchaind

```bash
cd ~/galileo
nohup ./bin/0gchaind start \
    --rpc.laddr tcp://0.0.0.0:26657 \
    --chaincfg.chain-spec devnet \
    --chaincfg.kzg.trusted-setup-path=kzg-trusted-setup.json \
    --chaincfg.engine.jwt-secret-path=jwt-secret.hex \
    --chaincfg.kzg.implementation=crate-crypto/go-kzg-4844 \
    --chaincfg.block-store-service.enabled \
    --chaincfg.node-api.enabled \
    --chaincfg.node-api.logging \
    --chaincfg.node-api.address 0.0.0.0:3500 \
    --pruning=nothing \
    --home /{your data path}/0g-home/0gchaind-home \
    --p2p.seeds 85a9b9a1b7fa0969704db2bc37f7c100855a75d9@8.218.88.60:26656 \
    --p2p.external_address {your node ip}:26656 > /{your data path}/0g-home/log/0gchaind.log 2>&1 &
```

### 8. Start Geth

```bash
cd ~/galileo
nohup ./bin/geth --config geth-config.toml \
     --nat extip:{your node ip} \
     --bootnodes enode://de7b86d8ac452b1413983049c20eafa2ea0851a3219c2cc12649b971c1677bd83fe24c5331e078471e52a94d95e8cde84cb9d866574fec957124e57ac6056699@8.218.88.60:30303 \
     --datadir /{your data path}/0g-home/geth-home \
     --networkid 16601 > /{your data path}/0g-home/log/geth.log 2>&1 &
```

### 9. Verify Setup

Check the logs to confirm your node is running properly:

```bash
# Check Geth logs
tail -f /{your data path}/0g-home/log/geth.log

# Check 0gchaind logs
tail -f /{your data path}/0g-home/log/0gchaind.log
```

Check logs to confirm your node is running properly.

:::success **Success Indicators**
- 0gchaind should show "Committed state" messages
- No error messages in either log
:::

## Next Steps

### Staking Integration

Once your validator node is running, you can interact with the staking system programmatically using smart contracts:

- **[Staking Interfaces Guide](../developer-hub/building-on-0g/contracts-on-0g/staking-interfaces)** - Complete documentation for integrating with 0G Chain staking smart contracts


