// SPDX-License-Identifier: MIT

pragma solidity >=0.8.7 <0.9.0;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftLowGasContract is ERC721AQueryable, Ownable, ReentrancyGuard {
    //--------------------------------------------------------------------
    // VARIABLES

    using Strings for uint256;

    string public uriPrefix = "";
    string public uriSuffix = ".json";
    string public hiddenMetadataUri;

    uint256 public cost;
    uint256 public immutable maxSupply;
    uint256 public maxMintAmountPerTx;

    bool public paused = true;
    bool public whitelistMintEnabled = false;
    bool public revealed = false;

    bytes32 public merkleRoot;

    //--------------------------------------------------------------------
    // ERRORS

    error NFT__ContractIsPaused();
    error NFT__InvalidMintAmount();
    error NFT__MaxSupplyExceeded();
    error NFT__WhitelistNotEnabled();
    error NFT__OnlyWhitelistMint();
    error NFT__AlreadyClaimed(address user);
    error NFT__InvalidProof(address user);
    error NFT__InsufficientFunds();
    error NFT__QueryForNonExistentToken(uint256 tokenId);

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier isPaused() {
        if (paused) revert NFT__ContractIsPaused();
        _;
    }

    modifier mintCompliance(uint256 _mintAmount) {
        if (_mintAmount == 0 || _mintAmount > maxMintAmountPerTx) {
            revert NFT__InvalidMintAmount();
        }
        if (totalSupply() + _mintAmount > maxSupply) {
            revert NFT__MaxSupplyExceeded();
        }
        _;
    }

    modifier mintPriceCompliance(uint256 _mintAmount) {
        if (msg.value < cost * _mintAmount) revert NFT__InsufficientFunds();
        _;
    }

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmountPerTx,
        string memory _hiddenMetadataUri
    ) ERC721A(_tokenName, _tokenSymbol) {
        maxSupply = _maxSupply;
        hiddenMetadataUri = _hiddenMetadataUri;
        cost = _cost;
        maxMintAmountPerTx = _maxMintAmountPerTx;
    }

    //--------------------------------------------------------------------
    // FUNCTIONS

    function whitelistMint(uint256 _mintAmount, bytes32[] calldata _merkleProof)
        external
        payable
        isPaused
        mintCompliance(_mintAmount)
        mintPriceCompliance(_mintAmount)
    {
        // Verify whitelist requirements
        if (!whitelistMintEnabled) revert NFT__WhitelistNotEnabled();
        address user = _msgSender();
        if (balanceOf(user) != 0) revert NFT__AlreadyClaimed(user);
        bytes32 leaf = keccak256(abi.encodePacked(user));
        if (!MerkleProof.verify(_merkleProof, merkleRoot, leaf)) {
            revert NFT__InvalidProof(user);
        }
        _safeMint(user, _mintAmount);
    }

    function mint(uint256 _mintAmount)
        external
        payable
        isPaused
        mintCompliance(_mintAmount)
        mintPriceCompliance(_mintAmount)
    {
        if (whitelistMintEnabled) revert NFT__OnlyWhitelistMint();
        _safeMint(_msgSender(), _mintAmount);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(_tokenId)) revert NFT__QueryForNonExistentToken(_tokenId);

        if (revealed == false) {
            return hiddenMetadataUri;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        _tokenId.toString(),
                        uriSuffix
                    )
                )
                : "";
    }
    
    //--------------------------------------------------------------------
    // OWNER FUNCTIONS

    function setRevealed(bool _state) external payable onlyOwner {
        revealed = _state;
    }

    function setCost(uint256 _cost) external payable onlyOwner {
        cost = _cost;
    }

    function setMaxMintAmountPerTx(uint256 _maxMintAmountPerTx)
        external
        payable
        onlyOwner
    {
        maxMintAmountPerTx = _maxMintAmountPerTx;
    }

    function setHiddenMetadataUri(string memory _hiddenMetadataUri)
        external
        payable
        onlyOwner
    {
        hiddenMetadataUri = _hiddenMetadataUri;
    }

    function setUriPrefix(string memory _uriPrefix) external payable onlyOwner {
        uriPrefix = _uriPrefix;
    }

    function setUriSuffix(string memory _uriSuffix) external payable onlyOwner {
        uriSuffix = _uriSuffix;
    }

    function setPaused(bool _state) external payable onlyOwner {
        paused = _state;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external payable onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function setWhitelistMintEnabled(bool _state) external payable onlyOwner {
        whitelistMintEnabled = _state;
    }

    function withdraw() external payable onlyOwner nonReentrant {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
    
    //--------------------------------------------------------------------
    // Internal FUNCTIONS

    function _baseURI() internal view virtual override returns (string memory) {
        return uriPrefix;
    }
    
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
