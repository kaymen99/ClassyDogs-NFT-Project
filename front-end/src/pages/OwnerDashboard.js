import React, { useState, useEffect } from 'react'
import "../assets/css/styles.css";
import NavBar from "../components/NavBar";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { Form } from "react-bootstrap";
import { Button } from '@mui/material';
import { CircularProgress } from "@mui/material"

import nftContract from "../artifacts/NftContract.sol/NFTNormal.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";
import { CollectionConfig } from "../utils/CollectionConfig"

function OwnerDashboard() {
  const data = useSelector((state) => state.blockchain.value)

  const [mintingState, setMintingState] = useState({
    balance: 0,
    maxMintAmountPerTx: 1,
    mintCost: 0,
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

      const _balance = await provider.getBalance(contractAddress);
      const paused = await nft_contract.paused()
      const revealed = await nft_contract.revealed()
      const whitelisting = await nft_contract.whitelistMintEnabled()
      const maxMintAmountPerTx = await nft_contract.maxMintAmountPerTx()
      const cost = await nft_contract.cost()

      setMintingState({
        balance: ethers.utils.formatUnits(_balance, "ether"),
        maxMintAmountPerTx: Number(maxMintAmountPerTx),
        mintCost: Number(ethers.utils.formatUnits(cost, "ether")),
        paused: paused,
        whitelisting: whitelisting,
        presale: ((!revealed && !whitelisting) && !paused),
        publicSale: revealed
      })
    }
  }

  const changeMintCost = async () => {
    if (data.network === networksMap[networkDeployedTo]) {
      try {
        setLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, signer);

        const _newCost = ethers.utils.parseEther(String(mintingState.mintCost), "ether")
        const change_tx = await nft_contract.setCost(_newCost)
        await change_tx.wait()

        setLoading(false)
        getMintingState()

      } catch (error) {
        setLoading(false)
        window.alert("An error has occured, Please Try Again")
        console.log(error)
      }
    }
  }

  const changeMaxMintAmount = async () => {
    if (data.network === networksMap[networkDeployedTo]) {
      try {
        setLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, signer);

        const change_tx = await nft_contract.setMaxMintAmountPerTx(Number(mintingState.maxMintAmountPerTx))
        await change_tx.wait()

        setLoading(false)
        getMintingState()

      } catch (error) {
        setLoading(false)
        window.alert("An error has occured, Please Try Again")
        console.log(error)
      }
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

  const withdraw = async () => {
    if (data.network === networksMap[networkDeployedTo] && mintingState.presale) {
      try {
        setLoading(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, signer);

        const withdraw_tx = await nft_contract.withdraw()
        await withdraw_tx.wait()

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
        <h1>Owner Dashboard</h1>
        <div className="mint-container">
          {mintingState.paused ? (
            <div className="container"
              style={{ textAlign: "left", display: "grid", justifyContent: "center", alignItems: "center", paddingTop: "4rem", paddingBottom: "4rem", paddingLeft: "20%", color: "#fff" }}>
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Current contract balance : {mintingState.balance} ETH</label>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={withdraw}>
                    {loading ? <CircularProgress color="inherit" /> : "withdraw"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Max Nft minted per transaction : </label>
                  <Form.Control type="Number"
                    value={mintingState.maxMintAmountPerTx}
                    onChange={(e) => setMintingState({ ...mintingState, maxMintAmountPerTx: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMaxMintAmount}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>NFT mint cost (ETH) : </label>
                  <Form.Control type="Number"
                    value={mintingState.mintCost}
                    onChange={(e) => setMintingState({ ...mintingState, mintCost: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMintCost}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
              <br />
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Nft Contract is paused </label>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={startWhitelisting}>
                    {loading ? <CircularProgress color="inherit" /> : "Start Whitelisting"}
                  </Button>
                </div>
              </div>
            </div>
          ) : mintingState.whitelisting ? (
            <div className="container"
              style={{ textAlign: "left", display: "grid", justifyContent: "center", alignItems: "center", paddingTop: "4rem", paddingBottom: "4rem", paddingLeft: "20%", color: "#fff" }}>
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Current contract balance : {mintingState.balance} ETH</label>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={withdraw}>
                    {loading ? <CircularProgress color="inherit" /> : "withdraw"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>

                <div style={{ width: "400px" }}>
                  <label>Max Nft minted per transaction : </label>
                  <Form.Control type="Number"
                    value={mintingState.maxMintAmountPerTx}
                    onChange={(e) => setMintingState({ ...mintingState, maxMintAmountPerTx: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMaxMintAmount}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>NFT mint cost (ETH) : </label>
                  <Form.Control type="Number"
                    value={mintingState.mintCost}
                    onChange={(e) => setMintingState({ ...mintingState, mintCost: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMintCost}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
              <br />
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Nft Contract is in whitelisting state </label>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={startPresale}>
                    {loading ? <CircularProgress color="inherit" /> : "Start Presale"}
                  </Button>
                </div>
              </div>
            </div>
          ) : mintingState.presale ? (
            <div className="container"
              style={{ textAlign: "left", display: "grid", justifyContent: "center", alignItems: "center", paddingTop: "4rem", paddingBottom: "4rem", paddingLeft: "20%", color: "#fff" }}>
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Current contract balance : {mintingState.balance} ETH</label>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={withdraw}>
                    {loading ? <CircularProgress color="inherit" /> : "withdraw"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>

                <div style={{ width: "400px" }}>
                  <label>Max Nft minted per transaction : </label>
                  <Form.Control type="Number"
                    value={mintingState.maxMintAmountPerTx}
                    onChange={(e) => setMintingState({ ...mintingState, maxMintAmountPerTx: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMaxMintAmount}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>NFT mint cost (ETH) : </label>
                  <Form.Control type="Number"
                    value={mintingState.mintCost}
                    onChange={(e) => setMintingState({ ...mintingState, mintCost: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMintCost}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
              <br />
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Nft Contract is in presale mode </label>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={startPublicSale}>
                    {loading ? <CircularProgress color="inherit" /> : "Start PublicSale"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="container"
              style={{ textAlign: "left", display: "grid", justifyContent: "center", alignItems: "center", paddingTop: "4rem", paddingBottom: "4rem", paddingLeft: "20%", color: "#fff" }}>
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>Current contract balance : {mintingState.balance} ETH</label>
                </div>
                <div style={{ paddingLeft: "10px" }}>
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={withdraw}>
                    {loading ? <CircularProgress color="inherit" /> : "withdraw"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>

                <div style={{ width: "400px" }}>
                  <label>Max Nft minted per transaction : </label>
                  <Form.Control type="Number"
                    value={mintingState.maxMintAmountPerTx}
                    onChange={(e) => setMintingState({ ...mintingState, maxMintAmountPerTx: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMaxMintAmount}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
              <br />
              <div style={{ width: "700px", display: "flex" }}>
                <div style={{ width: "400px" }}>
                  <label>NFT mint cost (ETH) : </label>
                  <Form.Control type="Number"
                    value={mintingState.mintCost}
                    onChange={(e) => setMintingState({ ...mintingState, mintCost: e.target.value })}
                  />
                </div>
                <div style={{ paddingLeft: "10px", paddingTop: "25px" }} >
                  <Button className='bt-linear'
                    variant="contained"
                    color="primary"
                    onClick={changeMintCost}>
                    {loading ? <CircularProgress color="inherit" /> : "Change"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </div>
  )
}

export default OwnerDashboard;
