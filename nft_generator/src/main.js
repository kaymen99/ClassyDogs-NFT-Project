const basePath = process.cwd()
const fs = require("fs");
const sha1 = require("sha1")
const { createCanvas, loadImage } = require("canvas");
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
    format,
    baseUri,
    description,
    uniqueDnaTorrance,
    layerConfigurations,
    rarityDelimiter,
    shuffleLayerConfigurations,
    debugLogs,
    namePrefix,
} = require("./config");

const canvas = createCanvas(format.width, format.height)
const ctx = canvas.getContext("2d")

var metadataList = []
var attributesList = []
var dnaList = new Set()
const DNA_DELIMITER = "-";

// Setup the build directory for storing collection images & metadata
const buildSetup = () => {
    if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true })
    }
    fs.mkdirSync(buildDir)
    // create metadata & images folders
    fs.mkdirSync(`${buildDir}/json`)
    fs.mkdirSync(`${buildDir}/images`)
}

const getRarityWeight = (_str) => {
    // image name without .png extension
    let nameWithoutExtension = _str.slice(0, -4)
    var nameWithoutWeight = Number(
        nameWithoutExtension.split(rarityDelimiter).pop()
    )
    if (isNaN(nameWithoutWeight)) {
        nameWithoutWeight = 1
    }
    return nameWithoutWeight
}

const cleanDna = (_str) => {
    const withoutOptions = removeQueryStrings(_str)
    return Number(withoutOptions.split(":").shift())
}

const cleanName = (_str) => {
    let nameWithoutExtension = _str.slice(0, -4)
    var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift()
    return nameWithoutWeight
}

const getElements = (path) => {
    return fs
        .readdirSync(path)
        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
        .map((i, index) => {
            return {
                id: index,
                name: cleanName(i),
                fileName: i,
                path: `${path}${i}`,
                // weight: getRarityWeight(i),
                weight: 10
            }
        })
}

const layersSetup = (_layersOrder) => {
    const layers = _layersOrder.map((layer, index) => {
        console.log({
            id: index,
            name: layer.name,
            elements: getElements(`${layersDir}/${layer.name}/`),

        })
        return {
            id: index,
            name: layer.name,
            elements: getElements(`${layersDir}/${layer.name}/`),
        }
    })
    return layers
}

const saveImage = (_edition) => {
    fs.writeFileSync(
        `${buildDir}/images/${_edition}.png`,
        canvas.toBuffer('image/png')
    )
}

const addMetadata = (_dna, _edition) => {
    let tempMetadata = {
        name: `${namePrefix}/${_edition}`,
        description: description,
        image: `${baseUri}/${_edition}.png`,
        dna: sha1(_dna),
        edition: _edition,
        date: Date.now(),
        attributes: attributesList
    }
    metadataList.push(tempMetadata)
    attributesList = []
}

const addAttributes = (_element) => {
    let selectedElement = _element.layer.selectedElement
    attributesList.push({
        trait_type: _element.layer.name,
        value: selectedElement.name
    })
}

const loadLayerImage = async (_layer) => {
    try {
        return new Promise(async (resolve) => {
            const image = await loadImage(`${_layer.selectedElement.path}`)
            resolve({ layer: _layer, loadedImage: image })
        })
    } catch (err) {
        console.log("Error loading image: ", err)
    }
}

const drawElement = (_element) => {
    ctx.drawImage(
        _element.loadedImage,
        0,
        0,
        format.width,
        format.height
    )
    addAttributes(_element)
}

const constructDnaFromLayer = (_dna = "", _layers = []) => {
    let mappingDnaToLayer = _layers.map((layer, index) => {
        let selectedElement = layer.elements.find(
            (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
        )
        return {
            name: layer.name,
            selectedElement: selectedElement
        }
    })
    return mappingDnaToLayer
}

const filterDNAOptions = (_dna) => {

    const dnaItems = _dna.split(DNA_DELIMITER);
    const filteredDNA = dnaItems.filter((element) => {
        const query = /(\?.*$)/;
        const querystring = query.exec(element);
        if (!querystring) {
            return true;
        }
        const options = querystring[1].split("&").reduce((r, setting) => {
            const keyPairs = setting.split("=");
            return { ...r, [keyPairs[0]]: keyPairs[1] };
        }, []);

        return options.bypassDNA;
    });

    return filteredDNA.join(DNA_DELIMITER);
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
    const _filteredDNA = filterDNAOptions(_dna);
    return !_DnaList.has(_filteredDNA);
};

const createDna = (_layers) => {
    let randNum = [];
    _layers.forEach((layer) => {
        var totalWeight = 0;
        layer.elements.forEach((element) => {
            totalWeight += element.weight;
        });
        // number between 0 - totalWeight
        let random = Math.floor(Math.random() * totalWeight);
        for (var i = 0; i < layer.elements.length; i++) {
            // subtract the current weight from the random weight until we reach a sub zero value.
            random -= layer.elements[i].weight;
            if (random < 0) {
                return randNum.push(
                    `${layer.elements[i].id}:${layer.elements[i].fileName}${layer.bypassDNA ? "?bypassDNA=true" : ""
                    }`
                );
            }
        }
    });
    return randNum.join(DNA_DELIMITER);
};

const writeMetaData = (_data) => {
    fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const removeQueryStrings = (_dna = "") => {
    const query = /(\?.*$)/
    return _dna.replace(query, "")
}

const saveMetaDataSingleFile = (_editionCount) => {
    let metadata = metadataList.find((meta) => meta.edition == _editionCount);
    debugLogs
        ? console.log(
            `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
        )
        : null;
    fs.writeFileSync(
        `${buildDir}/json/${_editionCount}.json`,
        JSON.stringify(metadata, null, 2)
    );
};

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}

const startCreating = async () => {
    let layerConfigIndex = 0;
    let editionCount = 1;
    let failedCount = 0;
    let abstractedIndexes = [];
    for (
        let i = 1;
        i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
        i++
    ) {
        abstractedIndexes.push(i);
    }
    if (shuffleLayerConfigurations) {
        abstractedIndexes = shuffle(abstractedIndexes);
    }
    debugLogs
        ? console.log("Editions left to create: ", abstractedIndexes)
        : null;
    while (layerConfigIndex < layerConfigurations.length) {
        const layers = layersSetup(
            layerConfigurations[layerConfigIndex].layersOrder
        );
        while (
            editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
        ) {
            let newDna = createDna(layers);
            if (isDnaUnique(dnaList, newDna)) {
                let results = constructDnaFromLayer(newDna, layers);
                let loadedElements = [];

                results.forEach((layer) => {
                    loadedElements.push(loadLayerImage(layer));
                });

                await Promise.all(loadedElements).then((renderObjectArray) => {
                    debugLogs ? console.log("Clearing canvas") : null;
                    ctx.clearRect(0, 0, format.width, format.height);

                    renderObjectArray.forEach((renderObject, index) => {
                        drawElement(renderObject);
                    });

                    debugLogs
                        ? console.log("Editions left to create: ", abstractedIndexes)
                        : null;

                    saveImage(abstractedIndexes[0]);
                    addMetadata(newDna, abstractedIndexes[0]);
                    saveMetaDataSingleFile(abstractedIndexes[0]);

                    console.log(
                        `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(newDna)}`
                    );
                });
                dnaList.add(filterDNAOptions(newDna));
                editionCount++;
                abstractedIndexes.shift();
            } else {
                console.log("DNA exists!");
                failedCount++;
                if (failedCount >= uniqueDnaTorrance) {
                    console.log(
                        `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
                    );
                    process.exit();
                }
            }
        }
        layerConfigIndex++;
    }
    writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };