
const namePrefix = "Your Collection";
const description = "Remember to replace this description";
const baseUri = "ipfs://NewUriToReplace";

const layerConfigurations = [
    {
        growEditionSizeTo: 5,
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
    width: 512,
    height: 512,
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