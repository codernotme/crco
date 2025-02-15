import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, Coins, Shield, Zap, ExternalLink } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { account } = useWallet();

  const features = [
    {
      icon: <ArrowRightLeft className="w-8 h-8 text-neon" />,
      title: 'Cross-Chain Bridge',
      description: 'Transfer tokens seamlessly between different blockchain networks',
    },
    {
      icon: <Shield className="w-8 h-8 text-neon" />,
      title: 'Secure Transfers',
      description: 'Advanced security measures to protect your assets during bridging',
    },
    {
      icon: <Zap className="w-8 h-8 text-neon" />,
      title: 'Fast & Efficient',
      description: 'Quick transaction processing with optimal gas efficiency',
    },
    {
      icon: <Coins className="w-8 h-8 text-neon" />,
      title: 'Multi-Token Support',
      description: 'Support for various tokens across different networks',
    },
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
          Cross-Chain Bridge
          <span className="text-neon"> Protocol</span>
        </motion.h1>
        <p className="text-xl text-gray-400 mb-8">
          Bridge your assets securely across multiple blockchain networks
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/bridge"
            className="px-8 py-4 bg-neon text-dark font-bold rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Launch Bridge
          </Link>
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-dark-200 font-bold rounded-lg hover:bg-dark-300 transition-colors flex items-center justify-center"
          >
            Documentation
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto glassmorphism p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-neon mb-2">$1.2B+</div>
            <div className="text-gray-400">Total Value Locked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neon mb-2">2M+</div>
            <div className="text-gray-400">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neon mb-2">5+</div>
            <div className="text-gray-400">Networks Supported</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-400 mb-8">
          Start bridging your assets across networks securely and efficiently.
        </p>
        <Link
          to="/bridge"
          className="inline-block px-8 py-4 bg-neon text-dark font-bold rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Launch Bridge App
        </Link>
      </div>
    </motion.div>
  );
}

export default Home;