import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { getWalletClient, getNFTOwner } from '../smartcontract/IREC';

import { metaData } from '../smartcontract/metadata';
import { IRCertificateCard } from '../components/IRCertificateCard';
import Hero from '../components/hero';
import TokenFractionalizationComponent from '../components/mintnft';
import TransferHistory from '../components/ownerships';
import TokenMarketplace from '../components/markets';

export default function Main() {
  const { isConnected } = useAccount();

  const [activeTab, setActiveTab] = useState<string>('view');
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const {address} = await getWalletClient();
      const owner = await getNFTOwner();
      setIsOwner(address === owner);
    };

    if(isConnected) {
      fetchData();
    }
  }, [isConnected]);

  return (
    <div>
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center shadow-md top-0 left-0 sticky bg-green-500 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-gray-300">I-REC</span>
        </div>
        {
          isConnected && (
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-200 hover:text-green-600 transition-colors" onClick={() => setActiveTab("view")}>View Certificate</a>
              <a href="#" className="text-gray-200 hover:text-green-600 transition-colors" onClick={() => setActiveTab("market")}>MarketPlace</a>
              <a href="#" className="text-gray-200 hover:text-green-600 transition-colors" onClick={() => setActiveTab("owners")}>Ownership Transfer</a>
              {
                isOwner && (<a href="#" className="text-gray-200 hover:text-green-600 transition-colors" onClick={() => setActiveTab("fractions")}>Mint & Fractionalize</a>)
              }
              
            </div>
          )
        }
        <div className="flex items-center gap-3 scale-75">
          <ConnectButton />
        </div>
      </nav>
      {
        isConnected ? (
          <>
            {activeTab === "view" && <IRCertificateCard certificateData={metaData} />}
            {activeTab === "market" && <TokenMarketplace />}
            {activeTab === "fractions" && <TokenFractionalizationComponent />}
            {activeTab === "owners" && <TransferHistory />}
          </>
        ) : (
          <Hero />
        )
      }
    </div>
  )
}
