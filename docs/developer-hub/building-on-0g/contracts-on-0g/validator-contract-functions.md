---
id: validator-contract-functions
title: Validator Contract Functions
---

# Validator Contract Functions

Complete function reference for individual validator contracts on 0G Chain.

:::info **Quick Links**
- **[Validator Initialization](./staking-interfaces#validator-initialization)** - Set up a new validator
- **[Staking Interfaces](./staking-interfaces)** - Main staking system overview
:::

## Function Types

### View Functions (Free to Call)

Query validator state without gas costs.

### Write Functions (Require Gas)

Modify validator state - cost gas to execute.

---

## View Functions

### Validator Information

#### `consensusPubkey()`
Returns the validator's BLS public key.

**Returns**: 48-byte BLS public key

---

#### `operatorAddress()`
Returns the validator operator's wallet address.

**Returns**: Operator address

---

#### `description()`
Returns validator metadata.

**Returns**:
- Moniker (name)
- Identity (verification key)
- Website
- Security contact
- Details

---

#### `commissionRate()`
Returns current commission rate.

**Returns**: Rate in parts per million (e.g., 100000 = 10%)

---

#### `withdrawalFeeInGwei()`
Returns fee charged for withdrawals.

**Returns**: Fee in Gwei

---

#### `bondStatus()`
Returns validator's current status.

**Returns**:
- `Unspecified` - Not activated
- `Bonded` - Active
- `Unbonding` - Exiting
- `Unbonded` - Fully exited

---

### Delegation Queries

#### `tokens()`
Returns total tokens delegated to this validator.

**Returns**: Total tokens in Wei

---

#### `delegatorShares()`
Returns total shares issued.

**Returns**: Total shares

---

#### `getDelegation(address delegator)`
Returns delegation info for a specific delegator.

**Parameters**:
- `delegator` - Delegator's address

**Returns**:
- Validator address
- Number of shares owned

---

#### `convertToTokens(uint shares)`
Converts shares to token amount.

**Parameters**:
- `shares` - Number of shares

**Returns**: Equivalent token amount

**Use Case**: Calculate token value of your shares

---

#### `convertToShares(uint tokens)`
Converts tokens to shares.

**Parameters**:
- `tokens` - Token amount

**Returns**: Equivalent shares

**Use Case**: Calculate shares you'll receive when delegating

---

### Rewards & Earnings

#### `rewards()`
Returns accumulated rewards pending distribution.

**Returns**: Reward amount in Wei

---

#### `commission()`
Returns accumulated commission earned by operator.

**Returns**: Commission in Wei

---

#### `tipFee()`
Returns withdrawable tip fees.

**Returns**: Tip fee amount in Wei

**Calculation**: Contract balance - (commission + rewards + stakes + pending withdrawals)

---

#### `stakes()`
Returns amount actively staked in beacon chain.

**Returns**: Staked amount in Wei

---

#### `annualPercentageYield()`
Returns current APY.

**Returns**: APY in basis points (e.g., 1500 = 15%)

---

### Withdrawal Queue

#### `withdrawCount()`
Returns number of pending withdrawals.

**Returns**: Count of pending withdrawals

---

#### `getWithdraw(uint64 index)`
Returns details of a specific withdrawal.

**Parameters**:
- `index` - Position in queue (0-based)

**Returns**:
- Completion height
- Delegator address
- Amount

---

#### `committedWithdrawAmount(uint blockHeight)`
Returns total withdrawal amount committed up to a block height.

**Parameters**:
- `blockHeight` - Block number

**Returns**: Total committed amount

---

#### `nextDepositAmount()`
Returns amount pending deposit to chain.

**Returns**: Pending deposit in Wei

---

#### `nextWithdrawalAmount()`
Returns amount pending withdrawal from chain.

**Returns**: Pending withdrawal in Wei

---

#### `failedWithdrawCount()`
Returns count of failed withdrawals.

**Returns**: Number of failed withdrawals

---

#### `failedWithdrawAmount()`
Returns total amount in failed withdrawals.

**Returns**: Failed withdrawal amount

---

## Write Functions

### Validator Configuration

#### `setCommissionRate(uint32 commissionRate_)`
Updates validator commission rate.

**Who Can Call**: Operator only

**Parameters**:
- `commissionRate_` - New rate (parts per million)

**Constraints**: Must be ≤ protocol maximum

---

#### `setWithdrawalFeeInGwei(uint96 withdrawalFeeInGwei_)`
Updates withdrawal fee.

**Who Can Call**: Operator only

**Parameters**:
- `withdrawalFeeInGwei_` - New fee in Gwei

**Constraints**: Must be ≤ protocol maximum

---

#### `setDescription(Description description_)`
Updates validator description.

**Who Can Call**: Operator only

**Parameters**:
- `description_` - New description struct

---

### Delegation Operations

#### `delegate(address delegatorAddress)`
Delegate tokens to this validator.

**Who Can Call**: Anyone

**Parameters**:
- `delegatorAddress` - Address to credit with shares

**Payment Required**: Yes (minimum 1 Gwei)

**Example**:
```solidity
validator.delegate{value: 100 ether}(msg.sender);
```

---

#### `undelegate(address withdrawalAddress, uint shares)`
Undelegate tokens from validator.

**Who Can Call**: Anyone with shares

**Parameters**:
- `withdrawalAddress` - Address to receive tokens
- `shares` - Number of shares to undelegate

**Payment Required**: Yes (must pay withdrawal fee)

**Constraints**:
- Must own enough shares
- Operator must maintain minimum self-delegation
- Tokens released after withdrawal delay

**Example**:
```solidity
uint96 fee = validator.withdrawalFeeInGwei();
validator.undelegate{value: fee * 1 gwei}(recipient, shares);
```

---

### Earnings Management

#### `withdrawCommission(address withdrawalAddress)`
Withdraw accumulated commission.

**Who Can Call**: Operator only

**Parameters**:
- `withdrawalAddress` - Address to receive commission

**Constraints**:
- Must have ≥1 Gwei commission
- Goes to withdrawal queue (not instant)

---

#### `withdrawTipFee(address withdrawalAddress)`
Withdraw accumulated tip fees.

**Who Can Call**: Operator only

**Parameters**:
- `withdrawalAddress` - Address to receive tips

**Constraints**:
- Only withdraws excess balance
- Immediate transfer (not queued)

---

### System Operations

#### `distributeRewards()`
Distribute rewards to delegators and commission to operator.

**Who Can Call**: Anyone (called by system)

**Process**:
1. Community tax deducted
2. Commission calculated
3. Remaining distributed to delegators

---

#### `processWithdrawQueue()`
Process pending withdrawals that are ready.

**Who Can Call**: Anyone

**When**: After withdrawal delay period

**Process**:
- Checks ready withdrawals
- Transfers funds
- Failed transfers go to failed stack

---

#### `processFailedWithdrawStack()`
Retry failed withdrawals.

**Who Can Call**: Anyone

**Process**:
- Retries all failed withdrawals
- Still-failed amounts sent to community pool

---

## Common Use Cases

### For Delegators

**Before Delegating:**
```solidity
// Check validator settings
uint32 commission = validator.commissionRate();
uint96 withdrawalFee = validator.withdrawalFeeInGwei();
uint bondStatus = validator.bondStatus(); // Should be 1 (Bonded)
uint apy = validator.annualPercentageYield();
```

**Delegate Tokens:**
```solidity
validator.delegate{value: amount}(yourAddress);
```

**Check Your Delegation:**
```solidity
(, uint shares) = validator.getDelegation(yourAddress);
uint tokens = validator.convertToTokens(shares);
```

**Undelegate:**
```solidity
uint96 fee = validator.withdrawalFeeInGwei();
validator.undelegate{value: fee * 1 gwei}(withdrawalAddress, shares);
// Wait for withdrawal delay, then call processWithdrawQueue()
```

---

### For Validator Operators

**Update Settings:**
```solidity
validator.setCommissionRate(50000); // 5%
validator.setWithdrawalFeeInGwei(1); // 1 Gwei
```

**Check Earnings:**
```solidity
uint commissionAmount = validator.commission();
uint tipFeeAmount = validator.tipFee();
```

**Withdraw Earnings:**
```solidity
// Withdraw commission (queued)
validator.withdrawCommission(yourAddress);

// Withdraw tips (immediate)
validator.withdrawTipFee(yourAddress);
```

**Monitor Status:**
```solidity
uint totalDelegated = validator.tokens();
uint activeStake = validator.stakes();
uint pendingWithdrawals = validator.withdrawCount();
```

---

## Important Notes

:::warning **Key Constraints**
- **Withdrawal Delays**: Undelegations enter a queue with delay period
- **Minimum Amounts**: Most operations require ≥1 Gwei
- **Fee Requirements**: Undelegation requires prepaid withdrawal fee
- **Self-Delegation**: Operators must maintain minimum or lose commission
:::

:::tip **Best Practices**
- Always check `bondStatus()` before delegating
- Use `convertToTokens()` to calculate delegation value
- Monitor `failedWithdrawCount()` and process if needed
- Operators should regularly claim commission and tips
:::

---

## Related Documentation

- **[Validator Initialization](./staking-interfaces#validator-initialization)** - Set up a new validator
- **[Staking Interfaces](./staking-interfaces)** - Full staking system guide
- **[Run Validator Node](../../../run-a-node/validator-node)** - Node setup guide

---

Need help? Join our [Discord](https://discord.gg/0glabs) for support.
