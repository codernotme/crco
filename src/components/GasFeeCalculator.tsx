import React, { useEffect, useState } from 'react';
import { Network } from '../contexts/NetworkContext';
import { Compass as GasPump } from 'lucide-react';

interface GasFeeCalculatorProps {
  sourceNetwork: Network | null;
  targetNetwork: Network | null;
  amount: string;
  token: string;
}

function GasFeeCalculator({
  sourceNetwork,
  targetNetwork,
  amount,
  token,
}: GasFeeCalculatorProps) {
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const calculateGas = async () => {
      if (!sourceNetwork || !targetNetwork || !amount || !token) {
        setEstimatedGas(null);
        return;
      }

      setIsLoading(true);
      try {
        // Simulated gas calculation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockGas = (Math.random() * 0.005 + 0.001).toFixed(6);
        setEstimatedGas(mockGas);
      } catch (error) {
        console.error('Error calculating gas:', error);
        setEstimatedGas(null);
      } finally {
        setIsLoading(false);
      }
    };

    calculateGas();
  }, [sourceNetwork, targetNetwork, amount, token]);

  if (!sourceNetwork || !targetNetwork || !amount || !token) {
    return null;
  }

  return (
    <div className="bg-dark-200 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <GasPump className="w-5 h-5 text-neon mr-2" />
        <span className="font-medium">Estimated Gas Fee</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Network Fee</span>
        {isLoading ? (
          <div className="h-6 w-24 bg-dark-300 rounded animate-pulse" />
        ) : estimatedGas ? (
          <span>{estimatedGas} ETH</span>
        ) : (
          <span className="text-red-500">Error calculating gas</span>
        )}
      </div>
    </div>
  );
}

export default GasFeeCalculator;