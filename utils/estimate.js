import { ethers } from "ethers";
import { abis } from "../lib/config.js";
import { ethToErc20 } from "./convert.js";
import { getChain } from "./helper.js";

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

const getSingleToMultiTransferEstimates = async (
  currentChain,
  SigmaUSDCVault,
  sigmaHop,
  from,
  tos,
  amounts,
  destchains,
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

  let totalHopFees = 0;

  await Promise.all(
    destchains.forEach(async (chainId) => {
      if (chainId === currentChain.wormhole.chainId) return;

      const chain = getChain(chainId);

      const SigmaHopContract = new ethers.Contract(
        sigmaHop,
        abis.SigmaHop,
        provider
      );

      const hopFees = Number(
        await SigmaHopContract.quoteCrossChainDeposit(chain.wormhole.chainId)
      );

      totalHopFees += hopFees;
    })
  );

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
        "0",
        "0",
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
        value: totalHopFees.toFixed(0),
      },
    ];

    const txData = OpenBatchExecutor.interface.encodeFunctionData(
      "executeBatch",
      [transactions]
    );

    transaction = {
      to: currentChain.deployments.OpenBatchExecutor,
      data: txData,
      value: totalHopFees.toFixed(0),
      gasLimit: 2000000,
    };
  } else {
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
        "0",
        "0",
      ]
    );

    transaction = {
      to: currentChain.deployments.SigmaForwarder,
      data,
      value: totalHopFees.toFixed(0),
      gasLimit: 2000000,
    };
  }

  const gasEstimate = Number(await signer.estimateGas(transaction));

  const ethGas = Number(await provider.getGasPrice());
  const gasPrice = Number(
    await ethToErc20(currentChain.converstionId, currentChain.usdcId, ethGas)
  );

  const hopUSDCFees = Number(
    await ethToErc20(
      currentChain.converstionId,
      currentChain.usdcId,
      totalHopFees
    )
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
    hopFees: totalHopFees,
    hopUSDCFees,
  };
};

const getMultiToSingleTransferEstimates = async (
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
) => {
  const provider = new ethers.providers.JsonRpcProvider(currentChain.rpcUrl);

  const SigmaForwarder = new ethers.Contract(
    currentChain.deployments.SigmaForwarder,
    abis.SigmaForwarder,
    provider
  );

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const isDeployed = await provider.getCode(SigmaUSDCVault);

  let hopFees = 0;

  if (destChain !== currentChain.wormhole.chainId) {
    const SigmaHopContract = new ethers.Contract(
      SigmaHop,
      abis.SigmaHop,
      provider
    );

    hopFees = Number(await SigmaHopContract.quoteCrossChainDeposit(destChain));
  }

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
        "0",
        "0",
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

    transaction = {
      to: currentChain.deployments.OpenBatchExecutor,
      data: txData,
      value: hopFees.toFixed(0),
      gasLimit: 2000000,
    };
  } else {
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
        "0",
        "0",
      ]
    );

    transaction = {
      to: currentChain.deployments.SigmaForwarder,
      data,
      value: hopFees.toFixed(0),
      gasLimit: 2000000,
    };
  }

  const gasEstimate = Number(await signer.estimateGas(transaction));

  const ethGas = Number(await provider.getGasPrice());
  const gasPrice = Number(
    await ethToErc20(currentChain.converstionId, currentChain.usdcId, ethGas)
  );

  const hopUSDCFees = Number(
    await ethToErc20(currentChain.converstionId, currentChain.usdcId, hopFees)
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
    hopFees,
    hopUSDCFees,
  };
};

export {
  getTransferLocalEstimates,
  getSingleToMultiTransferEstimates,
  getMultiToSingleTransferEstimates,
};
