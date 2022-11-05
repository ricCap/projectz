// SPDX-License-Identifier: MIT

import "./ProjectsLibrary.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

pragma solidity ^0.8.17;

/** Default project template
 * @dev make sure to inherit from this contract when creating project templates
 */
abstract contract DefaultProjectTemplate is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter internal _tokenIdCounter;

    // solhint-disable-next-line no-empty-blocks
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /** Mint a new project from this */
    function safeMint() public virtual returns (uint256 _tokenId) {
        _tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, _tokenId);
        emit ProjectsLibrary.ProjectMinted(name(), symbol(), _tokenId);
        return _tokenId;
    }
}
