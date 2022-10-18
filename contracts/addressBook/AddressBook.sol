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

    bytes32 public constant MANAGER_PARTNER_ROLE = keccak256("MANAGER_PARTNER_ROLE");
    bytes32 public constant MANAGER_PARTICIPANT_ROLE = keccak256("MANAGER_PARTICIPANT_ROLE");
    bytes32 public constant MANAGER_DONOR_ROLE = keccak256("MANAGER_DONOR_ROLE");

    // variables
    mapping(uint256 => address) private userIdToAddress;
    mapping(address => uint256) private addressToUserId;
    uint256 private numberOfUsers;

    // events
    event UserAdded(uint256 _userId, address _address);
    event UserAddressUpdated(uint256 _userId, address _address, address _newAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_PARTNER_ROLE, msg.sender);
        _grantRole(MANAGER_PARTICIPANT_ROLE, msg.sender);
        _grantRole(MANAGER_DONOR_ROLE, msg.sender);
        _setRoleAdmin(MANAGER_PARTNER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(MANAGER_PARTICIPANT_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(MANAGER_DONOR_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PARTNER_ROLE, MANAGER_PARTNER_ROLE);
        _setRoleAdmin(PARTICIPANT_ROLE, MANAGER_PARTICIPANT_ROLE);
        _setRoleAdmin(DONOR_ROLE, MANAGER_DONOR_ROLE);
        _addUser(msg.sender);
    }

    function userExists(address _address) public view returns (bool) {
        uint256 _userId = addressToUserId[_address];
        if (_userId == 0) {
            // only the DEFAULT_ADMIN_ROLE can have index 0
            return hasRole(DEFAULT_ADMIN_ROLE, _address);
        }
        return true;
    }

    function addUser(address _address) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "only admin can add users");
        require(!userExists(_address), "user with this account already exists");
        _addUser(_address);
    }

    function _addUser(address _address) private {
        userIdToAddress[numberOfUsers] = _address;
        addressToUserId[_address] = numberOfUsers;
        numberOfUsers++;
        emit UserAdded(numberOfUsers - 1, _address);
    }

    function getAddress(uint256 _userId) public view returns (address) {
        require(_userId < numberOfUsers, "user does not exist");
        return userIdToAddress[_userId];
    }

    function getUserId(address _address) public view returns (uint256 result) {
        result = addressToUserId[_address];
        if (result == 0) {
            require(hasRole(DEFAULT_ADMIN_ROLE, _address), "unkown user");
        }
    }

    function updateAddress(address _newAddress) external {
        return _updateAddress(getUserId(msg.sender), _newAddress);
    }

    function _updateAddress(uint256 _userId, address _newAddress) private {
        require(getAddress(_userId) == msg.sender, "you can only update your own address");

        _delegateRole(DEFAULT_ADMIN_ROLE, _newAddress);
        _delegateRole(PARTNER_ROLE, _newAddress);
        _delegateRole(PARTICIPANT_ROLE, _newAddress);
        _delegateRole(DONOR_ROLE, _newAddress);
        _delegateRole(MANAGER_PARTNER_ROLE, _newAddress);
        _delegateRole(MANAGER_PARTICIPANT_ROLE, _newAddress);
        _delegateRole(MANAGER_DONOR_ROLE, _newAddress);

        addressToUserId[_newAddress] = _userId;
        userIdToAddress[_userId] = _newAddress;
        addressToUserId[msg.sender] = 0;

        emit UserAddressUpdated(_userId, msg.sender, _newAddress);
    }

    function _delegateRole(bytes32 _role, address _newAddress) private {
        if (hasRole(_role, msg.sender)) {
            renounceRole(_role, msg.sender);
            _grantRole(_role, _newAddress);
        }
    }
}
