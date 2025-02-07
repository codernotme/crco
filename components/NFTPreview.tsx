'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useSpring, animated } from 'react-spring';
import { Skeleton } from '@/components/ui/skeleton';
import { ethers } from 'ethers';

interface NFTPreviewProps {
  tokenId: string;
  chainId: string;
  contractAddress: string;
}

export function NFTPreview({ tokenId, chainId, contractAddress }: NFTPreviewProps) {
  const [metadata, setMetadata] = useState<{
    name: string;
    description: string;
    image: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [props, api] = useSpring(() => ({
    rotateY: 0,
    scale: 1,
    config: { mass: 5, tension: 350, friction: 40 }
  }));

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const contract = new ethers.Contract(
          contractAddress,
          ['function tokenURI(uint256) view returns (string)'],
          new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
        );

        const tokenURI = await contract.tokenURI(tokenId);
        const response = await fetch(tokenURI);
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error('Failed to fetch NFT metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenId, chainId, contractAddress]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 20;
    const rotateX = ((y - centerY) / centerY) * -20;

    api.start({
      rotateX,
      rotateY,
      scale: 1.1,
    });
  };

  const handleMouseLeave = () => {
    api.start({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
    });
  };

  if (loading) {
    return (
      <Card className="w-full aspect-square">
        <Skeleton className="w-full h-full rounded-lg" />
      </Card>
    );
  }

  if (!metadata) {
    return (
      <Card className="w-full aspect-square flex items-center justify-center">
        <p className="text-white/60">Failed to load NFT</p>
      </Card>
    );
  }

  return (
    <animated.div
      style={{
        ...props,
        transform: props.rotateY.to(
          (y) => `perspective(1000px) rotateY(${y}deg) scale(${props.scale})`
        ),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full cursor-pointer"
    >
      <Card className="overflow-hidden">
        <div className="aspect-square relative">
          <img
            src={metadata.image}
            alt={metadata.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-lg font-bold text-white">{metadata.name}</h3>
            <p className="text-sm text-white/80">{metadata.description}</p>
          </div>
        </div>
      </Card>
    </animated.div>
  );
}