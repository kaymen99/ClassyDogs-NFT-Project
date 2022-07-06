import React, { useState, useEffect } from 'react'
import "../assets/css/styles.css";
import NavBar from "../components/NavBar";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { Button } from '@mui/material';
import { CircularProgress } from "@mui/material"

import nftContract from "../artifacts/NftContract.sol/NFTNormal.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";
import { CollectionConfig } from "../utils/CollectionConfig"

function OwnerDashboard() {
  const data = useSelector((state) => state.blockchain.value)

  const [mintingState, setMintingState] = useState({
    paused: true,
    whitelisting: false,
    presale: false,
    publicSale: false
  })
  const [loading, setLoading] = useState(false)

  const getMintingState = async () => {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, provider);

      const paused = await nft_contract.paused()
      const revealed = await nft_contract.revealed()
      const whitelisting = await nft_contract.whitelistMintEnabled()

      setMintingState({
        paused: paused,
        whitelisting: whitelisting,
        presale: ((!revealed && !whitelisting) && !paused),
        publicSale: revealed
      })
    }
  }

  const startWhitelisting = async () => {
    if (data.network === networksMap[networkDeployedTo] && mintingState.paused) {
      if (!mintingState.whitelisting) {
        try {
          setLoading(true)
          const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
          const signer = provider.getSigner()
          const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, signer);

          console.log("starting whitelist sale")

          const whitelist_tx = await nft_contract.startWhitelisting()
          await whitelist_tx.wait()

          setLoading(false)
          getMintingState()

        } catch (error) {
          setLoading(false)
          window.alert("An error has occured, Please Try Again")
          console.log(error)
        }
      }
    }
  }

  const startPresale = async () => {
    if (data.network === networksMap[networkDeployedTo] && mintingState.whitelisting) {
      try {
        setLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, signer);

        let newCost = ethers.utils.parseEther(CollectionConfig.preSale.price.toString(), "ether")
        let maxMintAmount = CollectionConfig.preSale.maxMintAmountPerTx
        const presale_tx = await nft_contract.startPresale(
          newCost,
          maxMintAmount
        )
        await presale_tx.wait()

        setLoading(false)
        getMintingState()

      } catch (error) {
        setLoading(false)
        window.alert("An error has occured, Please Try Again")
        console.log(error)
      }
    }
  }

  const startPublicSale = async () => {
    if (data.network === networksMap[networkDeployedTo] && mintingState.presale) {
      try {
        setLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, signer);

        let newCost = ethers.utils.parseEther(CollectionConfig.publicSale.price.toString(), "ether")
        let maxMintAmount = CollectionConfig.publicSale.maxMintAmountPerTx
        const publicSale_tx = await nft_contract.startPublicSale(
          CollectionConfig.baseMetadataURI,
          newCost,
          maxMintAmount
        )
        await publicSale_tx.wait()

        setLoading(false)
        getMintingState()

      } catch (error) {
        setLoading(false)
        window.alert("An error has occured, Please Try Again")
        console.log(error)
      }
    }
  }

  useEffect(() => {
    getMintingState()
  }, [])


  return (
    <div className="home" >
      <NavBar />
      <div className="mint-section">
        <h1>Contract Owner Dashboard</h1>
        <div className="mint-container">
          {mintingState.paused ? (
            <>
              <p>Nft Contract is paused </p>
              <Button className='bt-linear'
                variant="contained"
                color="primary"
                onClick={startWhitelisting}>
                {loading ? <CircularProgress color="inherit" /> : "Start Whitelisting"}
              </Button>
            </>

          ) : mintingState.whitelisting ? (
            <>
              <p>Nft Contract is in whitelisting period </p>
              <Button className='bt-linear'
                variant="contained"
                color="primary"
                onClick={startPresale}>
                {loading ? <CircularProgress color="inherit" /> : "Start Presale"}
              </Button>
            </>

          ) : mintingState.presale ? (
            <>
              <p>Nft Contract is in presale period </p>
              <Button className='bt-linear'
                variant="contained"
                color="primary"
                onClick={startPublicSale}>
                {loading ? <CircularProgress color="inherit" /> : "Reveal"}
              </Button>
            </>
          ) : (
            <p>Public minting is now open </p>
          )}
        </div>
      </div >
    </div>
  )
}

export default OwnerDashboard;
