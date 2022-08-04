<div id="top"></div>

<!-- ABOUT THE PROJECT -->
# Classy-Dogs-NFT-Project

A complete NFT project from start to finish with +10000 ClassyDogs collection created with an art generator, development and testing of the ERC721 contract and a minting dapp which enables whitelisting, presale and nfts reveal.

<p align="center">
  <img alt="Dark" src="https://user-images.githubusercontent.com/83681204/176852487-147052f0-9a49-4a07-a55d-6850b6018cdf.png" width="100%">
</p>


### Built With

* [Solidity](https://docs.soliditylang.org/)
* [Hardhat](https://hardhat.org/getting-started/)
* [React.js](https://reactjs.org/)
* [ethers.js](https://docs.ethers.io/v5/)
* [web3modal](https://github.com/Web3Modal/web3modal)
* [material ui](https://mui.com/getting-started/installation/)


<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#project-structure">Project structure</a>
     <ul>
       <li><a href="#art-generator">Art generator</a></li>
       <li><a href="#smart-contracts">Smart Contracts</a></li>
       <li><a href="#user-interface">User interface</a></li>
      </ul>
    </li>
    <li>
      <a href="#how-to-run">How to Run</a>
      <ul>
       <li><a href="#prerequisites">Prerequisites</a></li>
       <li><a href="#art-generation">Art generation</a></li>
       <li><a href="#contracts">Contracts</a></li>
       <li><a href="#front-end">Front-end</a></li>
      </ul>
    </li>
    <li><a href="#ressources">Ressources</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- PROJECT STRUCTURE -->

## Project Structure

### Art generator

It would take an insane amount of time to manually generate 10000 NFTs and create their metadata, so it's common for all NFT projects to programmatically design those items and then store them into IPFS. In this project i used a modified version of the [hashlip art engine](https://github.com/HashLips/hashlips_art_engine), this engine supports multiple layers setup, layers shuffling and items raritites, the source code can be found in the art_generator folder, the structure is as follows :

* layers folder : it's the location where you put the different layers used in the creation of the images like: background, eyes, mouths,...
* src folder it contains two files :
      <ul>
       <li>config.js : it contains the configuration for the NFT collection like : layers names and orders, attributes, weights, collection size, images format...</li>
       <li>main.js : the core of the engine it uses the information from the config file to draw the different layers and then save the resulting image and it's metadata into the build folder.</li>
      </ul>

### Smart contracts

The contract development and testing is done using the Hardhat framework in the smart_contracts folder, for this project there is two version of the ERC721 : the traditional ERC721Enumerable and the gas optimised ERC721A but currently only the first version is used. The ERC721 contract was modified to enable users whitelisting, custom minting prices and NFT reveal.

In the smart_contracts folder you'll find the deployment and testing scripts in the scripts and tests folder respectively, and there is also a config folder where you must provide your collection informations like token name & symbol, minting price for whitelisting, presale and public sale period and the whitelisted addresses...

### User interface
   
The front end is built with React JS, it allows users to mint new NFTS and they can find on the home page a complete roadmap for the entire NFT project, the app also give a simple admin dashboard for setting minting prices and managing the sales period ( whitelisting, presale, public sale).

The front-end is built using the following libraries:
      <ul>
        <li><b>Ethers.js:</b> used as interface between the UI and the deployed smart contract</li>
        <li><b>Web3modal:</b> for conecting to Metamask</li>
        <li><b>@reduxjs/toolkit & redux-persist:</b> for managing the app states (account, balance, blockchain) </li>
        <li><b>Material UI:</b> used for react components and styles </li>    
      </ul>
      
The main component is Mint.js which handles the nft minting and the coundown periods : 

![Capture d’écran 2022-07-04 à 18 54 45](https://user-images.githubusercontent.com/83681204/177201050-e93c2aad-4832-49b1-88bd-0f78297c394d.png)

The roadmap explains the steps followed in the NFT project progression :

![Capture d’écran 2022-07-04 à 18 58 28](https://user-images.githubusercontent.com/83681204/177201365-c446e19d-f5c8-4ee8-bf58-afbc9051f646.png)

The dashboard can be only be accessed by the nft contract owner from the account window when clicking on the account button in the top of the page, it gives the owner the possibility of withdraw the contract balance, changing nft minting parametres or changing contract state (whitelisting, presale, public sale):

![Capture d’écran 2022-08-03 à 21 07 41](https://user-images.githubusercontent.com/83681204/182701220-af3fd413-18dc-4f51-b253-674e0d85a863.png)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE GUIDE -->
## How to Run

### Prerequisites

Please install or have installed the following:
* [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/)
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) Chrome extension installed in your browser
* [Ganache](https://trufflesuite.com/ganache/) for local smart contracts deployement and testing
* [Pinata](https://www.pinata.cloud) account for IPFS storage (free account).

### Art generation

After installing node open a terminal in your code editor (VS Code for example) and clone this repository :
   ```sh
   git clone https://github.com/Aymen1001/Complete-NFT-Project.git
   ```

Then install the art engine dependancies by running :
   ```sh
   cd nft_generator
   yarn
   ```
   
This will install all libraries needed for creating the nfts, the next step is to add the differents layers, the art used for this collection is not of my creation, the orginal images can be downloaded [here](https://www.firevectors.com/2022/03/free-nft-layers-download.html?m=1) or you can use the ones i already edited and added rarities to them (the folder size was too big so i couldn't upload to Github), you can get them from Google drive with this [link](https://drive.google.com/drive/folders/1za0Wg11BrowiIOaWEGb2UE4fJexoJi5e?usp=sharing).

In the config file you can change the collection name and description (if you want), you can choose how many items you want to generate by changing the growEditionSizeTo variable and also the images size (format).
After finishing the configuration run the command to generate the items :
   ```sh
   yarn build
   ```

When the build ends you'll find the generated images in the images folder inside th build folder and their respective metadata in the json folder, the next step is to upload the images folder to IPFS with your previously created Pinata account, you can then copy the resulting CID and paste it in the config file :
   ```sh
   const baseUri = "ipfs://YOUR-IMAGES-CID";
   ```
Update the URIs for all the NFTs metadata files by running this command :

   ```sh
   yarn update_info
   ```
Now upload the final json folder to IPFS as you did with images folder.

Finally in the build folder you'll also find a hidden folder which contains the hidden NFT image&metadata used in the collection pre-reveal step,the hidden image must be uploaded to IPFS and its CID should be copied to the hidden metadata file which in the end must also be uploaded to IPFS to get the final hidden NFT URI. 

If you find problems going through the upload part you can refere back to hashlips Youtube video which explain each step perfectly [How to create an NFT collection - Masterclass](https://www.youtube.com/watch?v=Zhmj4PiJ-GA)

### Contracts

As mentioned before the contracts are developed with the Hardhat framework, before deploying them you must first install the required dependancies by running :
   ```sh
   cd smart_contracts
   yarn
   ```
   
Next you need to setup the environement variables in the .env file, this are used when deploying the contracts :

   ```sh
    RINKEBY_ETHERSCAN_API_KEY="your etherscan api key"
    RINKEBY_RPC_URL="Your rinkeby RPC url from alchemy or infura"
    POLYGON_RPC_URL="Your polygon RPC url from alchemy or infura"
    MUMBAI_RPC_URL="Your mumbai RPC url from alchemy or infura"
    PRIVATE_KEY="your private key"
   ```
* <b>NOTE :</b> Only the private key is needed when deploying to the ganache network, the others variables are for deploying to the testnets or real networks and etherscan api key is for verifying your contracts on rinkeby etherscan.

Then in the config folder you'll find the collection config file where you must add the NFT name & decription and the IPFS CID for both the nfts and the hidden nft those you get from pinata, you can also change the minting cost and the maximum supply.
   ```sh
    tokenName: "Classy Dogs Collection",
    tokenSymbol: 'CD',
    baseMetadataURI: "ipfs://YOUR-NFT-CID/",
    hiddenMetadataUri: 'ipfs://YOUR-Hidden-NFT-CID',
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
   ```

After going through all the configuration step, you'll need to deploy the smart contract to the ganache network by running: 
   ```sh
   cd hardhat
   yarn deploy --network ganache
   ```
This will create a config.js file and an artifacts folder and transfer them to the src folder to enable the interaction between the contract and the UI

* <b>IMPORTANT :</b> I used the ganache network for development purposes only, you can choose another testnet or real network if you want, for that you need to add it to the hardhat.config file for example for the rinkeby testnet  

   ```sh
   rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4,
    }
   ```

If you want to test the functionnalities of the NFT contract you can do it by running:
   ```sh
   yarn test
   ```
### Front end

To start the user interface just run the following commands :
   ```sh
   cd front-end
   yarn
   yarn start
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Ressources -->
## Ressources

If you want to learn more about NFT projects, these great tutorials may help:
* [How to create an NFT collection - Masterclass](https://www.youtube.com/watch?v=Zhmj4PiJ-GA) by hashlips
* [BEST NFT Collection Minting Site (dApp) - Entire Process! Whitelist & Launch a Collection (10,000+)](https://www.youtube.com/watch?v=cLB7u0KQFIs&t=270s)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Contact -->
## Contact

If you have any question or problem running this project just contact me: aymenMir1001@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
