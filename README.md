# Sigma - Backend

A seamless cross-chain USDC bridge powered by Wormhole & Circle's CCTP.

![Made-With-Javascript](https://img.shields.io/badge/MADE%20WITH-Javascript-ffd000.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=javascript)
![Made-With-NodeJS](https://img.shields.io/badge/MADE%20WITH-NodeJS-32a852.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=nodejs)
![Made-With-Express](https://img.shields.io/badge/MADE%20WITH-Express-000000.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=express)
![Made-With-ETHERS](https://img.shields.io/badge/MADE%20WITH-Ethers-000000.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=ethereum)
![Made-With-Wormhole](https://img.shields.io/badge/MADE%20WITH-wormhole-ffffff.svg?colorA=222222&style=for-the-badge&logoWidth=14)
![Made-With-Circle](https://img.shields.io/badge/MADE%20WITH-CIRCLE-ffffff.svg?colorA=22222&style=for-the-badge&logoWidth=14)

> Sigma Hop enables users to transfer USDC across multiple testnets with a single signature:
>
> - Optimism Sepolia
> - Avalanche Fuji
> - Base Sepolia

This is the backend smart contract used for _[sigmahop.tech](https://sigmahop.tech/)_ which is built during the _[Sigma Sprint](https://sigma.wormhole.com/)_.

> The Backend is live at [https://hop.getbackend.tech/](https://hop.getbackend.tech/)

> THIS IS A PROOF OF CONCEPT AND SHOULD NOT BE USED IN PRODUCTION

#

> **Pre-requisites:**
>
> - Setup Node.js v18+ (recommended via [nvm](https://github.com/nvm-sh/nvm) with `nvm install 18`)
> - Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
> - Clone this repository

```bash
# Install dependencies
npm install

# fill environments
cp .env.example .env
```

## Development

```bash
# Start the server
npm run start
```
