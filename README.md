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
The main component is Mint.js which handles the nft minting and the coundown periods 

![Capture d’écran 2022-07-04 à 18 54 45](https://user-images.githubusercontent.com/83681204/177201050-e93c2aad-4832-49b1-88bd-0f78297c394d.png)

The roadmap explains the steps followed in the NFT project progression

![Capture d’écran 2022-07-04 à 18 58 28](https://user-images.githubusercontent.com/83681204/177201365-c446e19d-f5c8-4ee8-bf58-afbc9051f646.png)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE GUIDE -->
## How to Run

### Prerequisites

Please install or have installed the following:
* [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/)
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) Chrome extension installed in your browser
* [Ganache](https://trufflesuite.com/ganache/) for local smart contracts deployement and testing
* [Pinata](https://www.pinata.cloud) account for IPFS storage (free account).


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
