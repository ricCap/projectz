// SPDX-License-Identifier: MIT

import "../Manager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

pragma solidity ^0.8.17;

/** Default project template
 * @dev make sure to inherit from this contract when creating project templates
 */
abstract contract DefaultProjectTemplate is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    event ProjectMinted(string name_, string symbol_, uint256 _projectIndex);

    Counters.Counter private _tokenIdCounter;

    // solhint-disable-next-line no-empty-blocks
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /** Mint a new project from this */
    function safeMint() public virtual returns (uint256 _tokenId) {
        Manager _manager = Manager(owner());
        require(
            _manager.hasRole(_manager.DEFAULT_ADMIN_ROLE(), msg.sender),
            "only DEFAULT_ADMIN_ROLE can create templates"
        );
        _tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, _tokenId);
        emit ProjectMinted(name(), symbol(), _tokenId);
        return _tokenId;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
