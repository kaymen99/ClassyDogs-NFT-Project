const { expect } = require("chai");
const { ethers } = require("hardhat");
const { CollectionConfig } = require('../config/CollectionConfig');
const { getAmountFromWei, getAmountInWei } = require('../utils/helper-scripts');


describe("NftContract.sol", () => {
    let contract;
    let owner;

    beforeEach(async () => {
        [owner, user1, user2, randomUser] = await ethers.getSigners()

        // Deploy Nft contract 
        const contractFactory = await ethers.getContractFactory("NFTNormal");
        contract = await contractFactory.deploy(
            CollectionConfig.tokenName,
            CollectionConfig.tokenSymbol,
            getAmountInWei(CollectionConfig.whitelistSale.price),
            CollectionConfig.maxSupply,
            CollectionConfig.whitelistSale.maxMintAmountPerTx,
            CollectionConfig.hiddenMetadataUri
        );
    })

    describe("Correct Deployement", () => {
        it("should have correct owner address", async () => {
            const contractOwner = await contract.owner();
            expect(contractOwner).to.equal(owner.address);
        });

        it("should have correct initial parameters", async () => {
            expect(await contract.baseURI()).to.equal("");
            expect(await contract.hiddenMetadataUri()).to.equal(CollectionConfig.hiddenMetadataUri);
            expect(await contract.cost()).to.equal(getAmountInWei(CollectionConfig.whitelistSale.price));
            expect(await contract.maxSupply()).to.equal(CollectionConfig.maxSupply);
            expect(await contract.maxMintAmountPerTx()).to.equal(CollectionConfig.whitelistSale.maxMintAmountPerTx);
            expect(await contract.hiddenMetadataUri()).to.equal(CollectionConfig.hiddenMetadataUri);
            expect(await contract.nftPerAddressLimit()).to.equal(3);
            expect(await contract.paused()).to.equal(true);
            expect(await contract.revealed()).to.equal(false);
            expect(await contract.whitelistMintEnabled()).to.equal(false);
            await expect(contract.tokenURI(1)).to.be.revertedWithCustomError(contract, 'NFT__QueryForNonExistentToken');
        });
    });

    describe("Before Sale (contract is paused)", () => {
        it("should not allow users to mint when contract is paused", async () => {
            let whitelistAddresses = [
                user1.address,
                user2.address,
            ]
            await contract.connect(owner).whitelistUsers(whitelistAddresses)

            const mintCost = await contract.cost()
            // Whitelist mint
            await expect(
                contract.connect(user1).mint(1, { value: mintCost })
            ).to.be.revertedWithCustomError(contract, 'NFT__ContractIsPaused');
            // public mint
            await expect(
                contract.connect(randomUser).mint(1, { value: mintCost })
            ).to.be.revertedWithCustomError(contract, 'NFT__ContractIsPaused');
        });
    })

    describe("Whitelist Sale", () => {

        beforeEach(async () => {
            // enable whitelist sales
            await contract.connect(owner).pause(false)
            await contract.connect(owner).setWhitelistMintEnabled(true)
        })

        it("should allow owner to whitelist addresses", async () => {
            let whitelistAddresses = [
                user1.address,
                user2.address,
            ]
            await contract.connect(owner).whitelistUsers(whitelistAddresses)

            expect(await contract.isWhitelisted(user1.address)).to.equal(true);
            expect(await contract.isWhitelisted(user2.address)).to.equal(true);
            expect(await contract.isWhitelisted(randomUser.address)).to.equal(false);
        });

        it("should allow whitelisted addresses to mint", async () => {
            let whitelistAddresses = [
                user1.address,
                user2.address,
            ]
            await contract.connect(owner).whitelistUsers(whitelistAddresses)

            const mintCost = await contract.cost()
            await contract.connect(user1).mint(1, { value: mintCost })

            expect(await contract.totalSupply()).to.equal(1);
            expect(await contract.addressMintedBalance(user1.address)).to.equal(1);
            expect(await contract.tokenURI(1)).to.equal(CollectionConfig.hiddenMetadataUri)

            await expect(
                contract.connect(user2).mint(3, { value: mintCost })
            ).to.be.revertedWithCustomError(contract, 'NFT__ExceededMaxMintAmountPerTx');
            await expect(
                contract.connect(randomUser).mint(1, { value: mintCost })
            ).to.be.revertedWithCustomError(contract, 'NFT__NotWhitelisted');
            await expect(
                contract.connect(user2).mint(0, { value: mintCost })
            ).to.be.revertedWithCustomError(contract, 'NFT__InvalidMintAmount');

            // minting is limited to 3 nft per user during whitelisting period
            await contract.connect(user1).mint(1, { value: mintCost })
            await contract.connect(user1).mint(1, { value: mintCost })
            await expect(
                contract.connect(user1).mint(1, { value: mintCost })
            ).to.be.revertedWithCustomError(contract, 'NFT__ExceededMaxNftPerAddress');
        });

        it("should allow owner to mint", async () => {
            const mintCost = await contract.cost()
            await contract.connect(owner).mint(1, { value: mintCost })

            expect(await contract.totalSupply()).to.equal(1);
            expect(await contract.addressMintedBalance(owner.address)).to.equal(1);
            expect(await contract.tokenURI(1)).to.equal(CollectionConfig.hiddenMetadataUri)
        });
    })

    describe("Presale (public sale but without nft reveal)", () => {

        beforeEach(async () => {
            // pass the whitelisting step
            await contract.connect(owner).pause(false)
            await contract.connect(owner).setWhitelistMintEnabled(true)
            // disable whitelist sales and open presale
            await contract.connect(owner).setWhitelistMintEnabled(false)
            await contract.connect(owner).setCost(
                getAmountInWei(CollectionConfig.preSale.price)
            )
            await contract.connect(owner).setMaxMintAmountPerTx(
                CollectionConfig.preSale.maxMintAmountPerTx
            )
        })

        it("should have correct mint price and mint amount per tx", async () => {
            expect(await contract.cost()).to.equal(getAmountInWei(CollectionConfig.preSale.price));
            expect(await contract.maxMintAmountPerTx()).to.equal(CollectionConfig.preSale.maxMintAmountPerTx);
            expect(await contract.whitelistMintEnabled()).to.equal(false);
        });

        it("should allow any user to mint", async () => {

            const mintCost = getAmountFromWei(await contract.cost())
            await contract.connect(randomUser).mint(3, { value: getAmountInWei(mintCost * 3) })

            expect(await contract.totalSupply()).to.equal(3);
            expect(await contract.balanceOf(randomUser.address)).to.equal(3);
            expect(await contract.addressMintedBalance(randomUser.address)).to.equal(3);
            expect(await contract.tokenURI(1)).to.equal(CollectionConfig.hiddenMetadataUri)
        });

        it("should allow owner to mint", async () => {
            const mintCost = await contract.cost()
            await contract.connect(owner).mint(1, { value: mintCost })

            expect(await contract.totalSupply()).to.equal(1);
            expect(await contract.addressMintedBalance(owner.address)).to.equal(1);
            expect(await contract.tokenURI(1)).to.equal(CollectionConfig.hiddenMetadataUri)
        });
    })

    describe("Public Sale (nft revealed)", () => {

        beforeEach(async () => {

            // pass the two steps of : whitelisting and presale
            await contract.connect(owner).pause(false)
            await contract.connect(owner).setWhitelistMintEnabled(false)

            // Stat Publi sales / Reveal nfts to public
            await contract.connect(owner).reveal(CollectionConfig.baseMetadataURI)
            await contract.connect(owner).setCost(
                getAmountInWei(CollectionConfig.publicSale.price)
            )
            await contract.connect(owner).setMaxMintAmountPerTx(
                CollectionConfig.publicSale.maxMintAmountPerTx
            )
        })

        it("should have correct mint price and mint amount per tx", async () => {
            expect(await contract.cost()).to.equal(getAmountInWei(CollectionConfig.publicSale.price));
            expect(await contract.maxMintAmountPerTx()).to.equal(CollectionConfig.publicSale.maxMintAmountPerTx);
            expect(await contract.revealed()).to.equal(true);
        });

        it("should allow any user to mint with revealed URI", async () => {

            const mintCost = getAmountFromWei(await contract.cost())
            await contract.connect(randomUser).mint(3, { value: getAmountInWei(mintCost * 3) })

            expect(await contract.totalSupply()).to.equal(3);
            expect(await contract.balanceOf(randomUser.address)).to.equal(3);
            expect(await contract.addressMintedBalance(randomUser.address)).to.equal(3);
            expect(await contract.tokenURI(1)).to.equal(`${CollectionConfig.baseMetadataURI}1.json`)
        });

        it("should allow owner to mint", async () => {
            const mintCost = getAmountFromWei(await contract.cost())
            await contract.connect(owner).mint(5, { value: getAmountInWei(mintCost) })

            expect(await contract.totalSupply()).to.equal(5);
            expect(await contract.addressMintedBalance(owner.address)).to.equal(5);
        });

        it("wallet of owner should contain all ids of minted items for a given user", async () => {
            const mintCost = getAmountFromWei(await contract.cost())
            await contract.connect(user1).mint(2, { value: getAmountInWei(mintCost * 2) })
            await contract.connect(randomUser).mint(3, { value: getAmountInWei(mintCost * 3) })

            const randomUserWallet = Array.from((await contract.walletOfOwner(randomUser.address)), x => Number(x))

            expect(randomUserWallet.length).to.equal(3);
            expect(randomUserWallet).to.have.members([3, 4, 5]);
        });
    })

    describe("Only owner functions", () => {
        it("Only owner should be allowed to call this functions", async () => {
            let whitelistAddresses = [
                user1.address,
                user2.address,
            ]

            await expect(contract.connect(randomUser).whitelistUsers(whitelistAddresses)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).reveal(CollectionConfig.baseMetadataURI)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).setNftPerAddressLimit(10)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).setCost(getAmountInWei(0.01))).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).setMaxMintAmountPerTx(10)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).setBaseURI('ipfs://new-Nft-Uri/')).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).setBaseExtension('.jpeg')).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).setHiddenMetadataUri('INVALID_URI')).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).pause(false)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).setWhitelistMintEnabled(false)).to.be.revertedWith('Ownable: caller is not the owner');
            await expect(contract.connect(randomUser).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
        })

        it("Owner should be able to withdraw contract balance", async () => {
            // disable whitelist sales and open to public
            await contract.connect(owner).pause(false)
            await contract.connect(owner).setWhitelistMintEnabled(false)
            // change mint cost and max mint amount per Tx
            await contract.connect(owner).setCost(getAmountInWei(CollectionConfig.publicSale.price))
            await contract.connect(owner).setMaxMintAmountPerTx(CollectionConfig.publicSale.maxMintAmountPerTx)

            // mint 5 items
            const mintCost = getAmountFromWei(await contract.cost())
            await contract.connect(randomUser).mint(4, { value: getAmountInWei(mintCost * 4) })

            const ownerInitialBalance = getAmountFromWei(await owner.getBalance())
            // withdraw full contract balance
            await (await contract.connect(owner).withdraw()).wait()
            const ownerFinalBalance = getAmountFromWei(await owner.getBalance())

            // withdraw call cost some gas so we to account for it
            expect(parseFloat(ownerFinalBalance).toFixed(3)).to.be.equal(parseFloat(ownerInitialBalance + mintCost * 4).toFixed(3))

        })
    })
})
