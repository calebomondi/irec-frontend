import React from 'react';

// TypeScript interfaces for the certificate data structure
interface CertificateAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'date';
}

interface VerificationData {
  verifier_id: string;
  verification_date: string;
  methodology: string;
}

interface CarbonOffset {
  amount_tonnes: number;
  calculation_methodology: string;
}

interface CertificateProperties {
  verification_data: VerificationData;
  legal_disclaimer: string;
  carbon_offset: CarbonOffset;
}

interface CertificateData {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: CertificateAttribute[];
  properties: CertificateProperties;
  background_color: string;
}

// Utility function to format date timestamps
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Certificate Card Component
export const IRCertificateCard: React.FC<{ certificateData: CertificateData }> = ({ certificateData }) => {
  // Extract key data for better accessibility
  const energySource = certificateData.attributes.find(attr => attr.trait_type === "Energy Source")?.value;
  const energyAmount = certificateData.attributes.find(attr => attr.trait_type === "Energy Amount (MWh)")?.value;
  const country = certificateData.attributes.find(attr => attr.trait_type === "Generation Country")?.value;
  const region = certificateData.attributes.find(attr => attr.trait_type === "Generation Region")?.value;
  const status = certificateData.attributes.find(attr => attr.trait_type === "Certificate Status")?.value;
  
  // Find date attributes and format them
  const startDateAttr = certificateData.attributes.find(attr => attr.trait_type === "Generation Start Date");
  const endDateAttr = certificateData.attributes.find(attr => attr.trait_type === "Generation End Date");
  
  const startDate = startDateAttr && typeof startDateAttr.value === 'number' 
    ? formatDate(startDateAttr.value) 
    : 'N/A';
  
  const endDate = endDateAttr && typeof endDateAttr.value === 'number' 
    ? formatDate(endDateAttr.value) 
    : 'N/A';

  return (
    <div className="max-w-7xl mx-auto my-8 dark:bg-gray-800 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className="px-6 py-4 border-b" 
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold ">{certificateData.name}</h1>
            <div className="mt-1 flex items-center">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
              <a 
                href={certificateData.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-sm text-blue-600 hover:text-blue-800"
              >
                View on IREC
              </a>
            </div>
          </div>
          <div className="w-16 h-16 flex-shrink-0">
            <img 
              src={certificateData.image}
              alt="Certificate Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Description */}
        <div className="mb-6">
          <p className="">{certificateData.description}</p>
        </div>

        {/* Key Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Key Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className=" p-3 rounded">
              <p className="text-lg text-gray-500">Energy Source</p>
              <p className="font-medium">{energySource}</p>
            </div>
            <div className="p-3 rounded">
              <p className="text-lg text-gray-500">Energy Amount</p>
              <p className="font-medium">{energyAmount} MWh</p>
            </div>
            <div className="p-3 rounded">
              <p className="text-lg text-gray-500">Location</p>
              <p className="font-medium">{region}, {country}</p>
            </div>
            <div className="p-3 rounded">
              <p className="text-lg text-gray-500">Generation Period</p>
              <p className="font-medium">{startDate} - {endDate}</p>
            </div>
          </div>
        </div>

        {/* All Attributes */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Certificate Attributes</h2>
          <div className="rounded p-4">
            <table className="w-full text-sm">
              <tbody>
                {certificateData.attributes.map((attr, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-700' : ''}>
                    <td className="py-2 px-3 text-gray-400 text-md">{attr.trait_type}</td>
                    <td className="py-2 px-3 font-medium">
                      {attr.display_type === 'date' && typeof attr.value === 'number'
                        ? formatDate(attr.value)
                        : attr.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Data */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Verification Information</h2>
          <div className="p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-md text-gray-500">Verifier ID</p>
                <p className="font-medium">{certificateData.properties.verification_data.verifier_id}</p>
              </div>
              <div>
                <p className="text-md text-gray-500">Verification Date</p>
                <p className="font-medium">{certificateData.properties.verification_data.verification_date}</p>
              </div>
              <div>
                <p className="text-md text-gray-500">Methodology</p>
                <p className="font-medium">{certificateData.properties.verification_data.methodology}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carbon Offset */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Carbon Impact</h2>
          <div className="bg-green-50 p-4 rounded">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-green-600 font-bold">CO₂</span>
              </div>
              <div>
                <p className="font-semibold text-green-700">
                  {certificateData.properties.carbon_offset.amount_tonnes} tonnes CO₂ offset
                </p>
                <p className="text-sm text-green-600">
                  Calculated using {certificateData.properties.carbon_offset.calculation_methodology}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Legal Disclaimer</h2>
          <div className="p-4 rounded">
            <p className="text-sm text-gray-600 italic">
              {certificateData.properties.legal_disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};