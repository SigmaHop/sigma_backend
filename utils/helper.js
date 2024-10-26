import { chains } from "../lib/config.js";

const getChain = (chainId) => {
  const currentChain = chains.find(
    (chain) => chain.chainId === Number(chainId)
  );

  if (!currentChain) {
    throw new Error("Chain not found");
  }

  return currentChain;
};

const getWormholeChain = (wormholeChainId) => {
  const currentChain = chains.find(
    (chain) => chain.wormhole.chainId === Number(wormholeChainId)
  );

  if (!currentChain) {
    throw new Error("Chain not found");
  }

  return currentChain;
};

export { getChain, getWormholeChain };
