const { expect } = require("chai");
const { ethers } = require("hardhat");
const { CollectionConfig } = require("../config/CollectionConfig");
const { getAmountFromWei, getAmountInWei } = require("../utils/helper-scripts");


async function deploy() {
  // Deploy Nft contract
  const contractFactory = await ethers.getContractFactory("NFTNormal");
  const nft_contract = await contractFactory.deploy(
    CollectionConfig.tokenName,
    CollectionConfig.tokenSymbol,
    getAmountInWei(CollectionConfig.whitelistSale.price),
    CollectionConfig.maxSupply,
    CollectionConfig.whitelistSale.maxMintAmountPerTx,
    CollectionConfig.hiddenMetadataUri
  );
  return nft_contract;
}


describe("NftContract.sol", () => {
  let contract;
  let owner;

  before(async () => {
    [owner, user1, user2, randomUser] = await ethers.getSigners();
  });

  describe("Correct Deployement", () => {
    before(async () => {
      contract = await deploy();
    });

    it("should have correct owner address", async () => {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("should have correct initial parameters", async () => {
      expect(await contract.baseURI()).to.equal("");
      expect(await contract.hiddenMetadataUri()).to.equal(
        CollectionConfig.hiddenMetadataUri
      );
      expect(await contract.cost()).to.equal(
        getAmountInWei(CollectionConfig.whitelistSale.price)
      );
      expect(await contract.maxSupply()).to.equal(CollectionConfig.maxSupply);
      expect(await contract.maxMintAmountPerTx()).to.equal(
        CollectionConfig.whitelistSale.maxMintAmountPerTx
      );
      expect(await contract.hiddenMetadataUri()).to.equal(
        CollectionConfig.hiddenMetadataUri
      );
      expect(await contract.nftPerAddressLimit()).to.equal(3);
      expect(await contract.paused()).to.equal(true);
      expect(await contract.revealed()).to.equal(false);
      expect(await contract.whitelistMintEnabled()).to.equal(false);
      await expect(contract.tokenURI(1)).to.be.revertedWithCustomError(
        contract,
        "NFT__QueryForNonExistentToken"
      );
    });
  });

  describe("Before Sale (contract is paused)", () => {
    before(async () => {
      contract = await deploy();
    });

    it("should not allow users to mint when contract is paused", async () => {
      let whitelistAddresses = [user1.address, user2.address];
      await contract.connect(owner).whitelistUsers(whitelistAddresses);

      const mintCost = await contract.cost();
      // Whitelist mint
      await expect(
        contract.connect(user1).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");
      // public mint
      await expect(
        contract.connect(randomUser).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");
    });
  });

  describe("Whitelist Sale", () => {
    before(async () => {
      contract = await deploy();

      // enable whitelist sales
      await contract.connect(owner).pause(false);
      await contract.connect(owner).setWhitelistMintEnabled(true);
    });

    it("should allow owner to whitelist addresses", async () => {
      let whitelistAddresses = [user1.address, user2.address];
      await contract.connect(owner).whitelistUsers(whitelistAddresses);

      expect(await contract.isWhitelisted(user1.address)).to.equal(true);
      expect(await contract.isWhitelisted(user2.address)).to.equal(true);
      expect(await contract.isWhitelisted(randomUser.address)).to.equal(false);
    });

    it("should allow whitelisted addresses to mint", async () => {
      const mintCost = await contract.cost();
      await contract.connect(user1).mint(1, { value: mintCost });

      expect(await contract.totalSupply()).to.equal(1);
      expect(await contract.addressMintedBalance(user1.address)).to.equal(1);
      expect(await contract.tokenURI(1)).to.equal(
        CollectionConfig.hiddenMetadataUri
      );

      await expect(
        contract.connect(user2).mint(3, { value: mintCost })
      ).to.be.revertedWithCustomError(
        contract,
        "NFT__ExceededMaxMintAmountPerTx"
      );
      await expect(
        contract.connect(randomUser).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__NotWhitelisted");
      await expect(
        contract.connect(user2).mint(0, { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__InvalidMintAmount");

      // minting is limited to 3 nft per user during whitelisting period
      await contract.connect(user1).mint(1, { value: mintCost });
      await contract.connect(user1).mint(1, { value: mintCost });
      await expect(
        contract.connect(user1).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(
        contract,
        "NFT__ExceededMaxNftPerAddress"
      );
    });

    it("should allow owner to mint", async () => {
      const mintCost = await contract.cost();
      await contract.connect(owner).mint(1, { value: mintCost });

      expect(await contract.totalSupply()).to.equal(4);
      expect(await contract.tokenURI(1)).to.equal(
        CollectionConfig.hiddenMetadataUri
      );
    });
  });

  describe("Presale (public sale but without nft reveal)", () => {
    before(async () => {
      contract = await deploy();
      await contract.connect(owner).pause(false);

      // disable whitelist sales and open presale
      await contract.connect(owner).setWhitelistMintEnabled(false);
      await contract
        .connect(owner)
        .setCost(getAmountInWei(CollectionConfig.preSale.price));
      await contract
        .connect(owner)
        .setMaxMintAmountPerTx(CollectionConfig.preSale.maxMintAmountPerTx);
      await contract.connect(owner).setNftPerAddressLimit(10);
    });

    it("should have correct mint price and mint amount per tx", async () => {
      expect(await contract.cost()).to.equal(
        getAmountInWei(CollectionConfig.preSale.price)
      );
      expect(await contract.maxMintAmountPerTx()).to.equal(
        CollectionConfig.preSale.maxMintAmountPerTx
      );
      expect(await contract.whitelistMintEnabled()).to.equal(false);
    });

    it("should allow any user to mint", async () => {
      const mintCost = getAmountFromWei(await contract.cost());
      await contract
        .connect(randomUser)
        .mint(2, { value: getAmountInWei(mintCost * 2) });

      expect(await contract.totalSupply()).to.equal(2);
      expect(await contract.balanceOf(randomUser.address)).to.equal(2);
      expect(await contract.addressMintedBalance(randomUser.address)).to.equal(
        2
      );
      expect(await contract.tokenURI(1)).to.equal(
        CollectionConfig.hiddenMetadataUri
      );
    });

    it("should revert if above mint limit per address", async () => {
      const mintCost = getAmountFromWei(await contract.cost());
      await contract
        .connect(randomUser)
        .mint(3, { value: getAmountInWei(mintCost * 3) });
      await contract
        .connect(randomUser)
        .mint(3, { value: getAmountInWei(mintCost * 3) });
      await expect(
        contract
          .connect(randomUser)
          .mint(3, { value: getAmountInWei(mintCost * 3) })
      ).to.be.revertedWithCustomError(
        contract,
        "NFT__ExceededMaxNftPerAddress"
      );
    });

    it("should revert on insufficient mint funds", async () => {
      const mintCost = getAmountFromWei(await contract.cost());
      // Sending an invalid mint cost
      await expect(
        contract
          .connect(randomUser)
          .mint(2, { value: getAmountInWei(mintCost * 1) })
      ).to.be.revertedWithCustomError(contract, "NFT__InsufficientFunds");
    });

    it("should allow owner to mint", async () => {
      const mintCost = await contract.cost();
      await contract.connect(owner).mint(1, { value: mintCost });

      expect(await contract.totalSupply()).to.equal(9);
      expect(await contract.tokenURI(9)).to.equal(
        CollectionConfig.hiddenMetadataUri
      );
    });
  });

  describe("Public Sale (nft revealed)", () => {
    before(async () => {
      contract = await deploy();
      await contract.connect(owner).pause(false);

      // Start Public sales / Reveal nfts to public
      await contract.connect(owner).reveal(CollectionConfig.baseMetadataURI);
      await contract
        .connect(owner)
        .setCost(getAmountInWei(CollectionConfig.publicSale.price));
      await contract
        .connect(owner)
        .setMaxMintAmountPerTx(CollectionConfig.publicSale.maxMintAmountPerTx);
      await contract.connect(owner).setNftPerAddressLimit(30);
    });

    it("should have correct mint price and mint amount per tx", async () => {
      expect(await contract.cost()).to.equal(
        getAmountInWei(CollectionConfig.publicSale.price)
      );
      expect(await contract.maxMintAmountPerTx()).to.equal(
        CollectionConfig.publicSale.maxMintAmountPerTx
      );
      expect(await contract.revealed()).to.equal(true);
    });

    it("should allow any user to mint with revealed URI", async () => {
      const mintCost = getAmountFromWei(await contract.cost());
      await contract
        .connect(randomUser)
        .mint(2, { value: getAmountInWei(mintCost * 2) });

      expect(await contract.totalSupply()).to.equal(2);
      expect(await contract.balanceOf(randomUser.address)).to.equal(2);
      expect(await contract.addressMintedBalance(randomUser.address)).to.equal(
        2
      );
      expect(await contract.tokenURI(1)).to.equal(
        `${CollectionConfig.baseMetadataURI}1.json`
      );
    });

    it("should allow owner to mint", async () => {
      const mintCost = await contract.cost();
      await contract.connect(owner).mint(1, { value: mintCost });

      expect(await contract.totalSupply()).to.equal(3);
    });

    it("wallet of owner should contain all ids of minted items for a given user", async () => {
      const mintCost = getAmountFromWei(await contract.cost());
      await contract
        .connect(user2)
        .mint(2, { value: getAmountInWei(mintCost * 2) });

      const user2Wallet = Array.from(
        await contract.walletOfOwner(user2.address),
        (x) => Number(x)
      );

      expect(user2Wallet.length).to.equal(2);
      expect(user2Wallet).to.have.members([4, 5]);
    });
  });

  describe("Only owner functions", () => {
    it("Only owner should be allowed to call this functions", async () => {
      let whitelistAddresses = CollectionConfig.whitelistAddresses;
      await expect(
        contract.connect(randomUser).whitelistUsers(whitelistAddresses)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).reveal(CollectionConfig.baseMetadataURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setNftPerAddressLimit(10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setCost(getAmountInWei(0.01))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setMaxMintAmountPerTx(10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setBaseURI("ipfs://new-Nft-Uri/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setBaseExtension(".jpeg")
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setHiddenMetadataUri("INVALID_URI")
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).pause(false)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setWhitelistMintEnabled(false)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(contract.connect(randomUser).withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Owner should be able to withdraw contract balance", async () => {
      const ownerInitialBalance = getAmountFromWei(await owner.getBalance());
      // withdraw full contract balance
      await (await contract.connect(owner).withdraw()).wait();
      const ownerFinalBalance = getAmountFromWei(await owner.getBalance());

      // withdraw call cost some gas so we to account for it
      expect(parseFloat(ownerFinalBalance)).to.be.greaterThan(
        parseFloat(ownerInitialBalance)
      );
    });
  });
});
