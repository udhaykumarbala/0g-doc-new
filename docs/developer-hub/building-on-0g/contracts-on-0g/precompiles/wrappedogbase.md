---
id: precompiles-wrappedogbase
title: Wrapped 0G Base
---

# Overview

Wrapped0GBase is a wrapper for the `x/wrapped-og-base` module in the 0g chain. W0G is a wrapped ERC20 token for native 0G. It supports quota-based mint/burn functions based on native 0G transfers, on top of traditional wrapped token implementation. The minting/burning quota for each address will be determined through governance voting. `x/wrapped-og-base` is the module that supports and maintains the minting/burning quota.

In most cases this precompile should be only called by wrapped 0G contract.

# Address

`0x0000000000000000000000000000000000001002`


> **Wrapped 0G Token Contract Address**: `0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c`
>
> This is the official address of the wrapped 0G (W0G) ERC20 token on the 0G chain. Use this address if you want to interact directly with the wrapped 0G token contract for transfers, approvals, or other ERC20 operations.

# Interface

[https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IWrappedA0GIBase.sol](https://github.com/0gfoundation/0g-chain/blob/dev/precompiles/interfaces/contracts/IWrappedA0GIBase.sol)

## Structs

### `Supply`
```solidity
struct Supply {
    uint256 cap;
    uint256 initialSupply;
    uint256 supply;
}
```
- **Description**: Defines the supply details of a minter, including the cap, initial supply, and the current supply.
  
- **Fields**:
  - `cap`: The maximum allowed mint supply for the minter.
  - `initialSupply`: The initial mint supply to the minter, equivalent to the initial allowed burn amount.
  - `supply`: The current mint supply used by the minter, set to `initialSupply` at beginning.

---

## Functions

### `getWA0GI()`
```solidity
function getWA0GI() external view returns (address);
```
- **Description**: Retrieves the address of the wrapped 0G token from the wrapped 0G precompile.
- **Returns**: `address` of the W0G contract.

---

### `minterSupply(address minter)`
```solidity
function minterSupply(address minter) external view returns (Supply memory);
```
- **Description**: Retrieves the mint supply details for a given minter.
- **Parameters**: 
  - `minter`: The address of the minter.
- **Returns**: A `Supply` structure containing the mint cap, initial supply, and current supply of the specified minter.

---

### `mint(address minter, uint256 amount)`
```solidity
function mint(address minter, uint256 amount) external;
```
- **Description**: Mints 0G to WA0GI contract and adds the corresponding amount to the minter's mint supply. If the minter's final mint supply exceeds their mint cap, the transaction will revert.
- **Parameters**: 
  - `minter`: The address of the minter.
  - `amount`: The amount of 0G to mint.
- **Restrictions**: Can only be called by the WA0GI contract.

---

### `burn(address minter, uint256 amount)`
```solidity
function burn(address minter, uint256 amount) external;
```
- **Description**: Burns the specified amount of 0G in WA0GI contract on behalf of the minter and reduces the corresponding amount from the minter's mint supply.
- **Parameters**: 
  - `minter`: The address of the minter.
  - `amount`: The amount of 0G to burn.
- **Restrictions**: Can only be called by the W0G contract.

---