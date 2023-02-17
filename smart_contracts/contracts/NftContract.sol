// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTNormal is ERC721Enumerable, Ownable {
    //--------------------------------------------------------------------
    // VARIABLES
    using Strings for uint256;

    string public baseURI;
    string public baseExtension = ".json";
    string public hiddenMetadataUri;

    uint256 public immutable maxSupply;
    uint256 public cost;
    uint256 public maxMintAmountPerTx;
    // Number of nfts is limited to 3 per user during whitelisting
    uint256 public nftPerAddressLimit = 3;

    bool public paused = true;
    bool public revealed;
    bool public whitelistMintEnabled;

    address[] public whitelistedAddresses;
    mapping(address => uint256) public addressMintedBalance;

    //--------------------------------------------------------------------
    // ERRORS

    error NFT__ContractIsPaused();
    error NFT__InvalidMintAmount();
    error NFT__ExceededMaxMintAmountPerTx();
    error NFT__MaxSupplyExceeded();
    error NFT__ExceededMaxNftPerAddress();
    error NFT__NotWhitelisted(address user);
    error NFT__InsufficientFunds();
    error NFT__QueryForNonExistentToken(uint256 tokenId);

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmountPerTx,
        string memory _hiddenMetadataUri
    ) ERC721(_name, _symbol) {
        hiddenMetadataUri = _hiddenMetadataUri;
        cost = _cost;
        maxMintAmountPerTx = _maxMintAmountPerTx;
        maxSupply = _maxSupply;
    }

    //--------------------------------------------------------------------
    // FUNCTIONS

    function mint(uint256 _mintAmount) external payable {
        if (paused) revert NFT__ContractIsPaused();
        if (_mintAmount == 0) revert NFT__InvalidMintAmount();
        if (_mintAmount > maxMintAmountPerTx) {
            revert NFT__ExceededMaxMintAmountPerTx();
        }
        uint256 supply = totalSupply();
        if (supply + _mintAmount > maxSupply) {
            revert NFT__MaxSupplyExceeded();
        }

        if (msg.sender != owner()) {
            if (whitelistMintEnabled && !isWhitelisted(msg.sender))
                revert NFT__NotWhitelisted(msg.sender);
            if (msg.value < cost * _mintAmount) revert NFT__InsufficientFunds();

            uint256 mintedCount = addressMintedBalance[msg.sender];
            if (mintedCount + _mintAmount > nftPerAddressLimit)
                revert NFT__ExceededMaxNftPerAddress();
            unchecked {
                addressMintedBalance[msg.sender] = mintedCount + _mintAmount;
            }
        }

        for (uint256 i = 1; i <= _mintAmount; ) {
            _safeMint(msg.sender, supply + i);
            unchecked {
                ++i;
            }
        }
    }

    function isWhitelisted(address _user) public view returns (bool) {
        uint256 whitelistedCount = whitelistedAddresses.length;
        for (uint256 i; i < whitelistedCount; ) {
            if (whitelistedAddresses[i] == _user) {
                return true;
            }
            unchecked {
                ++i;
            }
        }
        return false;
    }

    function walletOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; ) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
            unchecked {
                ++i;
            }
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert NFT__QueryForNonExistentToken(tokenId);
        if (!revealed) return hiddenMetadataUri;

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    //--------------------------------------------------------------------
    // OWNER FUNCTIONS

    function reveal(string memory _newBaseURI) external payable onlyOwner {
        revealed = true;
        setBaseURI(_newBaseURI);
    }

    function setNftPerAddressLimit(uint256 _limit) external payable onlyOwner {
        nftPerAddressLimit = _limit;
    }

    function setCost(uint256 _newCost) external payable onlyOwner {
        cost = _newCost;
    }

    function setMaxMintAmountPerTx(uint256 _newmaxMintAmount)
        external
        payable
        onlyOwner
    {
        maxMintAmountPerTx = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public payable onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension)
        external
        payable
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function setHiddenMetadataUri(string memory _hiddenMetadataUri)
        external
        payable
        onlyOwner
    {
        hiddenMetadataUri = _hiddenMetadataUri;
    }

    function pause(bool _state) external payable onlyOwner {
        paused = _state;
    }

    function setWhitelistMintEnabled(bool _state) external payable onlyOwner {
        whitelistMintEnabled = _state;
    }

    function whitelistUsers(address[] calldata _users)
        external
        payable
        onlyOwner
    {
        delete whitelistedAddresses;
        whitelistedAddresses = _users;
    }

    function withdraw() external payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success);
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
