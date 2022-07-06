
const namePrefix = "The Classy Dogs";
const description = "No more kitties, here comes the Classy Dogs";

// Here you put your NFTs metadata URI
// The given URI is just an example used in my Classy Dogs project where i uploaded 5O items to IPFS through PINATA
const baseUri = "ipfs://QmaL4xvWpr6JGgm1Z7NWqDMnDnNG4vSQ4YKiYDAqV68mBF";

const layerConfigurations = [
    {
        growEditionSizeTo: 50,
        layersOrder: [
            { name: "Background" },
            { name: "Body" },
            { name: "Mouths" },
            { name: "Eyes" },
            { name: "Glasses" },
            { name: "Outfits" },
            { name: "Beard and mustache" },
        ],
    },
];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
    width: 300,
    height: 300,
    smoothing: false,
};

const background = {
    generate: true,
    brightness: "80%",
    static: false,
    default: "#000000",
};

const extraMetadata = {};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;


module.exports = {
    format,
    baseUri,
    description,
    background,
    uniqueDnaTorrance,
    layerConfigurations,
    rarityDelimiter,
    shuffleLayerConfigurations,
    debugLogs,
    extraMetadata,
    namePrefix,
};
