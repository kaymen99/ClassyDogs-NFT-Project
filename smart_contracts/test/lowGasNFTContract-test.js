const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { CollectionConfig } = require("../config/CollectionConfig");
const { getAmountFromWei, getAmountInWei } = require("../utils/helper-scripts");

async function deploy() {
  // Deploy Nft contract
  const contractFactory = await ethers.getContractFactory("NftLowGasContract");
  const nft_contract = await contractFactory.deploy(
    CollectionConfig.tokenName,
    CollectionConfig.tokenSymbol,
    getAmountInWei(CollectionConfig.whitelistSale.price),
    CollectionConfig.maxSupply,
    CollectionConfig.whitelistSale.maxMintAmountPerTx,
    CollectionConfig.hiddenMetadataUri
  );

  // Build MerkleTree
  const leafNodes = CollectionConfig.whitelistAddresses.map((addr) =>
    keccak256(addr)
  );
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  return [nft_contract, merkleTree];
}

describe("NftLowGasContract.sol", () => {
  let contract;
  let owner;
  let merkleTree;

  before(async () => {
    [owner, user1, whitelistedUser, randomUser] = await ethers.getSigners();
  });

  describe("Correct Deployement", () => {
    before(async () => {
      [contract, merkleTree] = await deploy();
    });

    it("should have correct owner address", async () => {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("should have correct initial parameters", async () => {
      expect(await contract.uriPrefix()).to.equal("");
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
      [contract, merkleTree] = await deploy();
    });

    it("should not allow users to mint when contract is paused", async () => {
      let mintCost = await contract.cost();
      await expect(
        contract.connect(user1).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");
      await expect(
        contract.connect(user1).whitelistMint(1, [], { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");
      await expect(
        contract.connect(whitelistedUser).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");
      await expect(
        contract
          .connect(whitelistedUser)
          .whitelistMint(1, [], { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");
      await expect(
        contract.connect(owner).mint(1, { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");
      await expect(
        contract.connect(owner).whitelistMint(1, [], { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__ContractIsPaused");

      // Check balances
      expect(await contract.balanceOf(owner.address)).to.equal(0);
      expect(await contract.balanceOf(whitelistedUser.address)).to.equal(0);
      expect(await contract.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe("Whitelist Sale", () => {
    let mintCost;

    before(async () => {
      [contract, merkleTree] = await deploy();
      mintCost = await contract.cost();

      const rootHash = merkleTree.getRoot();
      // Update the root hash
      await (
        await contract.setMerkleRoot("0x" + rootHash.toString("hex"))
      ).wait();

      await contract.setPaused(false);
      await contract.setWhitelistMintEnabled(true);
    });
    it("should allow whitelisted addresses to mint", async () => {
      await contract
        .connect(whitelistedUser)
        .whitelistMint(
          1,
          merkleTree.getHexProof(keccak256(whitelistedUser.address)),
          { value: mintCost }
        );

      expect(await contract.balanceOf(whitelistedUser.address)).to.equal(1);
    });
    it("should not allow whitelisted addresses to mint twice", async () => {
      // Trying to mint twice
      await expect(
        contract
          .connect(whitelistedUser)
          .whitelistMint(
            1,
            merkleTree.getHexProof(keccak256(whitelistedUser.address)),
            { value: mintCost }
          )
      ).to.be.revertedWithCustomError(contract, "NFT__AlreadyClaimed");

      expect(await contract.balanceOf(whitelistedUser.address)).to.equal(1);
    });

    it("should not allow normal mint", async () => {
      const mintCost = await contract.cost();
      await expect(
        contract.connect(randomUser).mint(1, {
          value: mintCost,
        })
      ).to.be.revertedWithCustomError(contract, "NFT__OnlyWhitelistMint");
    });

    it("should revert on invalid mint amount", async () => {
      const mintAmount = (await await contract.maxMintAmountPerTx()) + 1;
      // Sending an invalid mint amount
      await expect(
        contract
          .connect(whitelistedUser)
          .whitelistMint(
            mintAmount,
            merkleTree.getHexProof(keccak256(whitelistedUser.address)),
            { value: getAmountInWei(getAmountFromWei(mintCost) * mintAmount) }
          )
      ).to.be.revertedWithCustomError(contract, "NFT__InvalidMintAmount");
    });
    it("should revert on insufficient mint funds", async () => {
      // Sending an invalid mint cost
      await expect(
        contract
          .connect(whitelistedUser)
          .whitelistMint(
            1,
            merkleTree.getHexProof(keccak256(whitelistedUser.address)),
            { value: getAmountInWei(getAmountFromWei(mintCost) * 0.8) }
          )
      ).to.be.revertedWithCustomError(contract, "NFT__InsufficientFunds");
    });
    it("should revert with invalid proof for not whitelisted user", async () => {
      // Pretending to be someone else
      await expect(
        contract
          .connect(user1)
          .whitelistMint(
            1,
            merkleTree.getHexProof(keccak256(whitelistedUser.address)),
            { value: mintCost }
          )
      ).to.be.revertedWithCustomError(contract, "NFT__InvalidProof");
      // Sending an invalid proof
      await expect(
        contract
          .connect(user1)
          .whitelistMint(
            1,
            merkleTree.getHexProof(keccak256(await user1.getAddress())),
            { value: mintCost }
          )
      ).to.be.revertedWithCustomError(contract, "NFT__InvalidProof");
      // Sending no proof at all
      await expect(
        contract.connect(user1).whitelistMint(1, [], { value: mintCost })
      ).to.be.revertedWithCustomError(contract, "NFT__InvalidProof");

      expect(await contract.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe("Presale (public sale but without nft reveal)", () => {
    before(async () => {
      [contract, merkleTree] = await deploy();
      await contract.setPaused(false);

      // stop whitelising
      await contract.setWhitelistMintEnabled(false);

      await contract
        .connect(owner)
        .setCost(getAmountInWei(CollectionConfig.preSale.price));
      await contract
        .connect(owner)
        .setMaxMintAmountPerTx(CollectionConfig.preSale.maxMintAmountPerTx);
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
        .mint(3, { value: getAmountInWei(mintCost * 3) });

      expect(await contract.totalSupply()).to.equal(3);
      expect(await contract.balanceOf(randomUser.address)).to.equal(3);
      expect(await contract.tokenURI(1)).to.equal(
        CollectionConfig.hiddenMetadataUri
      );
    });
    it("should revert on invalid mint amount", async () => {
      const mintCost = getAmountFromWei(await contract.cost());
      const mintAmount = (await await contract.maxMintAmountPerTx()) + 1;
      // Sending an invalid mint amount
      await expect(
        contract
          .connect(randomUser)
          .mint(mintAmount, { value: getAmountInWei(mintCost * mintAmount) })
      ).to.be.revertedWithCustomError(contract, "NFT__InvalidMintAmount");
    });
    it("should revert on insufficient mint funds", async () => {
      const mintCost = getAmountFromWei(await contract.cost());
      // Sending an invalid mint cost
      await expect(
        contract
          .connect(randomUser)
          .mint(1, { value: getAmountInWei(mintCost * 0.8) })
      ).to.be.revertedWithCustomError(contract, "NFT__InsufficientFunds");
    });
    it("should not allow whitelist mint", async () => {
      const mintCost = await contract.cost();
      await expect(
        contract
          .connect(whitelistedUser)
          .whitelistMint(
            1,
            merkleTree.getHexProof(keccak256(whitelistedUser.address)),
            { value: mintCost }
          )
      ).to.be.revertedWithCustomError(contract, "NFT__WhitelistNotEnabled");
    });
  });

  describe("Public Sale (nft revealed)", () => {
    before(async () => {
      [contract, merkleTree] = await deploy();
      await contract.setPaused(false);

      // Reveal nfts to public
      await contract
        .connect(owner)
        .setUriPrefix(CollectionConfig.baseMetadataURI);
      await contract.connect(owner).setRevealed(true);
      await contract
        .connect(owner)
        .setCost(getAmountInWei(CollectionConfig.publicSale.price));
      await contract
        .connect(owner)
        .setMaxMintAmountPerTx(CollectionConfig.publicSale.maxMintAmountPerTx);
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
        .mint(3, { value: getAmountInWei(mintCost * 3) });

      expect(await contract.totalSupply()).to.equal(3);
      expect(await contract.balanceOf(randomUser.address)).to.equal(3);
      expect(await contract.tokenURI(3)).to.equal(
        `${CollectionConfig.baseMetadataURI}3.json`
      );
    });

    it("wallet of user should contain all ids of his minted items", async () => {
      const randomUserWallet = Array.from(
        await contract.tokensOfOwner(randomUser.address),
        (x) => Number(x)
      );

      expect(randomUserWallet.length).to.equal(3);
      expect(randomUserWallet).to.have.members([1, 2, 3]);
    });
  });

  describe("Only owner functions", () => {
    it("Only owner should be allowed to call this functions", async () => {
      await expect(
        contract.connect(randomUser).setRevealed(true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setCost(getAmountInWei(0.01))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setMaxMintAmountPerTx(10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setUriPrefix("ipfs://new-Nft-Uri/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setUriSuffix(".jpeg")
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setHiddenMetadataUri("INVALID_URI")
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        contract.connect(randomUser).setPaused(true)
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
      expect(ownerFinalBalance).to.be.greaterThan(ownerInitialBalance);
    });
  });
});
