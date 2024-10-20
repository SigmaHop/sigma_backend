import express from "express";
import { getChain } from "../utils/helper.js";
import { abis } from "../lib/config.js";
import { getTransferLocalEstimates } from "../utils/estimate.js";
import { ethers } from "ethers";
const router = express.Router();

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
        gasLimit: 2000000,
        gasPrice: gasPrice,
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
        gasLimit: 2000000,
        gasPrice: gasPrice,
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
