import { createPublicClient, defineChain, http } from 'viem';

import { env } from '../config/env.js';

const runtimeChain = defineChain({
  id: env.chainId,
  name: `chain-${env.chainId}`,
  nativeCurrency: {
    name: 'Native Token',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: { http: [env.rpcUrl] },
    public: { http: [env.rpcUrl] }
  }
});

export const publicClient = createPublicClient({
  chain: runtimeChain,
  transport: http(env.rpcUrl)
});
