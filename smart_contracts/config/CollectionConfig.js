const CollectionConfig = {

    tokenName: "Classy Dogs Collection",
    tokenSymbol: 'CD',
    baseMetadataURI: "ipfs://QmdN2LsGe35Skv8HJjjYQqtv2LNs43VS7zxQgcLPwHxYjd/",
    hiddenMetadataUri: 'ipfs://QmcSWAAxqfdDGcKNGxKeqRbziCNhuwTv7jRD87EjCn1wvg',
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
