import React from 'react'

function Roadmap() {
    return (
        <div id="raodmap" className="container-md roadmap" style={{ width: "600px" }}>
            <h4 className="text-heading text-center mb-5">NFT Roadmap</h4>
            <p style={{ textAlign: "left" }}>
                <span>Attributes</span><br />
                The 5000 NFTs will be updated with all their attributes visible on
                Phantom and rarity rank displayed on our website
            </p>
            <p style={{ textAlign: "right" }}>
                <span>Event</span><br />
                Competition between the NFT holders with special prizes for the winners.
            </p>
            <p style={{ textAlign: "left" }}>
                <span>Merch</span><br />
                Exclusive NFT Merch with limited edition for NFT holders
            </p>
            <p style={{ textAlign: "right" }}>
                <span>Marketplace</span><br />
                New marketplace will be released for Asset trading
            </p>
            <p style={{ textAlign: "left" }}>
                <span>Coming Soon</span><br />
                More details coming soon...
            </p>
        </div>
    )
}

export default Roadmap