// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./IManager.sol";
import "./addressBook/AddressBookLibrary.sol";
import "./addressBook/IAddressBook.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * Manager contract that owns the other parts of the application
 * @dev currently handles access control as well
 */
contract Manager is IManager, IERC721Receiver {
    // events
    event ProjectTemplateAdded(address _address, uint256 _index);

    // data
    uint256 private projectTemplatesLength = 0;
    mapping(uint256 => address) private projectTemplateIDToAddress;
    address public addressBookAddress;

    constructor(address _addressBookAddress) {
        addressBookAddress = _addressBookAddress;
    }

    /**
     * @dev Add a new project template
     * @param _address the address of the template
     */
    function addProjectTemplate(address _address) public returns (uint256 _index) {
        IAddressBook _addressBook = IAddressBook(addressBookAddress);
        require(
            _addressBook.hasRole(_addressBook.DEFAULT_ADMIN_ROLE(), msg.sender),
            "only DEFAULT_ADMIN_ROLE can add project template"
        );
        require(
            _addressBook.hasRole(_addressBook.MANAGER_DONOR_ROLE(), _address),
            "project templates should have MANAGER_DONOR_ROLE"
        );

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
