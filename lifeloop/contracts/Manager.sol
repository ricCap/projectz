// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Manager is AccessControl {
    bytes32 public constant PARTNER_ROLE = keccak256("PARTNER_ROLE");
    bytes32 public constant UNKOWN_ROLE = keccak256("UNKOWN_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getRole() public view returns (string memory) {
        if (hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            return "DEFAULT_ADMIN_ROLE";
        } else if (hasRole(PARTNER_ROLE, msg.sender)) {
            return "PARTNER_ROLE";
        } else {
            return "UNKOWN_ROLE";
        }
    }
}
