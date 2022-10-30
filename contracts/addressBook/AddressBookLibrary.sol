// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../IManager.sol";
import "./IAddressBook.sol";

library AddressBookLibrary {
    function onlyAdmin(address _managerAddress) external view {
        require(isAdmin(_managerAddress), "only DEFAULT_ADMIN_ROLE can create templates");
    }

    function isAdmin(address _managerAddress) public view returns (bool) {
        IManager _manager = IManager(_managerAddress);
        IAddressBook _addressBook = IAddressBook(_manager.addressBookAddress());
        return _addressBook.hasRole(_addressBook.DEFAULT_ADMIN_ROLE(), msg.sender);
    }

    function isPartner(address _managerAddress) public view returns (bool) {
        IManager _manager = IManager(_managerAddress);
        IAddressBook _addressBook = IAddressBook(_manager.addressBookAddress());
        return _addressBook.hasRole(_addressBook.PARTNER_ROLE(), msg.sender);
    }

    function addParticipant(address _managerAddress, address _userAddress) external {
        IManager _manager = IManager(_managerAddress);
        IAddressBook _addressBook = IAddressBook(_manager.addressBookAddress());
        _addressBook.addUser(_userAddress);
        _addressBook.grantRole(_addressBook.PARTICIPANT_ROLE(), _userAddress);
    }

    function addDonor(address _managerAddress, address _userAddress) external {
        IManager _manager = IManager(_managerAddress);
        IAddressBook _addressBook = IAddressBook(_manager.addressBookAddress());
        _addressBook.addUser(_userAddress);
        _addressBook.grantRole(_addressBook.DONOR_ROLE(), _userAddress);
    }

    function addPartner(address _managerAddress, address _userAddress) external {
        IManager _manager = IManager(_managerAddress);
        IAddressBook _addressBook = IAddressBook(_manager.addressBookAddress());
        _addressBook.addUser(_userAddress);
        _addressBook.grantRole(_addressBook.PARTNER_ROLE(), _userAddress);
    }

    function userExists(address _managerAddress, address _userAddress) public view returns (bool) {
        IManager _manager = IManager(_managerAddress);
        IAddressBook _addressBook = IAddressBook(_manager.addressBookAddress());
        return _addressBook.userExists(_userAddress);
    }
}
