import { SupportedChainId, GaslessChainId } from '../constants/chainID';
import { CHAIN_INFO, GASLESS_CHAIN_INFO } from '../constants/networks';

export function getRPCFromChainID(chainId: SupportedChainId | GaslessChainId, provider?: string): string {
  const chain = { ...CHAIN_INFO, ...GASLESS_CHAIN_INFO }[chainId];

  const defaultProvider = chain.defaultRpc;

  return provider ? chain.rpcs[provider] : chain.rpcs[defaultProvider];
}
