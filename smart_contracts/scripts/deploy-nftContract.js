const hre = require("hardhat");
const fs = require("fs");
const fse = require("fs-extra");
const { verify } = require("../utils/verify");
const {
  getAmountInWei,
  developmentChains,
} = require("../utils/helper-scripts");
const { CollectionConfig } = require("../config/CollectionConfig");

async function main() {
  const deployNetwork = hre.network.name;

  const NFTContract = await hre.ethers.getContractFactory("NFTNormal");
  const nft_contract = await NFTContract.deploy(
    CollectionConfig.tokenName,
    CollectionConfig.tokenSymbol,
    getAmountInWei(CollectionConfig.whitelistSale.price),
    CollectionConfig.maxSupply,
    CollectionConfig.whitelistSale.maxMintAmountPerTx,
    CollectionConfig.hiddenMetadataUri
  );
  await nft_contract.deployed();

  console.log("NFT contract deployed at :", nft_contract.address);
  console.log("Network deployed to :", deployNetwork);

  /* this code writes the contract addresses to a local */
  /* file named config.js that we can use in the app */
  if (fs.existsSync("../front-end/src")) {
    fse.copySync(`./artifacts/contracts`, "../front-end/src/artifacts");
    fs.writeFileSync(
      "../front-end/src/utils/contracts-config.js",
      `
    export const contractAddress = "${nft_contract.address}"
    export const ownerAddress = "${nft_contract.signer.address}"
    export const networkDeployedTo = "${hre.network.config.chainId}"
    `
    );
  }
  if (
    !developmentChains.includes(deployNetwork) &&
    hre.config.etherscan.apiKey[deployNetwork]
  ) {
    console.log("waiting for 6 blocks verification ...");
    await nft_contract.deployTransaction.wait(6);

    // args represent contract constructor arguments
    const args = [
      CollectionConfig.tokenName,
      CollectionConfig.tokenSymbol,
      getAmountInWei(CollectionConfig.whitelistSale.price),
      CollectionConfig.maxSupply,
      CollectionConfig.whitelistSale.maxMintAmountPerTx,
      CollectionConfig.hiddenMetadataUri,
    ];
    await verify(nft_contract.address, args);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
