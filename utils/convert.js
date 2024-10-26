import axios from "axios";
import { ethers } from "ethers";

const ethToErc20 = async (id, convert_id, amount) => {
  const headers = {
    "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY,
  };

  const formatAmount = ethers.utils.formatEther(amount.toString());

  const response = await axios.get(
    `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?amount=1&convert_id=${convert_id}&id=${id}`,
    { headers }
  );

  if (response.data.status.error_code !== 0) {
    throw new Error("Error converting ETH to ERC20");
  }

  return (
    response.data.data.quote[convert_id].price *
    Number(formatAmount) *
    10 ** 18
  ).toFixed(0);
};

export { ethToErc20 };
