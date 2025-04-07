import Main from "./pages/main"

import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'IREC',
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains: [sepolia],
});

const queryClient = new QueryClient();

function App() {

  return (
    <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <Main />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
  )
}

export default App
