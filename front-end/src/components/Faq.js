import React from "react";
import "../assets/css/styles.css";
import "bootstrap/dist/css/bootstrap.css";

function Faq() {
  return (
    <div className="faq container" id="FAQ">
      <h1 className="faqhead text-center">Frequently asked questions</h1>
      <div className="faq-questions">
        <details open="">
          <summary>What is ClassyDogs?</summary>
          <div className="faq__content">
            <p>
              ClassyDogs is a project within the Ethereum blockchain. Based on a
              10000+ collection of cool NFTs.
            </p>
          </div>
        </details>
        <details>
          <summary>When can i buy a ClassyDog?</summary>
          <div className="faq__content">
            <p>
              The NFTs pre sale date is September 23 at 19:00 UTC. Follow our
              official channels to find out the latest news.
            </p>
          </div>
        </details>
        <details>
          <summary>What wallet can i use?</summary>
          <div className="faq__content">
            <p>We currently only support the Metamask wallet.</p>
          </div>
        </details>
        <details>
          <summary>What is the price of nft?</summary>
          <div className="faq__content">
            <p>
              For the presale period the price will be set at 0.07 ETH. Public
              sale price will then be 0.09 ETH.
            </p>
          </div>
        </details>
        <details>
          <summary>Where can I sell my nft?</summary>
          <div className="faq__content">
            <p>
              You can sell and trade your ClassyDogs on any popular NFT
              marketplace like opensea.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default Faq;
