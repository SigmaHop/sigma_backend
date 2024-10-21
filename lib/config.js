import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const OpenBatchExecutorABI = require("./contracts/OpenBatchExecutor.json");
const SigmaForwarderABI = require("./contracts/SigmaForwarder.json");
const SigmaHopABI = require("./contracts/SigmaHop.json");
const SigmaProxyFactoryABI = require("./contracts/SigmaProxyFactory.json");
const SigmaUSDCVaultABI = require("./contracts/SigmaUSDCVault.json");
const IERC20ABI = require("./contracts/IERC20.json");

const chains = [
  {
    name: "Optimism Sepolia",
    chainId: 11155420,
    rpcUrl: "https://sepolia.optimism.io",
    explorerURL: "https://sepolia-optimism.etherscan.io",
    converstionId: 1027,
    usdcId: 3408,
    wormhole: {
      chainId: 10005,
    },
    utils: {
      baseGas: 0,
      cautionGas: 15000,
    },
    deployments: {
      OpenBatchExecutor: "",
      SigmaForwarder: "",
      SigmaHop: "",
      SigmaProxyFactory: "",
      SigmaUSDCVault: "",
      USDCToken: "",
    },
  },
  {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    explorerURL: "https://sepolia.basescan.org",
    converstionId: 1027,
    usdcId: 3408,
    wormhole: {
      chainId: 10004,
    },
    utils: {
      baseGas: 0,
      cautionGas: 15000,
    },
    deployments: {
      OpenBatchExecutor: "",
      SigmaForwarder: "",
      SigmaHop: "",
      SigmaProxyFactory: "",
      SigmaUSDCVault: "",
      USDCToken: "",
    },
  },
  {
    name: "Avalanche Fuji",
    chainId: 43113,
    rpcUrl: "https://rpc.ankr.com/avalanche_fuji",
    explorerURL: "https://testnet.snowtrace.dev",
    converstionId: 5805,
    usdcId: 3408,
    wormhole: {
      chainId: 6,
    },
    utils: {
      baseGas: 0,
      cautionGas: 15000,
    },
    deployments: {
      OpenBatchExecutor: "",
      SigmaForwarder: "",
      SigmaHop: "",
      SigmaProxyFactory: "",
      SigmaUSDCVault: "",
      USDCToken: "",
    },
  },
];

const abis = {
  OpenBatchExecutor: OpenBatchExecutorABI,
  SigmaForwarder: SigmaForwarderABI,
  SigmaHop: SigmaHopABI,
  SigmaProxyFactory: SigmaProxyFactoryABI,
  SigmaUSDCVault: SigmaUSDCVaultABI,
  IERC20: IERC20ABI,
};

export { chains, abis };
