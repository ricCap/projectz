// SPDX-License-Identifier: MIT

import "../Manager.sol";
import "./DefaultProjectTemplate.sol";

pragma solidity ^0.8.9;

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

    function safeMint(Project calldata project) public returns (uint256 _tokenId) {
        Manager _manager = Manager(owner());
        require(
            _manager.hasRole(_manager.DEFAULT_ADMIN_ROLE(), msg.sender),
            "only DEFAULT_ADMIN_ROLE can create projects"
        );
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

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(DefaultProjectTemplate) returns (bool) {
        return interfaceId == type(IExampleProjectTemplate).interfaceId || super.supportsInterface(interfaceId);
    }
}
