'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TwoFactorAuthProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => void;
}

export function TwoFactorAuth({
  open,
  onOpenChange,
  onVerify,
}: TwoFactorAuthProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    onVerify(code);
    setCode('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-effect">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to your email to verify this high-value
            transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            className="glass-effect"
            maxLength={6}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleVerify} className="w-full">
            Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
