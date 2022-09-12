// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/**
 * @dev All projects should implement this interface
 */
interface IProjectTemplate {
    /**
     * @dev Mint a new project and return the projectID
     */
    function safeMint() external returns (uint256 _tokenId);
}
