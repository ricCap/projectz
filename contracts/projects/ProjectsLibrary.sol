// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

pragma solidity ^0.8.17;

library ProjectsLibrary {
    /////// Events ////////
    event FundingReceived(address contributor, uint256 amount, uint256 currentTotal, uint256 indexProject);
    event CheckpointPassed(uint256 checkpointID, uint256 indexProject);
    event PartnerPaid(address partner, uint256 checkpointID, uint256 indexProject);
    event ProjectWaitingToStart(uint256 indexProject);
    event ProjectExpired(uint256 indexProject);
    event ProjectMinted(string name_, string symbol_, uint256 _projectIndex);

    address constant cUSDContract = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    function donate(
        address from,
        address to,
        uint256 _amount
    ) external {
        // to the bottom for reentracy problems
        require(IERC20(cUSDContract).transferFrom(from, to, _amount), "Donation Failed");
    }

    function payPartner(address _partnerAddress, uint256 _amount) external {
        require(IERC20(cUSDContract).transfer(_partnerAddress, _amount), "Payment has failed.");
    }

    function refund(
        address from,
        address to,
        uint256 amount
    ) external {
        require(IERC20(cUSDContract).transferFrom(from, to, amount), "Payment has failed.");
    }
}
