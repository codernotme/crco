import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';

export class GaslessForwarder {
  private provider: ethers.providers.JsonRpcProvider;
  private gelatoApiKey: string;
  private biconomyApiKey: string;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.gelatoApiKey = import.meta.env.VITE_GELATO_API_KEY;
    this.biconomyApiKey = import.meta.env.VITE_BICONOMY_API_KEY;
  }

  async forwardTransaction(
    from: string,
    to: string,
    data: string,
    value: string = '0'
  ) {
    // Create the forwarded transaction
    const nonce = await this.getNonce(from);
    const chainId = await this.provider.getNetwork().then(n => n.chainId);
    
    const forwardRequest = {
      from,
      to,
      value,
      gas: '500000', // Estimated gas
      nonce: nonce.toString(),
      data,
      validUntil: Math.floor(Date.now() / 1000) + 3600, // 1 hour validity
    };

    // Sign the request
    const signature = await this.signRequest(forwardRequest);

    // Submit to relayer network
    return this.submitToRelayer(forwardRequest, signature);
  }

  private async getNonce(address: string): Promise<number> {
    const client = createPublicClient({
      transport: http(this.provider.connection.url)
    });
    
    return client.getTransactionCount({
      address: address as `0x${string}`
    });
  }

  private async signRequest(request: any): Promise<string> {
    const message = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes', 'uint256'],
      [
        request.from,
        request.to,
        request.value,
        request.gas,
        request.nonce,
        request.data,
        request.validUntil
      ]
    );

    return ethers.utils.joinSignature(
      ethers.utils.splitSignature(
        await this.provider.getSigner().signMessage(ethers.utils.arrayify(message))
      )
    );
  }

  private async submitToRelayer(request: any, signature: string) {
    // Try Gelato first
    try {
      const gelatoResponse = await this.submitToGelato(request, signature);
      return gelatoResponse;
    } catch (error) {
      console.warn('Gelato relay failed, trying Biconomy:', error);
      
      // Fallback to Biconomy
      const biconomyResponse = await this.submitToBiconomy(request, signature);
      return biconomyResponse;
    }
  }

  private async submitToGelato(request: any, signature: string) {
    const response = await fetch('https://relay.gelato.network/relays/v2/sponsored-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.gelatoApiKey}`
      },
      body: JSON.stringify({
        chainId: await this.provider.getNetwork().then(n => n.chainId),
        target: request.to,
        data: request.data,
        user: request.from,
        signature
      })
    });

    if (!response.ok) {
      throw new Error(`Gelato relay failed: ${await response.text()}`);
    }

    return response.json();
  }

  private async submitToBiconomy(request: any, signature: string) {
    const response = await fetch('https://api.biconomy.io/api/v2/meta-tx/native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.biconomyApiKey
      },
      body: JSON.stringify({
        from: request.from,
        to: request.to,
        data: request.data,
        signatureType: 'EIP712_SIGN',
        signature
      })
    });

    if (!response.ok) {
      throw new Error(`Biconomy relay failed: ${await response.text()}`);
    }

    return response.json();
  }
}