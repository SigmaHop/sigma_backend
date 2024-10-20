import { ethers } from "ethers";
import { abis } from "../lib/config.js";
import { ethToErc20 } from "./convert.js";

const getTransferLocalEstimates = async (
  currentChain,

  SigmaUSDCVault,
  from,
  to,
  amount,
  deadline,
  signature
) => {
  const provider = new ethers.providers.JsonRpcProvider(currentChain.rpcUrl);

  const SigmaForwarder = new ethers.Contract(
    currentChain.deployments.SigmaForwarder,
    abis.SigmaForwarder,
    provider
  );

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const isDeployed = await provider.getCode(SigmaUSDCVault);

  let transaction;

  if (isDeployed === "0x") {
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
      [SigmaUSDCVault, from, to, amount, deadline, signature, "0", "0"]
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

    transaction = {
      to: currentChain.deployments.OpenBatchExecutor,
      data: txData,
      value: 0,
      gasLimit: 2000000,
    };
  } else {
    const data = SigmaForwarder.interface.encodeFunctionData("transferLocal", [
      SigmaUSDCVault,
      from,
      to,
      amount,
      deadline,
      signature,
      "0",
      "0",
    ]);

    transaction = {
      to: currentChain.deployments.SigmaForwarder,
      data,
      value: 0,
      gasLimit: 2000000,
    };
  }

  const gasEstimate = Number(await signer.estimateGas(transaction));

  const ethGas = Number(await provider.getGasPrice());
  const gasPrice = Number(
    await ethToErc20(currentChain.converstionId, currentChain.usdcId, ethGas)
  );
  const baseGas = currentChain.utils.baseGas;
  const estimateFees = (
    (gasEstimate + baseGas + currentChain.utils.cautionGas) *
    gasPrice
  ).toFixed(0);

  return {
    gasEstimate,
    gasPrice,
    ethGas,
    baseGas,
    estimateFees,
  };
};

export { getTransferLocalEstimates };
