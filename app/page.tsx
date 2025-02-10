'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Cross-Chain Bridge
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transfer tokens and NFTs securely across multiple blockchains with our advanced bridge technology
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button 
              size="lg"
              onClick={() => router.push('/bridge')}
              className="glass-effect text-lg py-6 px-8 group"
            >
              Launch App
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="card-gradient p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-gray-400">Multi-signature validation and proof verification for maximum security</p>
            </div>
            <div className="card-gradient p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Fast</h3>
              <p className="text-gray-400">Quick transaction processing with real-time status updates</p>
            </div>
            <div className="card-gradient p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Multi-Chain</h3>
              <p className="text-gray-400">Support for multiple blockchain networks including Ethereum, Polygon, and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}