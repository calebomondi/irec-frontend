import { useState, useEffect } from 'react';
import { getTransfers } from '../smartcontract/IREC';

// Define types for our blockchain data
interface OwnershipTransfer {
  from: string;
  to: string;
  amount: bigint;
  timestampz: number;
}

export default function TransferHistory() {
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransfers(): Promise<void> {
      try {
        setIsLoading(true);
        const data = await getTransfers();
        setTransfers(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }

    fetchTransfers();
  }, []);

  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  // Format address to be shorter
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded-lg">
        Error loading transfers: {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-400">
          Ownership Transfer History
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Recent IREC token transfers
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transfers.length > 0 ? (
              transfers.map((transfer, index) => (
                <tr key={index} className="">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="font-mono">{formatAddress(transfer.from)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="font-mono">{formatAddress(transfer.to)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {Number(transfer.amount) / (10 ** 18)} IREC
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(transfer.timestampz)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No transfers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}