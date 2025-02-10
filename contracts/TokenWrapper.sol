// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TokenWrapper is ERC20, ERC721, Ownable, Pausable {
    mapping(uint256 => bool) public nftExists;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC20("Wrapped Token", "WRAP") ERC721("Wrapped NFT", "WNFT") {}

    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
    }

    function mintNFT(
        address _to,
        uint256 _tokenId,
        string calldata _tokenURI
    ) external onlyOwner {
        require(!nftExists[_tokenId], "NFT already exists");
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        nftExists[_tokenId] = true;
    }

    function burnNFT(uint256 _tokenId) external onlyOwner {
        require(nftExists[_tokenId], "NFT does not exist");
        _burn(_tokenId);
        delete nftExists[_tokenId];
        delete _tokenURIs[_tokenId];
    }

    function transferNFTFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external onlyOwner {
        _transfer(_from, _to, _tokenId);
    }

    function transferNFT(address _to, uint256 _tokenId) external onlyOwner {
        _transfer(address(this), _to, _tokenId);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(nftExists[_tokenId], "NFT does not exist");
        return _tokenURIs[_tokenId];
    }

    function _setTokenURI(uint256 _tokenId, string memory _tokenURI) internal {
        _tokenURIs[_tokenId] = _tokenURI;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}