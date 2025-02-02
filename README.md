# CrCo Bridge - Cross-Chain Token Bridge

A secure and efficient cross-chain bridge for transferring tokens and NFTs between different blockchain networks.

[Site Demo](https://crco-bice.vercel.app/)

## Features

- 🔄 Cross-chain token transfers
- 🖼️ NFT bridging support
- 🔒 Secure proof verification
- 🌐 Multi-chain support
- 👛 Multiple wallet support
- 📱 Responsive design
- ⚡ Real-time transaction tracking
- 🔍 Transaction proof verification

## Prerequisites

### Development Environment
- Node.js (v16.x or higher)
- npm (v8.x or higher)
- Git
- bun

### Blockchain Networks
- Access to Amoy Testnet
- Access to Sepolia Testnet
- MetaMask wallet installed

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Network RPC URLs
AMOY_RPC_URL=https://testnet.amoy.xyz/rpc
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Contract Deployment
PRIVATE_KEY=your_private_key_here

# Token Addresses (after deployment)
NEXT_PUBLIC_AMOY_TOKEN_ADDRESS=your_amoy_token_address
NEXT_PUBLIC_SEPOLIA_TOKEN_ADDRESS=your_sepolia_token_address

# Bridge Addresses (after deployment)
NEXT_PUBLIC_AMOY_BRIDGE_ADDRESS=your_amoy_bridge_address
NEXT_PUBLIC_SEPOLIA_BRIDGE_ADDRESS=your_sepolia_bridge_address
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/codernotme/crco
cd crco
```

2. Install dependencies:
```bash
npm install --force
```
or
```bash
bun i
```

3. Set up environment variables as described above.

## Local Development with Docker

### Build and run
```bash
docker-compose up --build
```

### Stop services
```bash
docker-compose down
```

## Manual Docker Build

### Build image
```bash
docker build -t crco .
```

### Run container
```bash
docker run -p 3000:3000 crco
```

## Smart Contract Deployment

1. Deploy to Amoy Testnet:
```bash
npm run deploy:amoy
```

2. Deploy to Sepolia:
```bash
npm run deploy:sepolia
```

3. Update the contract addresses in your `.env` file and `config/chains.ts`.

## Development

Start the development server:
```bash
npm run dev
```
or
```bash
bun run dev
```

## Testing

Run the test suite:
```bash
npm run test
```

## Build

Create a production build:
```bash
npm run build
```
or
```bash
bun run build
```

## Project Structure

```
crco/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # UI components
│   ├── AssetSelector.tsx # Asset selection component
│   ├── NetworkStatus.tsx # Network status component
│   └── ...
├── contracts/            # Smart contracts
│   ├── CrCoBridge.sol    # Bridge contract
│   └── CrCoToken.sol     # Token contract
├── config/               # Configuration files
├── hooks/                # Custom React hooks
├── public/              # Static assets
├── scripts/             # Deployment scripts
├── styles/             # Global styles
└── types/              # TypeScript types
```

## Smart Contracts

### CrCoToken (ERC20/ERC721)
- Standard ERC20/ERC721 implementation
- Minting and burning capabilities
- Role-based access control

### CrCoBridge
- Cross-chain transfer initiation
- Proof verification
- Asset locking and unlocking
- NFT support
- Security features:
  - Reentrancy protection
  - Access control
  - Proof verification
  - Transaction receipts


## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details