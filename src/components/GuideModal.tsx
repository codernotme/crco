import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ArrowRight } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const steps = [
    {
      title: 'Connect Your Wallet',
      description: 'Click the "Connect Wallet" button in the top right corner to connect your MetaMask wallet.',
    },
    {
      title: 'Select Networks',
      description: 'Choose your source network (where your tokens are) and target network (where you want to bridge to).',
    },
    {
      title: 'Choose Operation',
      description: 'Select between "Lock & Mint" to bridge tokens to the target network, or "Unlock & Burn" to retrieve original tokens.',
    },
    {
      title: 'Select Token & Amount',
      description: 'Choose which token you want to bridge and enter the amount. Make sure you have enough balance and gas fees.',
    },
    {
      title: 'Confirm Transaction',
      description: 'Review the transaction details, including gas fees, and confirm in your wallet when ready.',
    },
    {
      title: 'Wait for Completion',
      description: 'The bridging process typically takes 10-30 minutes. You can track the status in the transaction history.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-100 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-dark-300 flex justify-between items-center">
              <div className="flex items-center">
                <HelpCircle className="w-6 h-6 text-neon mr-2" />
                <h2 className="text-xl font-bold">Bridge Guide</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex"
                  >
                    <div className="mr-4 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-neon text-dark flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 h-full bg-dark-300 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-dark-200 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <ArrowRight className="w-5 h-5 text-neon mr-2" />
                  Important Tips
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li>Always verify contract addresses and transaction details</li>
                  <li>Keep enough native tokens for gas fees on both networks</li>
                  <li>Don't close your browser during the bridging process</li>
                  <li>Save transaction hashes for future reference</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GuideModal;