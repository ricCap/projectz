// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../Manager.sol";
import "../AddressBook.sol";

library ProjectLibrary {
    /////// Events ////////
    event FundingReceived(address contributor, uint256 amount, uint256 currentTotal, uint256 indexProject);
    event CheckpointPassed(uint256 checkpointID, uint256 indexProject);
    event PartnerPaid(address partner, uint256 checkpointID, uint256 indexProject);
    event ProjectWaitingToStart(uint256 indexProject);

    function onlyAdmin(address _managerAddress) external view {
        require(isAdmin(_managerAddress), "only DEFAULT_ADMIN_ROLE can create templates");
    }

    function isAdmin(address _managerAddress) public view returns (bool) {
        Manager _manager = Manager(_managerAddress);
        AddressBook _addressBook = AddressBook(_manager.addressBookAddress());
        return _addressBook.hasRole(_addressBook.DEFAULT_ADMIN_ROLE(), msg.sender);
    }

    function isPartner(address _managerAddress) public view returns (bool) {
        Manager _manager = Manager(_managerAddress);
        AddressBook _addressBook = AddressBook(_manager.addressBookAddress());
        return _addressBook.hasRole(_addressBook.PARTNER_ROLE(), msg.sender);
    }
}
