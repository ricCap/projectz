// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/IAccessControl.sol";

pragma solidity ^0.8.17;

interface IAddressBook is IAccessControl {
    // solhint-disable-next-line func-name-mixedcase
    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);

    // solhint-disable-next-line func-name-mixedcase
    function PARTNER_ROLE() external view returns (bytes32);

    // solhint-disable-next-line func-name-mixedcase
    function PARTICIPANT_ROLE() external view returns (bytes32);

    // solhint-disable-next-line func-name-mixedcase
    function DONOR_ROLE() external view returns (bytes32);

    // solhint-disable-next-line func-name-mixedcase
    function MANAGER_PARTNER_ROLE() external view returns (bytes32);

    // solhint-disable-next-line func-name-mixedcase
    function MANAGER_PARTICIPANT_ROLE() external view returns (bytes32);

    // solhint-disable-next-line func-name-mixedcase
    function MANAGER_DONOR_ROLE() external view returns (bytes32);

    function addUser(address _address) external;

    function getAddress(uint256 _userId) external view returns (address);

    function getUserId(address _address) external view returns (uint256 result);

    function updateAddress(address _newAddress) external;

    function userExists(address _address) external view returns (bool);
}
