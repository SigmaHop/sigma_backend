import express from "express";
import { getChain } from "../utils/helper.js";
import { abis } from "../lib/config.js";
import {
  getMultiToSingleTransferEstimates,
  getSingleToMultiTransferEstimates,
  getTransferLocalEstimates,
} from "../utils/estimate.js";
import { ethers } from "ethers";
const router = express.Router();

router.get("/signer", async (req, res) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/avalanche_fuji"
    );

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    res.json({
      success: true,
      address: signer.address,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/local/:chainId", async (req, res) => {
  try {
    const { chainId } = req.params;

    const { SigmaUSDCVault, from, to, amount, deadline, signature } = req.body;

    if (
      !SigmaUSDCVault ||
      !from ||
      !to ||
      !amount ||
      !deadline ||
      !signature ||
      !chainId
    ) {
      throw new Error("Missing parameters");
    }

    const currentChain = getChain(chainId);

    const provider = new ethers.providers.JsonRpcProvider(currentChain.rpcUrl);

    const feeData = await provider.getFeeData();
    const baseFee = feeData.lastBaseFeePerGas;

    const maxPriorityFeePerGas = ethers.BigNumber.from(1); // 1 wei minimum required tip
    const maxFeePerGas = baseFee.add(maxPriorityFeePerGas); // base fee + minimum tip

    const isDeployed = await provider.getCode(SigmaUSDCVault);

    const SigmaForwarder = new ethers.Contract(
      currentChain.deployments.SigmaForwarder,
      abis.SigmaForwarder,
      provider
    );

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const {
      gasEstimate,
      gasPrice,
      ethGas,
      baseGas,
      estimateFees,
    } = await getTransferLocalEstimates(
      currentChain,
      SigmaUSDCVault,
      from,
      to,
      amount,
      deadline,
      signature
    );

    let unsignedTx;

    if (isDeployed !== "0x") {
      const data = SigmaForwarder.interface.encodeFunctionData(
        "tranferTokensLocal",
        [
          SigmaUSDCVault,
          from,
          to,
          amount,
          deadline,
          signature,
          gasPrice.toFixed(0),
          (Number(gasEstimate) + Number(baseGas)).toString(),
        ]
      );

      unsignedTx = {
        to: currentChain.deployments.SigmaForwarder,
        data: data,
        value: 0,
        gasLimit: 4000000,
        maxFeePerGas: Number(chainId) === 84532 ? null : maxFeePerGas,
        maxPriorityFeePerGas:
          Number(chainId) === 84532 ? null : maxPriorityFeePerGas,
        type: 2,
      };
    } else {
      const OpenBatchExecutor = new ethers.Contract(
        currentChain.deployments.OpenBatchExecutor,
        abis.OpenBatchExecutor,
        provider
      );

      const SigmaProxyFactory = new ethers.Contract(
        currentChain.deployments.SigmaProxyFactory,
        abis.SigmaProxyFactory,
        provider
      );

      const deployData = SigmaProxyFactory.interface.encodeFunctionData(
        "createProxy",
        [from]
      );

      const transferData = SigmaForwarder.interface.encodeFunctionData(
        "tranferTokensLocal",
        [
          SigmaUSDCVault,
          from,
          to,
          amount,
          deadline,
          signature,
          gasPrice.toFixed(0),
          (Number(gasEstimate) + Number(baseGas)).toString(),
        ]
      );

      const transactions = [
        {
          to: currentChain.deployments.SigmaProxyFactory,
          data: deployData,
          value: 0,
        },
        {
          to: currentChain.deployments.SigmaForwarder,
          data: transferData,
          value: 0,
        },
      ];

      const txData = OpenBatchExecutor.interface.encodeFunctionData(
        "executeBatch",
        [transactions]
      );

      unsignedTx = {
        to: currentChain.deployments.OpenBatchExecutor,
        data: txData,
        value: 0,
        gasLimit: 4000000,
        maxFeePerGas: Number(chainId) === 84532 ? null : maxFeePerGas,
        maxPriorityFeePerGas:
          Number(chainId) === 84532 ? null : maxPriorityFeePerGas,
        type: 2,
      };
    }

    const willSuceed = await signer.estimateGas(unsignedTx);

    if (!willSuceed) {
      throw new Error("Transaction will fail");
    }

    const transaction = await signer.sendTransaction(unsignedTx);

    await transaction.wait();

    res.json({
      success: true,
      message: "Transfer successful",
      transactionHash: transaction.hash,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/singleToMulti/:chainId", async (req, res) => {
  try {
    const { chainId } = req.params;

    const {
      SigmaUSDCVault,
      sigmaHop,
      from,
      tos,
      amounts,
      destchains,
      deadline,
      signature,
    } = req.body;

    if (
      !SigmaUSDCVault ||
      !sigmaHop ||
      !from ||
      !tos ||
      !amounts ||
      !destchains ||
      !deadline ||
      !signature ||
      !chainId
    ) {
      throw new Error("Missing parameters");
    }

    const currentChain = getChain(chainId);

    const provider = new ethers.providers.JsonRpcProvider(currentChain.rpcUrl);

    const feeData = await provider.getFeeData();
    const baseFee = feeData.lastBaseFeePerGas;

    const maxPriorityFeePerGas = ethers.BigNumber.from(1); // 1 wei minimum required tip
    const maxFeePerGas = baseFee.add(maxPriorityFeePerGas); // base fee + minimum tip

    const isDeployed = await provider.getCode(SigmaUSDCVault);

    const SigmaForwarder = new ethers.Contract(
      currentChain.deployments.SigmaForwarder,
      abis.SigmaForwarder,
      provider
    );

    const {
      gasEstimate,
      gasPrice,
      ethGas,
      baseGas,
      estimateFees,
      hopFees,
      hopUSDCFees,
    } = await getSingleToMultiTransferEstimates(
      currentChain,
      SigmaUSDCVault,
      sigmaHop,
      from,
      tos,
      amounts,
      destchains,
      deadline,
      signature
    );

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    let unsignedTx;

    if (isDeployed !== "0x") {
      const data = SigmaForwarder.interface.encodeFunctionData(
        "singleToMultiTransferToken",
        [
          SigmaUSDCVault,
          sigmaHop,
          from,
          tos,
          amounts,
          destchains,
          deadline,
          signature,
          gasPrice.toFixed(0),
          (Number(gasEstimate) + Number(baseGas)).toString(),
          hopUSDCFees.toFixed(0),
        ]
      );

      unsignedTx = {
        to: currentChain.deployments.SigmaForwarder,
        data: data,
        value: hopFees.toFixed(0),
        gasLimit: 4000000,
        maxFeePerGas: Number(chainId) === 84532 ? null : maxFeePerGas,
        maxPriorityFeePerGas:
          Number(chainId) === 84532 ? null : maxPriorityFeePerGas,
        type: 2,
      };
    } else {
      const OpenBatchExecutor = new ethers.Contract(
        currentChain.deployments.OpenBatchExecutor,
        abis.OpenBatchExecutor,
        provider
      );

      const SigmaProxyFactory = new ethers.Contract(
        currentChain.deployments.SigmaProxyFactory,
        abis.SigmaProxyFactory,
        provider
      );

      const deployData = SigmaProxyFactory.interface.encodeFunctionData(
        "createProxy",
        [from]
      );

      const transferData = SigmaForwarder.interface.encodeFunctionData(
        "singleToMultiTransferToken",
        [
          SigmaUSDCVault,
          sigmaHop,
          from,
          tos,
          amounts,
          destchains,
          deadline,
          signature,
          gasPrice.toFixed(0),
          (Number(gasEstimate) + Number(baseGas)).toString(),
          hopUSDCFees.toFixed(0),
        ]
      );

      const transactions = [
        {
          to: currentChain.deployments.SigmaProxyFactory,
          data: deployData,
          value: 0,
        },
        {
          to: currentChain.deployments.SigmaForwarder,
          data: transferData,
          value: hopFees.toFixed(0),
        },
      ];

      const txData = OpenBatchExecutor.interface.encodeFunctionData(
        "executeBatch",
        [transactions]
      );

      unsignedTx = {
        to: currentChain.deployments.OpenBatchExecutor,
        data: txData,
        value: hopFees.toFixed(0),
        gasLimit: 4000000,
        maxFeePerGas: Number(chainId) === 84532 ? null : maxFeePerGas,
        maxPriorityFeePerGas:
          Number(chainId) === 84532 ? null : maxPriorityFeePerGas,
        type: 2,
      };
    }

    const willSuceed = await signer.estimateGas(unsignedTx);

    if (!willSuceed) {
      throw new Error("Transaction will fail");
    }

    const transaction = await signer.sendTransaction(unsignedTx);

    await transaction.wait();

    res.json({
      success: true,
      message: "Transfer successful",
      transactionHash: transaction.hash,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/multiToSingle/:chainId", async (req, res) => {
  try {
    const { chainId } = req.params;

    const {
      SigmaUSDCVault,
      SigmaHop,
      from,
      to,
      amounts,
      srcChains,
      destChain,
      nonces,
      deadline,
      signature,
    } = req.body;

    if (
      !SigmaUSDCVault ||
      !SigmaHop ||
      !from ||
      !to ||
      !amounts ||
      !srcChains ||
      !destChain ||
      !nonces ||
      !deadline ||
      !signature ||
      !chainId
    ) {
      throw new Error("Missing parameters");
    }

    const currentChain = getChain(chainId);

    const provider = new ethers.providers.JsonRpcProvider(currentChain.rpcUrl);

    const feeData = await provider.getFeeData();
    const baseFee = feeData.lastBaseFeePerGas;

    const maxPriorityFeePerGas = ethers.BigNumber.from(1); // 1 wei minimum required tip
    const maxFeePerGas = baseFee.add(maxPriorityFeePerGas); // base fee + minimum tip

    const isDeployed = await provider.getCode(SigmaUSDCVault);

    const {
      gasEstimate,
      gasPrice,
      ethGas,
      baseGas,
      estimateFees,
      hopFees,
      hopUSDCFees,
    } = await getMultiToSingleTransferEstimates(
      currentChain,
      SigmaUSDCVault,
      SigmaHop,
      from,
      to,
      amounts,
      srcChains,
      destChain,
      nonces,
      deadline,
      signature
    );

    let unsignedTx;

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const SigmaForwarder = new ethers.Contract(
      currentChain.deployments.SigmaForwarder,
      abis.SigmaForwarder,
      provider
    );

    if (isDeployed !== "0x") {
      const data = SigmaForwarder.interface.encodeFunctionData(
        "multiToSingleTransferToken",
        [
          SigmaUSDCVault,
          SigmaHop,
          from,
          to,
          amounts,
          srcChains,
          destChain,
          nonces,
          deadline,
          signature,
          gasPrice.toFixed(0),
          (Number(gasEstimate) + Number(baseGas)).toString(),
          hopUSDCFees.toFixed(0),
        ]
      );

      unsignedTx = {
        to: currentChain.deployments.SigmaForwarder,
        data: data,
        value: hopFees.toFixed(0),
        gasLimit: 4000000,
        maxFeePerGas: Number(chainId) === 84532 ? null : maxFeePerGas,
        maxPriorityFeePerGas:
          Number(chainId) === 84532 ? null : maxPriorityFeePerGas,
        type: 2,
      };
    } else {
      const OpenBatchExecutor = new ethers.Contract(
        currentChain.deployments.OpenBatchExecutor,
        abis.OpenBatchExecutor,
        provider
      );

      const SigmaProxyFactory = new ethers.Contract(
        currentChain.deployments.SigmaProxyFactory,
        abis.SigmaProxyFactory,
        provider
      );

      const deployData = SigmaProxyFactory.interface.encodeFunctionData(
        "createProxy",
        [from]
      );

      const transferData = SigmaForwarder.interface.encodeFunctionData(
        "multiToSingleTransferToken",
        [
          SigmaUSDCVault,
          SigmaHop,
          from,
          to,
          amounts,
          srcChains,
          destChain,
          nonces,
          deadline,
          signature,
          gasPrice.toFixed(0),
          (Number(gasEstimate) + Number(baseGas)).toString(),
          hopUSDCFees.toFixed(0),
        ]
      );

      const transactions = [
        {
          to: currentChain.deployments.SigmaProxyFactory,
          data: deployData,
          value: 0,
        },
        {
          to: currentChain.deployments.SigmaForwarder,
          data: transferData,
          value: hopFees.toFixed(0),
        },
      ];

      const txData = OpenBatchExecutor.interface.encodeFunctionData(
        "executeBatch",
        [transactions]
      );

      unsignedTx = {
        to: currentChain.deployments.OpenBatchExecutor,
        data: txData,
        value: hopFees.toFixed(0),
        gasLimit: 4000000,
        maxFeePerGas: Number(chainId) === 84532 ? null : maxFeePerGas,
        maxPriorityFeePerGas:
          Number(chainId) === 84532 ? null : maxPriorityFeePerGas,
        type: 2,
      };
    }

    const willSuceed = await signer.estimateGas(unsignedTx);

    if (!willSuceed) {
      throw new Error("Transaction will fail");
    }

    const transaction = await signer.sendTransaction(unsignedTx);

    await transaction.wait();

    res.json({
      success: true,
      message: "Transfer successful",
      transactionHash: transaction.hash,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
