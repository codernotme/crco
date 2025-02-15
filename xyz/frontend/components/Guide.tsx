'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, ChevronRight, Book, Shield, Wallet, ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function Guide() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showGuide ? (
        <Button
          onClick={() => setShowGuide(true)}
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="p-6 w-[400px] max-h-[80vh] overflow-y-auto card-gradient">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Bridge Guide</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuide(false)}
              className="text-white/60 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="getting-started">
              <AccordionTrigger>Getting Started</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-2 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 flex-shrink-0" />
                    Connect your MetaMask wallet
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    Ensure you have sufficient funds
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    Select source and destination chains
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fees">
              <AccordionTrigger>Understanding Fees</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm text-white/80">
                  <p>Bridge fees consist of:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Base fee (0.1%)</li>
                    <li>Gas fee (varies by network)</li>
                    <li>Network congestion fee</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security">
              <AccordionTrigger>Security Features</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm text-white/80">
                  <p>Our bridge implements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Two-factor authentication for large transfers</li>
                    <li>Multi-signature validation</li>
                    <li>Proof verification</li>
                    <li>Rate limiting</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="troubleshooting">
              <AccordionTrigger>Troubleshooting</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm text-white/80">
                  <p>Common issues and solutions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Insufficient funds: Add more tokens</li>
                    <li>Transaction pending: Wait for confirmations</li>
                    <li>Network congestion: Increase gas price</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}
    </div>
  );
}