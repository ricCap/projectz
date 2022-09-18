// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./projects/IProjectTemplate.sol";

/**
 * Manager contract that owns the other parts of the application
 * @dev currently handles access control as well
 */
contract Manager is AccessControl, IERC721Receiver {
    // roles
    bytes32 public constant PARTNER_ROLE = keccak256("PARTNER_ROLE");
    bytes32 public constant PARTICIPANT_ROLE = keccak256("PARTICIPANT_ROLE");
    bytes32 public constant DONOR_ROLE = keccak256("DONOR_ROLE");

    // events
    event ProjectTemplateAdded(address _address, uint256 _index);

    // data
    uint256 private projectTemplatesLength = 0;
    mapping(uint256 => address) private projectTemplateIDToAddress;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Add a new project template
     * @param _address the address of the template
     */
    function addProjectTemplate(address _address) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 _index) {
        // TODO check _address supports ERC721 interface and IProjectTemplate
        projectTemplateIDToAddress[projectTemplatesLength] = _address;
        projectTemplatesLength++;
        return projectTemplatesLength - 1;
    }

    function listProjectTemplates() public view returns (address[] memory) {
        address[] memory templates = new address[](projectTemplatesLength);
        for (uint256 i = 0; i < projectTemplatesLength; i++) {
            templates[i] = projectTemplateIDToAddress[i];
        }
        return templates;
    }

    /* solhint-disable */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
    /* solhint-enable */
}
