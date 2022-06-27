const CollectionConfig = {

    tokenName: "Classy Dogs Collection",
    tokenSymbol: 'CD',
    baseMetadataURI: "ipfs://testNftURI/",
    hiddenMetadataUri: 'ipfs://__CID__/hidden.json',
    maxSupply: 10000,
    whitelistSale: {
        price: 0.05,
        maxMintAmountPerTx: 1,
    },
    preSale: {
        price: 0.07,
        maxMintAmountPerTx: 3,
    },
    publicSale: {
        price: 0.09,
        maxMintAmountPerTx: 5,
    },
    contractAddress: null,
    marketplaceIdentifier: 'my-nft-token',
    // marketplaceConfig: Marketplaces.openSea,
    whitelistAddresses: [],
};

module.exports = { CollectionConfig };