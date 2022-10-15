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

    function onlyAdmin(address _addressBookAddress) external view {
        Manager _manager = Manager(_addressBookAddress);
        AddressBook _addressBook = AddressBook(_manager.addressBookAddress());
        require(
            _addressBook.hasRole(_addressBook.DEFAULT_ADMIN_ROLE(), msg.sender),
            "only DEFAULT_ADMIN_ROLE can create templates"
        );
    }
}
