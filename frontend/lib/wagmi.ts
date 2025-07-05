import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia, zkSyncSepoliaTestnet,  } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ZKDetect',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [mainnet, polygon, sepolia,zkSyncSepoliaTestnet],
  ssr: true,
});