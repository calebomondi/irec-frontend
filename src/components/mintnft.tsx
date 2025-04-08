import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle2, AlertCircle, Gem, Coins, 
  SplitSquareVertical, DollarSign, Info
} from 'lucide-react';

import toast from 'react-hot-toast';
import { 
  mintNFTToken,
  acquireOwnershipTokenId,
  tranferToMarketPlace,
  setTokenPrice
 } from '../smartcontract/IREC';

export default function TokenFractionalizationComponent() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<{ 
    id: string; 
    name: string; 
    source: string; 
    location: string; 
    amount: number; 
    status: string; 
    imageUrl: string; 
  }[]>([]);
  
  // Form data for the minting and fractionalization process
  const [formData, setFormData] = useState({
    certificateId: '',
    tokenName: 'I-REC Tokens',
    tokenSymbol: 'IRECT',
    tokenDescription: 'Fractionalized I-REC Certificate',
    fractionCount: 1000,
    fractionPrice: 0.01,
    minPurchaseAmount: 1,
    transferRestrictions: 'none',
    royaltyPercentage: 2.5,
    tradingFeePercentage: 1.0,
    allowSecondaryTrading: true
  });
  
  // Validation errors
  const [errors, setErrors] = useState<Errors>({});
  
  // Mock data for sample certificates
  useEffect(() => {
    // In a real implementation, this would fetch from your API
    setCertificates([
      {
        id: 'cert-12345',
        name: 'IREC Certificate #12345',
        source: 'Solar',
        location: 'Turkana County, Kenya',
        amount: 1,
        status: 'verified',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yTBPQjFFcXOj203GBDAmOkA2YMuZp_TVoA&s'
      }
    ]);
  }, []);
  
interface FormData {
    certificateId: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDescription: string;
    fractionCount: number;
    fractionPrice: number;
    minPurchaseAmount: number;
    transferRestrictions: string;
    royaltyPercentage: number;
    tradingFeePercentage: number;
    allowSecondaryTrading: boolean;
}

interface Errors {
    [key: string]: string;
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' && (e.target as HTMLInputElement).checked;
    setFormData((prev: FormData) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field if any
    if (errors[name]) {
        setErrors((prev: Errors) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
};
  
interface Certificate {
    id: string;
    name: string;
    source: string;
    location: string;
    amount: number;
    status: string;
    imageUrl: string;
}

const handleCertificateSelect = (certificate: Certificate): void => {
    setSelectedCertificate(certificate);
    setFormData((prev: FormData) => ({
        ...prev,
        certificateId: certificate.id,
        tokenName: `I-REC Tokens`,
        tokenSymbol: `IRECT`,
        tokenDescription: `This token represents fractional ownership of ${certificate.amount} MWh of ${certificate.source.toLowerCase()} energy generated in ${certificate.location}.`
    }));
};
  
interface ValidationErrors {
    [key: string]: string;
}

const validateStep = (currentStep: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (currentStep === 1) {
        if (!formData.certificateId) {
            newErrors.certificateId = 'Please select a certificate';
        }
    } 
    else if (currentStep === 2) {
        if (!formData.tokenName.trim()) {
            newErrors.tokenName = 'Token name is required';
        }
        if (!formData.tokenSymbol.trim()) {
            newErrors.tokenSymbol = 'Token symbol is required';
        }
        if (formData.tokenSymbol.length > 5) {
            newErrors.tokenSymbol = 'Symbol should be 5 characters or less';
        }
        if (!formData.tokenDescription.trim()) {
            newErrors.tokenDescription = 'Token description is required';
        }
    }
    else if (currentStep === 3) {
        if (!formData.fractionCount || formData.fractionCount <= 0) {
            newErrors.fractionCount = 'Must have at least one fraction';
        }
        if (!formData.fractionPrice || formData.fractionPrice <= 0) {
            newErrors.fractionPrice = 'Price must be greater than zero';
        }
        if (!formData.minPurchaseAmount || formData.minPurchaseAmount <= 0) {
            newErrors.minPurchaseAmount = 'Minimum purchase must be greater than zero';
        }
        if (formData.minPurchaseAmount > formData.fractionCount) {
            newErrors.minPurchaseAmount = 'Minimum purchase cannot exceed total fractions';
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
  
  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPreviousStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (validateStep(3)) {
        setIsLoading(true);
        
        // Simulate API call with delay
        try {
            await new Promise<void>(resolve => setTimeout(resolve, 2000));
            //mint NFT
            const tokenId = await mintNFTToken();
            if (!tokenId) {
                throw new Error('Failed to mint NFT token');
            }
            toast.success('Token successfully minted ID: ' + tokenId);

            //tranfer ownership of the token ddress
            const transferHash = await acquireOwnershipTokenId(tokenId);
            if (!transferHash) {
                throw new Error('Failed to transfer ownership of the token');
            }
            toast.success('Token ownership successfully transferred!');

            //transfer ownership to market place
            const marketHash = await tranferToMarketPlace();
            if (!marketHash) {
                throw new Error('Failed to transfer ownership to market place');
            }
            toast.success('Token successfully created and fractionalized!');

            //set u price
            const priceHash = await setTokenPrice(formData.fractionPrice);
            if (!priceHash) {
                throw new Error('Failed to set token price');
            }
            toast.success('Token price successfully set!');
            
            setStep(4); // Success step
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    }
};
  
  // Calculate some derived values for the UI
  const totalValue = formData.fractionCount * formData.fractionPrice;
  const energyPerFraction = selectedCertificate 
    ? (selectedCertificate.amount / formData.fractionCount).toFixed(3) 
    : 0;
  const royaltyAmount = (totalValue * (formData.royaltyPercentage / 100)).toFixed(2);
  
  return (
    <div className="max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white">
        <h1 className="text-xl font-bold">Create & Fractionalize Token</h1>
        <p className="text-sm opacity-90">Convert I-REC certificate into tradable token fractions</p>
      </div>
      
      {/* Progress Steps */}
      <div className="px-6 py-3 border-b">
        <div className="flex justify-between">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${step >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {step > 1 ? <CheckCircle2 size={16} /> : '1'}
            </div>
            <span className="text-xs">Select Certificate</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className={`h-1 w-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${step >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {step > 2 ? <CheckCircle2 size={16} /> : '2'}
            </div>
            <span className="text-xs">Token Details</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className={`h-1 w-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${step >= 3 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {step > 3 ? <CheckCircle2 size={16} /> : '3'}
            </div>
            <span className="text-xs">Fractionalize</span>
          </div>
        </div>
      </div>
        
      <form onSubmit={handleSubmit}>
        {/* Step 1: Select Certificate */}
        {step === 1 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <Gem size={20} className="mr-2 text-green-600" />
              Select Certificate to Tokenize
            </h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mt-1 mb-4">
                Select an I-REC certificate you own to convert into a tradable token. Only verified certificates can be tokenized.
              </p>
              
              {errors.certificateId && (
                <div className="flex items-center p-3 mb-4 bg-red-50 text-red-700 rounded-md">
                  <AlertCircle size={16} className="mr-2" />
                  <p className="text-sm">{errors.certificateId}</p>
                </div>
              )}
              
              <div className="grid gap-4">
                {certificates.map(certificate => (
                  <div 
                    key={certificate.id}
                    onClick={() => handleCertificateSelect(certificate)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCertificate?.id === certificate.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                        <img 
                          src={certificate.imageUrl} 
                          alt={certificate.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{certificate.name}</h3>
                        <p className="text-sm text-gray-600">
                          {certificate.amount} MWh of {certificate.source} Energy
                        </p>
                        <p className="text-sm text-gray-500">
                          {certificate.location}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {certificate.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!selectedCertificate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                Next Step <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Token Details */}
        {step === 2 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <Coins size={20} className="mr-2 text-green-600" />
              Token Details
            </h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Define the basic details of your token. These details will be visible to potential buyers.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Name*
              </label>
              <input 
                type="text" 
                name="tokenName"
                value={formData.tokenName}
                onChange={handleChange}
                placeholder="e.g. Solar Energy Token"
                className={`w-full p-2 border ${errors.tokenName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                required
              />
              {errors.tokenName && <p className="text-red-500 text-xs mt-1">{errors.tokenName}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Symbol*
              </label>
              <input 
                type="text" 
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleChange}
                placeholder="e.g. SET"
                maxLength={5}
                className={`w-full p-2 border ${errors.tokenSymbol ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                required
              />
              {errors.tokenSymbol && <p className="text-red-500 text-xs mt-1">{errors.tokenSymbol}</p>}
              <p className="text-xs text-gray-500 mt-1">Short ticker symbol for your token (max 5 characters)</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Description*
              </label>
              <textarea 
                name="tokenDescription"
                value={formData.tokenDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what this token represents..."
                className={`w-full p-2 border ${errors.tokenDescription ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                required
              />
              {errors.tokenDescription && <p className="text-red-500 text-xs mt-1">{errors.tokenDescription}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Royalty Percentage
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="royaltyPercentage"
                  value={formData.royaltyPercentage}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Percentage you'll receive from secondary sales (0-10%)
              </p>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowSecondaryTrading"
                  checked={formData.allowSecondaryTrading}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Allow secondary trading of token fractions
                </span>
              </label>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
              >
                Next Step <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Fractionalization & Pricing */}
        {step === 3 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <SplitSquareVertical size={20} className="mr-2 text-green-600" />
              Fractionalization & Pricing
            </h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Determine how your certificate will be split into fractions and set pricing parameters.
              </p>
            </div>
            
            {selectedCertificate && (
              <div className="p-4 bg-blue-50 rounded-lg mb-6">
                <h3 className="font-medium text-blue-800">Certificate Information</h3>
                <p className="text-sm text-blue-700">
                  Tokenizing {selectedCertificate.amount} MWh of {selectedCertificate.source} energy from {selectedCertificate.location}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Fractions*
                </label>
                <input 
                  type="number" 
                  name="fractionCount"
                  value={formData.fractionCount}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 100"
                  className={`w-full p-2 border ${errors.fractionCount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                  required
                />
                {errors.fractionCount && <p className="text-red-500 text-xs mt-1">{errors.fractionCount}</p>}
                {selectedCertificate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Each fraction will represent {energyPerFraction} MWh of energy
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Fraction*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    ETH
                  </div>
                  <input 
                    type="number" 
                    name="fractionPrice"
                    value={formData.fractionPrice}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 14.50"
                    className={`w-full pl-12 p-2 border ${errors.fractionPrice ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                    required
                  />
                </div>
                {errors.fractionPrice && <p className="text-red-500 text-xs mt-1">{errors.fractionPrice}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Total value: ${totalValue.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Purchase Amount (number of fractions)*
              </label>
              <input 
                type="number" 
                name="minPurchaseAmount"
                value={formData.minPurchaseAmount}
                onChange={handleChange}
                min="1"
                max={formData.fractionCount}
                placeholder="e.g. 1"
                className={`w-full p-2 border ${errors.minPurchaseAmount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                required
              />
              {errors.minPurchaseAmount && <p className="text-red-500 text-xs mt-1">{errors.minPurchaseAmount}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Minimum number of fractions that can be purchased in a single transaction
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trading Fee Percentage
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="tradingFeePercentage"
                  value={formData.tradingFeePercentage}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fee charged on each transaction (0-5%)
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer Restrictions
              </label>
              <select
                name="transferRestrictions"
                value={formData.transferRestrictions}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="none">None - Anyone can buy</option>
                <option value="kyc">KYC Required - Identity verification needed</option>
                <option value="accredited">Accredited Investors Only</option>
                <option value="whitelist">Whitelist Only - Selected addresses</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Restrictions on who can purchase fractions of this token
              </p>
            </div>
            
            {/* Summary */}
            <div className="p-4 rounded-lg mb-8">
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                <Info size={16} className="mr-1 text-gray-500" /> Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Certificate Value:</p>
                  <p className="font-medium">${totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Energy Per Fraction:</p>
                  <p className="font-medium">{energyPerFraction} MWh</p>
                </div>
                <div>
                  <p className="text-gray-600">Royalties (if enabled):</p>
                  <p className="font-medium">{formData.royaltyPercentage}% (${royaltyAmount} per full sale)</p>
                </div>
                <div>
                  <p className="text-gray-600">Trading Status:</p>
                  <p className="font-medium">{formData.allowSecondaryTrading ? 'Secondary trading enabled' : 'Secondary trading disabled'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>Create & Fractionalize Token</>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Success step */}
        {step === 4 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Token Successfully Created!</h2>
            <p className="text-gray-600 mb-6">
              Your I-REC certificate has been tokenized and fractionalized. The fractions are now available for purchase.
            </p>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h3 className="font-medium text-green-800 mb-2">Token Details</h3>
              <p className="font-medium">{formData.tokenName} ({formData.tokenSymbol})</p>
              <p className="text-sm text-green-700 mb-2">{formData.fractionCount} fractions created</p>
              <div className="flex justify-between text-sm text-green-700">
                <span>Price per fraction:</span>
                <span className="font-medium">${formData.fractionPrice}</span>
              </div>
              <div className="flex justify-between text-sm text-green-700">
                <span>Total value:</span>
                <span className="font-medium">${totalValue.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Details
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
              >
                Go to Marketplace
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}