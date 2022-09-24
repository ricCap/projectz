// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./PaymentSplitterTemplate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PartnerPaymentsSplitter is PaymentSplitter, Ownable {
    uint256 internal activeCheckpoint;

    // solhint-disable-next-line no-empty-blocks
    constructor(address[] memory _payees, uint256[] memory _shares) payable PaymentSplitter(_payees, _shares) {}

    function release(IERC20 _token, address _account) public virtual override {
        require(_payees[activeCheckpoint] == _account, "PaymentSplitter: account is not due payment");
        require(_shares[_account] > 0, "PaymentSplitter: account has no shares");

        uint256 payment = releasable(_token, _account);

        require(payment != 0, "PaymentSplitter: account is not due payment");

        _erc20Released[_token][_account] += payment;
        _erc20TotalReleased[_token] += payment;

        SafeERC20.safeTransfer(_token, _account, payment);
        emit ERC20PaymentReleased(_token, _account, payment);
    }

    function setActiveCheckpoint(uint256 _index) public onlyOwner {
        activeCheckpoint = _index;
    }
}
