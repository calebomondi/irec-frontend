import { useState, useEffect } from 'react';
import { getBalanceOfUser, getPercentOwnership, purchaseFromReserve, getWalletClient } from '../smartcontract/IREC';
import { IREC_MARKETPLACE_CONTRACT_ADDRESS } from '../smartcontract/core';

export default function TokenMarketplace() {
  const [userAddress, setUserAddress] = useState<string>('');
  const [userBalance, setUserBalance] = useState<string>('0');
  const [percentOwnership, setPercentOwnership] = useState<string>('0');
  const [reserveBalance, setReserveBalance] = useState<string>('0');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({
    text: '',
    type: null
  });

  // Fetch user data when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get connected wallet address
        const { address } = await getWalletClient();
        setUserAddress(address);
        
        // Get user balance
        const balance = await getBalanceOfUser(address);
        setUserBalance(formatTokenAmount(balance));
        
        // Get ownership percentage
        const ownership = await getPercentOwnership();
        setPercentOwnership(formatPercentage(ownership));
        
        // Get reserve balance (you'll need to implement this function)
        const reserve = await getContractReserveBalance();
        setReserveBalance(formatTokenAmount(reserve));
        
        setIsLoading(false);
      } catch (error: any) {
        setMessage({ text: error.message, type: 'error' });
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Helper function to get contract reserve balance
  async function getContractReserveBalance() {
    const address = await getBalanceOfUser(IREC_MARKETPLACE_CONTRACT_ADDRESS);
    return address
  }
  
  // Format token amount (assuming 18 decimals)
  function formatTokenAmount(amount: bigint | number): string {
    return (Number(amount) / 10**18).toFixed(4);
  }
  
  // Format percentage
  function formatPercentage(percentage: number): string {
    return (Number(percentage) / 100).toFixed(2);
  }
  
  // Handle purchase form submission
  async function handlePurchase() {
    if (purchaseAmount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }
    
    try {
      setMessage({ text: 'Processing purchase...', type: 'info' });
      setIsPurchasing(true);
      
      const hash = await purchaseFromReserve(purchaseAmount);
      
      setMessage({ 
        text: `Purchase successful! Transaction hash: ${hash.slice(0, 10)}...`, 
        type: 'success' 
      });
      
      // Refresh balances
      const { address } = await getWalletClient();
      const balance = await getBalanceOfUser(address);
      setUserBalance(formatTokenAmount(balance));
      
      const ownership = await getPercentOwnership();
      setPercentOwnership(formatPercentage(ownership));
      
      const reserve = await getContractReserveBalance();
      setReserveBalance(formatTokenAmount(reserve));
      
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsPurchasing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">IREC Token Marketplace</h2>
      
      {/* User Info Section */}
      <div className=" rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Your Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className=" p-3 rounded shadow">
            <div className="text-sm text-gray-500">Address</div>
            <div className="font-mono text-sm truncate">{userAddress}</div>
          </div>
          <div className=" p-3 rounded shadow">
            <div className="text-sm text-gray-500">Your Balance</div>
            <div className="text-xl font-semibold">{userBalance} IREC</div>
          </div>
          <div className=" p-3 rounded shadow">
            <div className="text-sm text-gray-500">Ownership</div>
            <div className="text-xl font-semibold">{percentOwnership}%</div>
          </div>
        </div>
      </div>
      
      {/* Reserve Info */}
      <div className="rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Contract Reserve</h3>
        <div className=" p-3 rounded shadow">
          <div className="text-sm text-gray-500">Available Tokens</div>
          <div className="text-xl font-semibold">{reserveBalance} IREC</div>
        </div>
      </div>
      
      {/* Purchase Form */}
      <div className="rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Purchase Tokens</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Purchase</label>
            <input
              type="number"
              min="1"
              step="1"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              disabled={isPurchasing}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePurchase}
              disabled={isPurchasing || purchaseAmount <= 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {isPurchasing ? 'Processing...' : 'Purchase Tokens'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Cost: {(purchaseAmount * 0.01).toFixed(3)} ETH (Estimated)
        </p>
      </div>
      
      {/* Status Messages */}
      {message.text && (
        <div className={`p-4 rounded-md mb-4 ${
          message.type === 'error' ? 'bg-red-50 text-red-700' :
          message.type === 'success' ? 'bg-green-50 text-green-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}