import React, { useState } from 'react';
import RemoveNewtonModal from '../RemoveNewtonModal';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskButtonProps {
  label?: string;
  chainId?: string | number;
  chainName?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: number;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
}

export default function MetaMaskButton({
  label = "Add 0G Testnet",
  chainId: inputChainId = '16602',
  chainName = '0G-Testnet-Galileo',
  tokenSymbol = '0G',
  tokenName = '0G',
  tokenDecimals = 18,
  rpcUrls = ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls = ['https://chainscan-galileo.0g.ai/']
}: MetaMaskButtonProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getChainID = (networkId: string | number): string => {
    const numeric = typeof networkId === 'string' ? parseInt(networkId) : networkId;
    return '0x' + Number(numeric).toString(16);
  };

  const addNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed! Please install MetaMask first.');
      return;
    }

    const desiredChainHex = getChainID(inputChainId);

    // For Galileo Testnet specifically, keep the legacy migration helper
    if (String(inputChainId) === '16601') {
      const changedToGalileo = await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: desiredChainHex }] }).catch(async () => {
        const changedToOldGalileo = await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: getChainID('80087') }] }).catch(async () => {
          const params = [{
            chainId: desiredChainHex,
            chainName,
            nativeCurrency: {
              name: tokenName,
              symbol: tokenSymbol,
              decimals: tokenDecimals
            },
            rpcUrls,
            blockExplorerUrls
          }];
  
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params
          }).catch((error: any) => {
            console.log(error);
          });
          return true;
        });

        if (changedToOldGalileo) {
          return false;
        }

        setIsModalOpen(true);
        return true;
      });

      if (changedToGalileo) {
        return false;
      }

      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId === desiredChainHex) {
        alert('0G Testnet added');
        return;
      }
      return;
    }

    // Generic flow for other networks (e.g., Mainnet)
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainHex }]
      });
      return;
    } catch (switchError: any) {
      if (switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: desiredChainHex,
              chainName,
              nativeCurrency: {
                name: tokenName,
                symbol: tokenSymbol,
                decimals: tokenDecimals
              },
              rpcUrls,
              blockExplorerUrls
            }]
          });
          alert(`${chainName} added`);
          return;
        } catch (addError) {
          console.log(addError);
        }
      } else {
        console.log(switchError);
      }
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <button
        onClick={addNetwork}
        style={{
          backgroundColor: '#E2761B',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px'
        }}>
        <img
          src="/img/metamask.svg"
          alt="MetaMask Fox"
          style={{ height: '18px' }}
        />
        {label}
      </button>
      <RemoveNewtonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
} 