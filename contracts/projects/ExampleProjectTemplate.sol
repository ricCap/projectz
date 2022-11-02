// SPDX-License-Identifier: MIT

import "../IManager.sol";
import "../addressBook/IAddressBook.sol";
import "./DefaultProjectTemplate.sol";

pragma solidity ^0.8.17;

struct Project {
    string title;
    string description;
}

interface IExampleProjectTemplate {
    function safeMint(Project calldata project) external returns (uint256 _tokenId);

    function listProjects() external view returns (Project[] memory);
}

/** @dev Example project template */
contract ExampleProjectTemplate is DefaultProjectTemplate, IExampleProjectTemplate {
    mapping(uint256 => Project) internal idToProject;

    constructor() DefaultProjectTemplate("ExampleProjectTemplate", "EXAMPLE") {} // solhint-disable-line no-empty-blocks

    function safeMint() public pure override returns (uint256 _tokenId) {
        revert("Call safeMint([string,string]) instead; project data is required");
    }

    function onlyAdmin() private view {
        IManager _manager = IManager(owner());
        IAddressBook _addressBook = IAddressBook(_manager.addressBookAddress());
        require(
            _addressBook.hasRole(_addressBook.DEFAULT_ADMIN_ROLE(), msg.sender),
            "only DEFAULT_ADMIN_ROLE can create templates"
        );
    }

    function safeMint(Project calldata project) public returns (uint256 _tokenId) {
        onlyAdmin();
        _tokenId = super.safeMint();
        idToProject[_tokenId] = project;
    }

    function listProjects() public view returns (Project[] memory) {
        uint256 tokensCount = totalSupply();
        Project[] memory result = new Project[](tokensCount);
        for (uint256 i = 0; i < tokensCount; i++) {
            result[i] = idToProject[i];
        }
        return result;
    }
}
