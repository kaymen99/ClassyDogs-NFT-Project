import React from 'react'

function Roadmap() {
    return (
        <div id="raodmap" className="container-md roadmap" style={{ width: "600px" }}>
            <h4 className="text-heading text-center mb-5">NFT Roadmap</h4>
            <p style={{ textAlign: "left" }}>
                <span>Art Generation</span><br />
                A total of 10000 Classy Dogs NFTs were generated programmaticly and stored into IPFS.
            </p>
            <p style={{ textAlign: "right" }}>
                <span>whitelisting</span><br />
                People already in the whitelist can start minting up to 5 NFTS before everyone else.
            </p>
            <p style={{ textAlign: "left" }}>
                <span>Presale</span><br />
                A period will open for people to mint unrevealed NFTs to spice things up.
            </p>
            <p style={{ textAlign: "right" }}>
                <span>Reveal</span><br />
                The final NFTs reveal will happen and everyone will enjoy their Classy Dogs
            </p>
            <p style={{ textAlign: "left" }}>
                <span>Coming Soon</span><br />
                More details coming soon...
            </p>
        </div>
    )
}

export default Roadmap
