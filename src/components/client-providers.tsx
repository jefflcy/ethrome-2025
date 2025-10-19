"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain, http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { base, mainnet, sepolia } from "wagmi/chains";
import { embeddedWallet } from "@civic/auth-web3/wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
    },
  },
});

// Configure chains and RPC URLs.
export const supportedChains = [mainnet, sepolia] as [
  Chain,
  ...Chain[],
];

export const wagmiConfig = createConfig({
  chains: [ base ],
  transports: {
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
  },
  connectors: [
    embeddedWallet(),
  ],
});

export const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export { wagmiConfig as config };