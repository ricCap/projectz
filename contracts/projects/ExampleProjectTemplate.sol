// SPDX-License-Identifier: MIT

import "./DefaultProjectTemplate.sol";

pragma solidity ^0.8.9;

/** @dev Example project template */
contract ExampleProjectTemplate is DefaultProjectTemplate {
    constructor() DefaultProjectTemplate("ExampleProjectTemplate", "EXAMPLE") {} // solhint-disable-line no-empty-blocks
}
