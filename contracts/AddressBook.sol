// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * Manager contract that owns the other parts of the application
 * @dev currently handles access control as well
 */
contract AddressBook is AccessControl {
    // roles
    bytes32 public constant PARTNER_ROLE = keccak256("PARTNER_ROLE");
    bytes32 public constant PARTICIPANT_ROLE = keccak256("PARTICIPANT_ROLE");
    bytes32 public constant DONOR_ROLE = keccak256("DONOR_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
