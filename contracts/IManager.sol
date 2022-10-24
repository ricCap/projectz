// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface IManager {
    function addressBookAddress() external view returns (address);

    function addProjectTemplate(address _address) external returns (uint256 _index);

    function listProjectTemplates() external view returns (address[] memory);
}
