// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./projects/IProjectTemplate.sol";

/**
 * @dev
 */
contract Manager is AccessControl, IERC721Receiver {
    // roles
    bytes32 public constant PARTNER_ROLE = keccak256("PARTNER_ROLE");
    bytes32 public constant UNKOWN_ROLE = keccak256("UNKOWN_ROLE");

    // events
    event ProjectTemplateAdded(address _address, uint256 _index);
    event ProjectMinted(uint256 _projectTemplateIndex, uint256 _projectIndex);

    // data
    mapping(uint256 => address) internal projectTemplateIDToAddress;
    uint256 internal projectTemplatesLength = 0;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Add a new project template
     */
    function addProjectTemplate(address _address) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 _index) {
        // TODO check _address supports ERC721 interface and IProjectTemplate
        projectTemplateIDToAddress[projectTemplatesLength] = _address;
        projectTemplatesLength++;
        return projectTemplatesLength - 1;
    }

    // TODO find a better way to infer roles on the client side
    function getRole() public view returns (bytes32) {
        if (hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            return "DEFAULT_ADMIN_ROLE";
        } else if (hasRole(PARTNER_ROLE, msg.sender)) {
            return "PARTNER_ROLE";
        } else {
            return "UNKOWN_ROLE";
        }
    }

    /** Create a preojct based on a project template
     * @dev the project template should have been previously added to the manager
     */
    function createProject(uint256 _templateIndex) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 _index) {
        require(_templateIndex < projectTemplatesLength, "Invalid project template index");
        IProjectTemplate _template = IProjectTemplate(projectTemplateIDToAddress[_templateIndex]);

        _index = _template.safeMint();
        emit ProjectMinted(_templateIndex, _index);
    }

    /* solhint-disable */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
    /* solhint-enable */
}
