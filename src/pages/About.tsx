import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Wallet,
  ArrowRightLeft,
  Coins,
  Server,
  Lock,
  Users
} from 'lucide-react';

function About() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-neon" />,
      title: 'Secure Bridge Protocol',
      description: 'Multi-layered security with smart contract audits, multi-sig validation, and fraud prevention mechanisms.'
    },
    {
      icon: <Zap className="w-8 h-8 text-neon" />,
      title: 'ERC-4337 Account Abstraction',
      description: 'Gasless transactions and enhanced UX through account abstraction, making bridging more accessible.'
    },
    {
      icon: <ArrowRightLeft className="w-8 h-8 text-neon" />,
      title: 'Cross-Chain Interoperability',
      description: 'Seamless asset transfer between multiple blockchain networks with atomic swaps and guaranteed finality.'
    },
    {
      icon: <Coins className="w-8 h-8 text-neon" />,
      title: 'Multi-Token Support',
      description: 'Bridge ERC20, ERC721 (NFTs), and native tokens with automated verification and proof generation.'
    },
    {
      icon: <Server className="w-8 h-8 text-neon" />,
      title: 'Decentralized Architecture',
      description: 'Distributed validator network ensures no single point of failure and enhanced security.'
    },
    {
      icon: <Lock className="w-8 h-8 text-neon" />,
      title: 'Advanced Security Features',
      description: 'Timelock mechanisms, fraud proofs, and emergency pause functionality for maximum asset protection.'
    },
    {
      icon: <Wallet className="w-8 h-8 text-neon" />,
      title: 'Gasless Transactions',
      description: 'Meta-transactions and gas abstraction for a seamless user experience across chains.'
    },
    {
      icon: <Users className="w-8 h-8 text-neon" />,
      title: 'Community Governance',
      description: 'Decentralized decision-making for protocol upgrades and parameter adjustments.'
    }
  ];

  const technicalSpecs = [
    'ERC-4337 Account Abstraction',
    'Multi-chain Smart Contract Architecture',
    'Automated Cross-chain Message Verification',
    'Decentralized Validator Network',
    'Gas Optimization Mechanisms',
    'Real-time Transaction Monitoring',
    'Advanced Security Protocols',
    'Cross-chain NFT Bridge Support'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl sm:text-6xl font-bold mb-6"
        >
          About <span className="text-neon">CrCo Bridge</span>
        </motion.h1>
        <p className="text-xl text-gray-400 mb-8">
          A next-generation cross-chain bridge protocol with enhanced security and user experience
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphism p-6"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Technical Specifications</h2>
        <div className="glassmorphism p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalSpecs.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 bg-neon rounded-full" />
                <span>{spec}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Measures */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Security Measures</h2>
        <div className="glassmorphism p-8">
          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-neon mt-1" />
              <div>
                <h3 className="font-bold mb-1">Multi-layer Security Protocol</h3>
                <p className="text-gray-400">Multiple validation layers and security checks for each transaction</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-neon mt-1" />
              <div>
                <h3 className="font-bold mb-1">Timelock Mechanisms</h3>
                <p className="text-gray-400">Delayed execution for high-value transactions with cancellation options</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Server className="w-6 h-6 text-neon mt-1" />
              <div>
                <h3 className="font-bold mb-1">Decentralized Validation</h3>
                <p className="text-gray-400">Network of independent validators ensuring transaction authenticity</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Bridging?</h2>
        <p className="text-gray-400 mb-8">
          Experience the next generation of cross-chain asset transfers with CrCo Bridge.
        </p>
        <a
          href="/bridge"
          className="inline-block px-8 py-4 bg-neon text-dark font-bold rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Launch Bridge App
        </a>
      </div>
    </motion.div>
  );
}

export default About;