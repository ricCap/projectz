// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library ProjectsLibrary {
    /////// Events ////////
    event FundingReceived(address contributor, uint256 amount, uint256 currentTotal, uint256 indexProject);
    event CheckpointPassed(uint256 checkpointID, uint256 indexProject);
    event PartnerPaid(address partner, uint256 checkpointID, uint256 indexProject);
    event ProjectWaitingToStart(uint256 indexProject);
    event ProjectExpired(uint256 indexProject);
}
