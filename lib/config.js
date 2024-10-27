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
    rpcUrl:
      "https://optimism-sepolia.gateway.tenderly.co/6OIbpnczqr3Y4ilSdXVIOF",
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
      OpenBatchExecutor: "0x7a4A0e89e041a24550d644fa8387DbeaFE444A3E",
      SigmaForwarder: "0xAe8aAaF7cC380d236b8751Df76d31A46B1A15f92",
      SigmaHop: "0x21f8A88B4Ff388539641e20e67E7078Ab3F61C07",
      SigmaProxyFactory: "0xb5A021AD9d77ca0bb8B1610ab5A3Ae7428B32eB2",
      SigmaUSDCVault: "0x9d45cd42575A9B2E359D6f32Af3Acb642A472756",
      USDCToken: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    },
  },
  {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://base-sepolia.gateway.tenderly.co/1LSwOzY43Ez2ZYqBL6U0xZ",
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
      OpenBatchExecutor: "0x7a4A0e89e041a24550d644fa8387DbeaFE444A3E",
      SigmaForwarder: "0xAe8aAaF7cC380d236b8751Df76d31A46B1A15f92",
      SigmaHop: "0x21f8A88B4Ff388539641e20e67E7078Ab3F61C07",
      SigmaProxyFactory: "0xb5A021AD9d77ca0bb8B1610ab5A3Ae7428B32eB2",
      SigmaUSDCVault: "0x9d45cd42575A9B2E359D6f32Af3Acb642A472756",
      USDCToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    },
  },
  {
    name: "Avalanche Fuji",
    chainId: 43113,
    rpcUrl: "https://avalanche-fuji.gateway.tenderly.co/5sTJEI6WWkRNhlcIBKcVhX",
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
      OpenBatchExecutor: "0x7a4A0e89e041a24550d644fa8387DbeaFE444A3E",
      SigmaForwarder: "0xAe8aAaF7cC380d236b8751Df76d31A46B1A15f92",
      SigmaHop: "0x21f8A88B4Ff388539641e20e67E7078Ab3F61C07",
      SigmaProxyFactory: "0xb5A021AD9d77ca0bb8B1610ab5A3Ae7428B32eB2",
      SigmaUSDCVault: "0x9d45cd42575A9B2E359D6f32Af3Acb642A472756",
      USDCToken: "0x5425890298aed601595a70ab815c96711a31bc65",
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
