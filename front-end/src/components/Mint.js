import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { Button } from '@mui/material';
import { CircularProgress } from "@mui/material"

import nftContract from "../artifacts/NftContract.sol/NFTNormal.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";
import CountDown from "./CountDown";

const countdownPeriods = {
    drop: new Date("July 02,2022 ").getTime(),
    whitelisting: new Date("July 10,2022 ").getTime(),
    presale: new Date("July 15,2022 ").getTime(),
}

function Mint() {
    const data = useSelector((state) => state.blockchain.value)

    const [mintingState, setMintingState] = useState({
        userNftsCount: 0,
        currentSupply: 0,
        maxSupply: 0,
        maxMintAmountPerTx: 1,
        mintCost: 0,
        paused: true,
        whitelisting: false,
        presale: false,
        publicSale: false
    })
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(1)

    const mintNewNft = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, signer);

                const totalMintCost = mintingState.mintCost * amount
                const costInEth = ethers.utils.parseEther(totalMintCost.toString(), "ether")
                const mint_tx = await nft_contract.mint(amount, { value: costInEth })
                await mint_tx.wait()

                setLoading(false)
                getMintingState()
                setAmount(1)
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured while minting, Try Again")
                console.log(error)
            }
        }
    }

    const getMintingState = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const signer = provider.getSigner()
            const nft_contract = new ethers.Contract(contractAddress, nftContract.abi, provider);

            const currentSupply = await nft_contract.totalSupply()
            const maxSupply = await nft_contract.maxSupply()
            const maxMintAmountPerTx = await nft_contract.maxMintAmountPerTx()
            const paused = await nft_contract.paused()
            const revealed = await nft_contract.revealed()
            const whitelisting = await nft_contract.whitelistMintEnabled()
            const cost = await nft_contract.cost()
            const mintCost = Number(ethers.utils.formatUnits(cost, "ether"))
            const _userNftsCount = await nft_contract.balanceOf(await signer.getAddress())

            setMintingState({
                userNftsCount: Number(_userNftsCount),
                currentSupply: Number(currentSupply),
                maxSupply: Number(maxSupply),
                maxMintAmountPerTx: Number(maxMintAmountPerTx),
                mintCost: mintCost,
                paused: paused,
                whitelisting: whitelisting,
                presale: ((!revealed && !whitelisting) && !paused),
                publicSale: revealed
            })
        }
    }

    const handleIncrement = () => {
        setAmount(amount + 1)

    }
    const handleDecrement = () => {
        setAmount(amount - 1)
    }

    useEffect(() => {
        getMintingState()
    }, [])

    return (
        <div className="mint-section">
            <h1>Mint Your NFT Now </h1>
            <div className="mint-container">
                {mintingState.paused ? (
                    <>
                        <p>Nft Drop will start in : </p>
                        <CountDown date={countdownPeriods.whitelisting} />
                    </>

                ) : mintingState.whitelisting ? (
                    <>
                        <p>NFT Whitelisting Period Ends in : </p>
                        <CountDown date={countdownPeriods.whitelisting} />
                    </>

                ) : mintingState.presale ? (
                    <>
                        <p>NFT Presale Period Ends in : </p>
                        <CountDown date={countdownPeriods.whitelisting} />
                    </>
                ) : (
                    <p>Public minting is open now : </p>
                )}

                {data.network !== networksMap[networkDeployedTo] ? (
                    <p>Please switch to the {networksMap[networkDeployedTo]} network</p>
                ) : (
                    data.account !== "" ? (
                        <>
                            <p>
                                {mintingState.currentSupply} NFTs already minted out of our {mintingState.maxSupply} Classy Dogs collection
                            </p>
                            <p>You are the owner of {mintingState.userNftsCount} ClassyDogs </p>
                            <div className="d-flex justify-content-center">
                                <button type="button"
                                    className="minus btn btn-danger rounded-circle"
                                    disabled={amount === 1}
                                    onClick={handleDecrement}>-</button>
                                <input type="number" className="mintnum text-center" readOnly value={amount} />
                                <button type="button"
                                    className="plus btn btn-danger rounded-circle"
                                    disabled={amount === mintingState.maxMintAmountPerTx}
                                    onClick={handleIncrement}>+</button>
                            </div>
                            <Button className='bt-linear'
                                variant="contained"
                                color="primary"
                                onClick={mintNewNft}>
                                {loading ? <CircularProgress color="inherit" /> : "Mint"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <p>{mintingState.currentSupply} NFTs already minted out of our {mintingState.maxSupply} Classy Dogs collection</p>
                            <p>You must be connected to mint</p>
                        </>

                    )
                )}

            </div>
        </div >
    )
}

export default Mint
