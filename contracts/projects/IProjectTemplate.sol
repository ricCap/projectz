// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.9;

/**
 * @dev All project templates should implement this interface
 */
interface IProjectTemplate is IERC721 {
    /**
     * @dev Mint a new project and return the projectID
     */
    function safeMint() external returns (uint256 _tokenId);
}
