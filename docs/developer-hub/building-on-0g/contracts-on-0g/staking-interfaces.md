---
id: staking-interfaces
title: Staking Interfaces
---

# Staking Interfaces

Welcome to the 0G Chain Staking Interfaces documentation. This guide provides comprehensive information about interacting with the 0G Chain staking system through smart contracts, enabling you to build applications that leverage validator operations and delegations.

:::tip **Running a Validator?**
If you want to set up and initialize a validator, see the [Validator Initialization Guide](#validator-initialization) below.
:::

## Quick Navigation

- **[Validator Initialization Guide](#validator-initialization)** - Complete step-by-step setup for becoming a validator
- **[Contract Interfaces](#contract-interfaces)** - Smart contract reference documentation
- **[Examples](#examples)** - Smart contract code examples

---

## Overview

The 0G Chain staking system enables 0G token holders to participate in network consensus and earn rewards through two primary mechanisms:

1. **Becoming a Validator**: Run infrastructure to validate transactions and produce blocks
2. **Delegating to Validators**: Stake tokens with existing validators to earn rewards without running infrastructure

The staking system is built on two core smart contract interfaces:

- **`IStakingContract`**: Central registry managing validators and global staking parameters
- **`IValidatorContract`**: Individual validator operations including delegations and reward distribution

## Prerequisites

Before working with the staking interfaces:

- Familiarity with Solidity and smart contract development
- Basic knowledge of consensus mechanisms and staking concepts

## Quick Start

```solidity
// Create a validator
IStakingContract staking = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);
address validator = staking.createAndInitializeValidatorIfNecessary{value: msg.value}(
    description, commissionRate, withdrawalFee, pubkey, signature
);

// Delegate to validator
IValidatorContract(validator).delegate{value: msg.value}(msg.sender);
```

## Core Concepts

### Validators
Validators process transactions and produce blocks:
- **Unique Identity**: Identified by 48-byte consensus public key
- **Operator Control**: Managed by an Ethereum address
- **Commission**: Set their own reward commission rates
- **Self-Delegation**: Required minimum stake from operator

### Delegations
Token holders earn rewards by delegating to validators:
- **Share-Based**: Delegations represented as shares in validator pool
- **Proportional Rewards**: Earnings based on share percentage
- **Withdrawal Delay**: Undelegation subject to network delay period

### Reward Distribution
Rewards flow through multiple layers:
1. **Community Tax**: Applied to all rewards first
2. **Validator Commission**: Taken from remaining rewards
3. **Delegator Distribution**: Proportional to shares held

## Contract Interfaces

### IStakingContract
`0xea224dBB52F57752044c0C86aD50930091F561B9` (Mainnet)

Central registry for validators and global parameters.

#### Validator Management
```solidity
// Create validator contract
function createValidator(bytes calldata pubkey) external returns (address);

// Initialize validator with self-delegation
function initializeValidator(
    Description calldata description,
    uint32 commissionRate,
    uint96 withdrawalFeeInGwei,
    bytes calldata pubkey,
    bytes calldata signature
) external payable;

// Create and initialize in one call
function createAndInitializeValidatorIfNecessary(
    Description calldata description,
    uint32 commissionRate, 
    uint96 withdrawalFeeInGwei,
    bytes calldata pubkey,
    bytes calldata signature
) external payable;
```

#### Query Functions
```solidity
function getValidator(bytes memory pubkey) external view returns (address);
function computeValidatorAddress(bytes calldata pubkey) external view returns (address);
function validatorCount() external view returns (uint32);
function maxValidatorCount() external view returns (uint32);
```

### IValidatorContract
Individual validator operations and delegation management.

#### Delegation Management
```solidity
// Delegate tokens (msg.value = amount)
function delegate(address delegatorAddress) external payable returns (uint);

// Undelegate shares (msg.value = withdrawal fee)
function undelegate(address withdrawalAddress, uint shares) external payable returns (uint);

// Withdraw validator commission (only validator operator)
function withdrawCommission(address withdrawalAddress) external returns (uint);
```

:::info **Access Control**
The `withdrawCommission` function is restricted to the validator operator only - the address that originally created and manages the validator.
:::

#### Information Queries
```solidity
function tokens() external view returns (uint);           // Total tokens (delegated + rewards)
function delegatorShares() external view returns (uint);  // Total shares issued
function getDelegation(address delegator) external view returns (address, uint);
function commissionRate() external view returns (uint32);
function withdrawalFeeInGwei() external view returns (uint96);
```

:::tip **Understanding tokens()**
The `tokens()` function returns the complete validator balance, including both the original delegated amounts and any accumulated rewards that haven't been distributed yet.
:::

## Examples

### Creating a Validator

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IStakingContract.sol";

contract ValidatorExample {
    IStakingContract constant STAKING = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);
    
    function createValidator(
        bytes calldata pubkey, 
        bytes calldata signature
    ) external payable {
        Description memory desc = Description({
            moniker: "My Validator",
            identity: "keybase-id", 
            website: "https://validator.example.com",
            securityContact: "security@example.com",
            details: "A reliable 0G Chain validator"
        });
        
        STAKING.createAndInitializeValidatorIfNecessary{value: msg.value}(
            desc,
            50000,  // 5% commission
            1,      // 1 Gwei withdrawal fee
            pubkey,
            signature
        );
    }
}
```

### Delegation Management

```solidity
contract DelegationHelper {
    IStakingContract constant STAKING = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);
    
    function delegateToValidator(bytes calldata pubkey) external payable {
        address validator = STAKING.getValidator(pubkey);
        require(validator != address(0), "Validator not found");
        
        IValidatorContract(validator).delegate{value: msg.value}(msg.sender);
    }
    
    function getDelegationInfo(
        bytes calldata pubkey,
        address delegator
    ) external view returns (uint shares, uint estimatedTokens) {
        address validator = STAKING.getValidator(pubkey);
        IValidatorContract v = IValidatorContract(validator);
        
        (, shares) = v.getDelegation(delegator);
        
        uint totalTokens = v.tokens();
        uint totalShares = v.delegatorShares();
        
        if (totalShares > 0) {
            estimatedTokens = (shares * totalTokens) / totalShares;
        }
    }
}
```

## Validator Initialization

This section covers the complete workflow for setting up and initializing a validator on the 0G Chain.

### Step 1: Generate Validator Signature

The validator signature creation process is simplified with a single command:

```bash
# Set your environment variables
HOMEDIR={your data path}/0g-home/0gchaind-home
STAKING_ADDRESS=0xea224dBB52F57752044c0C86aD50930091F561B9
AMOUNT=500000000000  # Amount in wei (e.g., 500 for 500 0G tokens)

# Generate validator signature
./bin/0gchaind deposit create-delegation-validator \
    $STAKING_ADDRESS \
    $AMOUNT \
    $HOMEDIR/config/genesis.json \
    --home $HOMEDIR \
    --chaincfg.chain-spec=mainnet \
    --override-rpc-url \
    --rpc-dial-url https://evmrpc.0g.ai
```

**Output:**
```
✅ Staking message created successfully!
Note: This is NOT a transaction receipt; use these values to create a validator initialize transaction by Staking Contract.

stakingAddress: 0xea224dBB52F57752044c0C86aD50930091F561B9
pubkey: 0x8497312cd37eef3a7a50017cfbebcb00a9bc400c5881ffb1011cba1c3f29e5d005a980880b7b919b558b95565bc1e628
validatorAddress: 0xA47171b1be26C75732766Ea3433a90A724b3590d
amount: 500000000000
signature: 0xb1dae1164d931c46178785246203eb1c4496b403a7c417bfb33bdfd3c26b552bdbec8e466ed6712ade0b99cc9b0ee8b004cc766687565ba5b0929a1382997a6cc548cf5e390b69f849933c7ac017fbddc612cb3de285fdf89e6fe32e0ccbfc43
```

### Step 2: Validate the Signature

Before submitting the validator initialization transaction, validate the signature:

```bash
# Validate the deposit message
./bin/0gchaind deposit validate-delegation \
    {pubkey} \
    {staking_address} \
    {amount} \
    {signature} \
    $HOMEDIR/config/genesis.json \
    --home $HOMEDIR \
    --chaincfg.chain-spec=mainnet \
    --override-rpc-url \
    --rpc-dial-url https://evmrpc.0g.ai
```

**Example:**
```bash
./bin/0gchaind deposit validate-delegation \
    0x8497312cd37eef3a7a50017cfbebcb00a9bc400c5881ffb1011cba1c3f29e5d005a980880b7b919b558b95565bc1e628 \
    0xea224dBB52F57752044c0C86aD50930091F561B9 \
    500000000000 \
    0xb1dae1164d931c46178785246203eb1c4496b403a7c417bfb33bdfd3c26b552bdbec8e466ed6712ade0b99cc9b0ee8b004cc766687565ba5b0929a1382997a6cc548cf5e390b69f849933c7ac017fbddc612cb3de285fdf89e6fe32e0ccbfc43 \
    $HOMEDIR/config/genesis.json \
    --home $HOMEDIR \
    --chaincfg.chain-spec=mainnet \
    --override-rpc-url \
    --rpc-dial-url https://evmrpc.0g.ai
```

**Output:**
```
✅ Deposit message is valid!
```

### Step 3: Prepare Validator Description and Settings

#### Description Structure

The Description struct contains your validator's public information. All fields have character limits that must be respected:

| Field | Max Length | Description |
|-------|-----------|-------------|
| `moniker` | 70 chars | Your validator's display name |
| `identity` | 100 chars | **Optional:** Keybase identity |
| `website` | 140 chars | Your validator website URL |
| `securityContact` | 140 chars | Security contact email |
| `details` | 200 chars | Additional validator description |

**Example Description Object:**

```jsx
{
  moniker: "Your Validator Name",      // Max 70 chars
  identity: "keybase_id",              // Optional
  website: "https://yoursite.com",     // Max 140 chars
  securityContact: "security@you.com", // Max 140 chars
  details: "Professional validator"     // Max 200 chars
}
```

#### Commission Rate Configuration

The commission rate determines what percentage of staking rewards your validator keeps

| Value | Commission |
|-------|-----------|
| `100` | 0.01% |
| `1000` | 0.1% |
| `10000` | 1% |
| `50000` | 5% |
| `100000` | 10% |

#### Withdrawal Fee Configuration

The withdrawal fee (in Gwei) is charged when delegators undelegate from your validator.

**Recommended value:** `1` (equivalent to 1 Gneuron, ~1 Gwei)

### Step 4: Execute Initialization Transaction

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="chainscan" label="0G Chain Scan (Recommended)" default>

The easiest way to initialize your validator using the web interface:

1. Navigate to https://chainscan.0g.ai/address/0xea224dBB52F57752044c0C86aD50930091F561B9
2. Under **Contracts** Tab, click on the **Write As Proxy** button
3. Find and click on `createAndInitializeValidatorIfNecessary`
4. Fill in all the required parameters:
   - **description** (struct):
     - `moniker`: Your validator name (max 70 chars)
     - `identity`: Keybase ID (optional)
     - `website`: Your website URL
     - `securityContact`: Security contact email
     - `details`: Additional description
   - **commissionRate**: Commission percentage (e.g., 10000 for 1%)
   - **withdrawalFeeInGwei**: Withdrawal fee in Gwei (e.g.,1 Gneuron ~ 1 Gwei)
   - **pubkey**: The public key from Step 1
   - **signature**: The signature from Step 1
5. Set the `payable amount` to **500** OG tokens
6. Connect your wallet and execute the transaction

:::tip **Tip**
Using the Chain Scan interface requires no coding knowledge and is the safest option for most users.
:::

  </TabItem>
  <TabItem value="metamask" label="MetaMask / Web3 Wallet">

For users comfortable with wallet interactions:

1. Ensure your wallet is connected to **0G Chain Mainnet**
2. Go to the contract address: `0xea224dBB52F57752044c0C86aD50930091F561B9`
3. Use a contract interaction tool like:
   - [0G Chain Scan](https://chainscan.0g.ai)
   - Your wallet's built-in contract interaction features
4. Call `createAndInitializeValidatorIfNecessary` with:
   - `description`: Struct with all validator details
   - `commissionRate`: Commission percentage (e.g., 10000 for 1%)
   - `withdrawalFeeInGwei`: Withdrawal fee in Gwei (~1 Gneuron equivalent)
   - `pubkey`: Your validator's public key
   - `signature`: Your validator's signature
5. Set transaction value to **500 OG tokens** (500000000000000000000 wei)
6. Confirm the transaction in your wallet

:::warning **Important**
Ensure your wallet has sufficient funds:
- 500 OG tokens for initialization
- Additional gas fees for the transaction
:::

  </TabItem>
  <TabItem value="ethersjs" label="Ethers.js (Programmatic)">

For developers who want to automate the process:

```javascript
const { ethers } = require("ethers");

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Staking contract ABI (minimal)
const stakingABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "moniker", "type": "string" },
          { "internalType": "string", "name": "identity", "type": "string" },
          { "internalType": "string", "name": "website", "type": "string" },
          { "internalType": "string", "name": "securityContact", "type": "string" },
          { "internalType": "string", "name": "details", "type": "string" }
        ],
        "internalType": "struct IStakingContract.Description",
        "name": "description",
        "type": "tuple"
      },
      { "internalType": "uint32", "name": "commissionRate", "type": "uint32" },
      { "internalType": "uint96", "name": "withdrawalFeeInGwei", "type": "uint96" },
      { "internalType": "bytes", "name": "pubkey", "type": "bytes" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "createAndInitializeValidatorIfNecessary",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "payable",
    "type": "function"
  }
];

async function initializeValidator() {
  const stakingContract = new ethers.Contract(
    "0xea224dBB52F57752044c0C86aD50930091F561B9",
    stakingABI,
    wallet
  );

  const description = {
    moniker: "Your Validator Name",
    identity: "keybase_id",
    website: "https://yourvalidator.com",
    securityContact: "security@yourvalidator.com",
    details: "Professional 0G Chain validator"
  };

  try {
    const tx = await stakingContract.createAndInitializeValidatorIfNecessary(
      description,
      10000,      // 1% commission
      1000000,    // 1 Gwei withdrawal fee
      "0x...",    // Your pubkey
      "0x...",    // Your signature
      { value: ethers.parseEther("500") }  // 500 OG tokens
    );

    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Validator initialized successfully!");
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error initializing validator:", error);
  }
}

initializeValidator();
```

:::note **Environment Setup**
Make sure to set `PRIVATE_KEY` in your `.env` file before running the script.
:::

</TabItem>
</Tabs>

### Step 5: Verify Initialization

After successful initialization, you can verify your validator status:

- Check the transaction on **0G Chain Scan**: https://chainscan.0g.ai
- Verify your validator status on **0G Explorer**: https://explorer.0g.ai/mainnet/validators

:::info **Activation Time**
Your validator may initially appear as **inactive** on the explorer. This is normal. Validators typically take **30-60 minutes** to activate on the network after successful initialization.

You can check the transaction status and logs to confirm the initialization was successful while waiting for activation.
:::

### Troubleshooting

<details>
<summary><b>Error: "Insufficient funds"</b></summary>

Ensure you have at least 500 OG tokens plus gas fees in your wallet.

```bash
# Check balance
cast balance $YOUR_ADDRESS --rpc-url https://evmrpc.0g.ai
```

</details>

<details>
<summary><b>Error: "Validator already exists"</b></summary>

Your validator has already been created. Use the `getValidator` function to retrieve your validator address:

```javascript
const validatorAddress = await stakingContract.getValidator("0x...");
```

</details>

<details>
<summary><b>Error: "Invalid signature"</b></summary>

Regenerate your signature using 0gchaind with the correct validator contract address and delegation amount:

```bash
./bin/0gchaind deposit create-delegation-validator \
    0xea224dBB52F57752044c0C86aD50930091F561B9 \
    500000000000 \
    $HOMEDIR/config/genesis.json \
    --home $HOMEDIR \
    --chaincfg.chain-spec=mainnet \
    --override-rpc-url \
    --rpc-dial-url https://evmrpc.0g.ai
```

</details>

<details>
<summary><b>Error: "Description field too long"</b></summary>

Ensure all Description fields are within character limits:
- `moniker`: max 70 chars
- `identity`: max 100 chars
- `website`: max 140 chars
- `securityContact`: max 140 chars
- `details`: max 200 chars

</details>

## Data Structures

<details>
<summary><b>Description Struct</b></summary>

```solidity
struct Description {
    string moniker;         // max 70 chars - Validator display name
    string identity;        // max 100 chars - Keybase identity  
    string website;         // max 140 chars - Website URL
    string securityContact; // max 140 chars - Security contact
    string details;         // max 200 chars - Additional details
}
```

</details>

<details>
<summary><b>Withdrawal Entry</b></summary>

```solidity
struct WithdrawEntry {
    uint completionHeight;  // Block height when withdrawal completes
    address delegatorAddress; // Address receiving withdrawal
    uint amount;            // Amount being withdrawn
}
```

</details>

## Configuration Parameters

| Parameter | Description |
|-----------|-------------|
| `maxValidatorCount` | Maximum validators allowed |
| `minActivationStakesInGwei` | Minimum stake for activation |
| `maxEffectiveStakesInGwei` | Maximum effective stake |
| `communityTaxRate` | Tax on all rewards |
| `minWithdrawabilityDelay` | Withdrawal delay blocks |

## General Troubleshooting

<details>
<summary><b>Error: "Validator not found"</b></summary>

The validator hasn't been created yet. Use `createValidator()` first:

```solidity
address validator = staking.createValidator(pubkey);
```

</details>

<details>
<summary><b>Error: "DelegationBelowMinimum"</b></summary>

Your delegation amount is below the minimum required. Check:

```solidity
uint96 minDelegation = staking.effectiveDelegationInGwei();
require(msg.value >= minDelegation * 1 gwei, "Insufficient delegation");
```

</details>

<details>
<summary><b>Error: "NotEnoughWithdrawalFee"</b></summary>

Include the withdrawal fee when undelegating:

```solidity
uint96 fee = validator.withdrawalFeeInGwei();
validator.undelegate{value: fee * 1 gwei}(recipient, shares);
```

</details>

## Contract Addresses

| Network | Staking Contract |
|---------|------------------|
| **Mainnet** | `0xea224dBB52F57752044c0C86aD50930091F561B9` |

## Resources

- **Run Validator Node**: [Validator Setup Guide](../../../run-a-node/validator-node)
- **GitHub Repository**: [0G Chain Contracts](https://github.com/0gfoundation/0g-chain-v2/blob/dev-v2.1/contracts/src/staking/)
- **Deploy Contracts**: [Contract Deployment](./deploy-contracts)

---

Need help? Join our [Discord](https://discord.gg/0glabs) for developer support.