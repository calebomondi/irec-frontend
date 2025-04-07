import { createPublicClient, createWalletClient, custom, http, parseEther, getContract, parseUnits } from "viem";
import { sepolia } from '@wagmi/core/chains'


//set up public cient
function getPublicClient() {    
    return createPublicClient({
      chain: sepolia,
      transport: http(`${import.meta.env.VITE_SEP_RPC_URL}`)
    });
}

//get the wallet client using browser wallet
export async function getWalletClient() {
    if(!window.ethereum) {
        throw new Error('Please install MetaMask or another web3 wallet');
    }

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
    })

    const [address] = await walletClient.requestAddresses(); 
    console.log('Connected Address: ', address)

    return {walletClient, address}
}

//get NFT URI
