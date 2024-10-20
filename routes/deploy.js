import express from "express";
import { getChain } from "../utils/helper.js";
import { ethers } from "ethers";
const router = express.Router();
import { abis } from "../lib/config.js";

router.post("/:address/:chainId", async (req, res) => {
  try {
    const { address, chainId } = req.params;

    if (!address || !chainId) {
      throw new Error("Missing parameters");
    }

    const currentChain = getChain(req.params.chainId);
    const provider = new ethers.providers.JsonRpcProvider(currentChain.rpcUrl);

    const SigmaProxyFactory = new ethers.Contract(
      currentChain.deployments.SigmaProxyFactory,
      abis.SigmaProxyFactory,
      new ethers.providers.JsonRpcProvider(currentChain.rpcUrl)
    );

    const deployedAddress = await SigmaProxyFactory.getSigmaProxy(address);

    const isContract = await provider.getCode(deployedAddress);

    if (isContract !== "0x") {
      res.json({
        success: false,
        message: "Contract already deployed",
        address: deployedAddress,
      });
    }

    const data = SigmaProxyFactory.interface.encodeFunctionData("createProxy", [
      address,
    ]);

    const gasPrice = await provider.getGasPrice();

    const tx = {
      to: currentChain.deployments.SigmaProxyFactory,
      data,
      value: 0,
      gasLimit: 2000000,
      gasPrice: gasPrice,
    };

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const willSuceed = await signer.estimateGas(tx);

    if (!willSuceed) {
      throw new Error("Transaction will fail");
    }

    const transaction = await signer.sendTransaction(tx);

    await transaction.wait();

    res.json({
      success: true,
      message: "Contract deployed successfully",
      address: deployedAddress,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
