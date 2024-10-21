import express from "express";
import {
  getMultiToSingleTransferEstimates,
  getSingleToMultiTransferEstimates,
  getTransferLocalEstimates,
} from "../utils/estimate.js";
import { getChain } from "../utils/helper.js";
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

    res.json({
      success: true,
      gasEstimate,
      gasPrice,
      ethGas,
      baseGas,
      estimateFees,
    });
  } catch (error) {
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

    const {
      gasEstimate,
      gasPrice,
      ethGas,
      baseGas,
      estimateFees,
      hopFees,
      hopUSDCFees,
    } = getSingleToMultiTransferEstimates(
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

    res.json({
      success: true,
      gasEstimate,
      gasPrice,
      ethGas,
      baseGas,
      estimateFees,
      hopFees,
      hopUSDCFees,
    });
  } catch (error) {
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

    res.json({
      success: true,
      gasEstimate,
      gasPrice,
      ethGas,
      baseGas,
      estimateFees,
      hopFees,
      hopUSDCFees,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
