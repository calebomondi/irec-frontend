import { createPublicClient, createWalletClient, custom, http, parseEther, getContract, parseUnits } from "viem";
import { sepolia } from '@wagmi/core/chains'
import { 
    IREC_NFT_ABI, 
    IREC_NFT_CONTRACT_ADDRESS,
    IREC_TOKEN_ABI,
    IREC_TOKEN_CONTRACT_ADDRESS,
    IREC_MARKETPLACE_ABI,
    IREC_MARKETPLACE_CONTRACT_ADDRESS
} from "./core";

interface OwnershipTransfer {
from: string;
to: string;
amount: bigint;
timestampz: number;
}

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

//IREC NFT Contract
export async function getNFTOwner() {
    const publicClient = getPublicClient()

    try {
        const address = await publicClient.readContract({
            address: IREC_NFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_NFT_ABI,
            functionName: 'owner',
            args:[]
        });
    
        return address as string;
    } catch (error) {
        throw new Error(`Cannot Get NFT URI! ~ ${error}`);
    }
}

export async function getTokenMintedCount() {
    const publicClient = getPublicClient()

    try {
        const tokenMintCount = await publicClient.readContract({
            address: IREC_NFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_NFT_ABI,
            functionName: 'getTokenIdCount',
            args:[]
        });
    
        return tokenMintCount as number;
    } catch (error) {
        throw new Error(`Cannot Minted Tokens Count! ~ ${error}`);
    }
}

export async function mintNFTToken() {
    const { walletClient, address } = await getWalletClient();
    const publicClient = getPublicClient()

    try {
        const { request } = await publicClient.simulateContract({
            address: IREC_NFT_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_NFT_ABI,
            functionName: "safeMint",
            args: [address],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        if(hash) {
            const tokenMintCount = await getTokenMintedCount()
            return Number(tokenMintCount) - 1
        }

        return null
    } catch (error) {
        console.log(`Failed To Mint NFT! ~ ${error}`);
        throw new Error(`Failed To Mint NFT!`);
    }
}

//IREC Token Contract
export async function getBalanceOfUser(account: string) {
    const publicClient = getPublicClient()

    try {
        const balance = await publicClient.readContract({
            address: IREC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_TOKEN_ABI,
            functionName: 'balanceOf',
            args:[account]
        });
    
        return balance as number;
    } catch (error) {
        throw new Error(`Cannot Get User Balance! ~ ${error}`);
    }
}

export async function acquireOwnershipTokenId(tokenId: number) {
    const { walletClient, address } = await getWalletClient();
    const publicClient = getPublicClient()

    try {
        const { request } = await publicClient.simulateContract({
            address: IREC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_TOKEN_ABI,
            functionName: "tranferNFTOwnership",
            args: [tokenId],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash

    } catch (error) {
        console.log(`Failed To Tranfer NFT Token Ownership! ~ ${error}`);
        throw new Error(`Failed To Tranfer NFT Token Ownership!`);
    }
}

async function approveToken(amount:number) {
    try {
        const { walletClient, address } = await getWalletClient()
        const publicClient = getPublicClient()

        //get contract instance
        const contract = getContract({
            address: IREC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_TOKEN_ABI,
            client : {
                public: publicClient,
                wallet: walletClient
            }
        });

        //convert to proper decimals
        const amountInWei = parseUnits(amount.toString(), 18);

        //send approve transaction
        const hash = await contract.write.approve(["0xB40E373362Ba468982214E4b38E861153080D6F3", amountInWei], { account: address });

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        console.log(`receipt => ${receipt}`)

        return receipt
    } catch(error: any) {
        throw new Error(`Error Approving Tokens!`)
    }
}

//IREC MarketPlace Contract
export async function tranferToMarketPlace() {
    //approve token transfer to marketplace
    const receipt = await approveToken(1000)
    if(!receipt) {
        throw new Error(`Failed To Approve Tokens!`)
    }

    const { walletClient, address } = await getWalletClient();
    const publicClient = getPublicClient()

    try {
        const { request } = await publicClient.simulateContract({
            address: IREC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_MARKETPLACE_ABI,
            functionName: "depositReserveTokens",
            args: [],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash

    } catch (error) {
        console.log(`Failed To Tranfer Tokens To Marketplace! ~ ${error}`);
        throw new Error(`Failed To Tranfer NFT Token Ownership!`);
    }
}

export async function setTokenPrice(price: number) {
    const { walletClient, address } = await getWalletClient();
    const publicClient = getPublicClient()

    try {
        const { request } = await publicClient.simulateContract({
            address: IREC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_MARKETPLACE_ABI,
            functionName: "configureSale",
            args: [parseEther(price.toString())],
            account: address
        });

        const hash = await walletClient.writeContract(request)

        return hash

    } catch (error) {
        console.log(`Failed To Set Token Price! ~ ${error}`);
        throw new Error(`Failed To Set Token Price!`);
    }
}

export async function getPercentOwnership() {
    const publicClient = getPublicClient()
    const { address } = await getWalletClient();

    try {
        const percentOwnership = await publicClient.readContract({
            address: IREC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_MARKETPLACE_ABI,
            functionName: 'getOwnershipPercentage',
            args:[address]
        });
    
        return percentOwnership as number;
    } catch (error) {
        throw new Error(`Cannot Get Percent Ownership! ~ ${error}`);
    }
}

export async function getTransfers() {
    const publicClient = getPublicClient()

    try {
        const transfers = await publicClient.readContract({
            address: IREC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_MARKETPLACE_ABI,
            functionName: 'getOwnershipTransfers',
            args:[]
        });
    
        return transfers as OwnershipTransfer[];
    } catch (error) {
        throw new Error(`Cannot Get Transfers! ~ ${error}`);
    }
}

export async function getListings(listingId: number) {
    const publicClient = getPublicClient()

    try {
        const listing = await publicClient.readContract({
            address: IREC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_MARKETPLACE_ABI,
            functionName: 'getTokenListing',
            args:[listingId]
        });
    
        return listing as any;
    } catch (error) {
        throw new Error(`Cannot Get Listing! ~ ${error}`);
    }
}

export async function purchaseFromReserve(amount: number) {
    const { walletClient, address } = await getWalletClient();
    const publicClient = getPublicClient();
    
    try {
        // First, get the current sale price from the contract
        const salePrice = await publicClient.readContract({
            address: IREC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_MARKETPLACE_ABI,
            functionName: "salePrice",
        });
        
        // Calculate total cost (salePrice * amount)
        const totalCost = BigInt(salePrice as bigint) * BigInt(amount);
        
        const { request } = await publicClient.simulateContract({
            address: IREC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            abi: IREC_MARKETPLACE_ABI,
            functionName: "purchaseFromReserve",
            args: [amount],
            account: address,
            value: totalCost  // Use the correct calculated value
        });

        const hash = await walletClient.writeContract(request);
        return hash;

    } catch (error) {
        console.log(`Failed To Buy Token! ~ ${error}`);
        throw new Error(`Failed To Buy Token!`);
    }
}