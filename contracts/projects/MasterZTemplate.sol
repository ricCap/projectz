// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./IProjectTemplate.sol";
import "./DefaultProject.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/** @dev Default project template */
contract MasterZTemplate is DefaultProject {
    // enums
    enum CheckpointState {
        WaitingToStart,
        Started,
        Finished
    }
    enum FundraisingState {
        Active,
        Expired,
        Successful
    }
    enum ProjectState {
        Fundraising,
        InProgress,
        Finished,
        Aborted
    }

    /////// variables ///////
    ProjectState internal projectState = ProjectState.Fundraising;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address internal partecipant;
    string internal info;

    // TODO: create a real address book contract
    mapping(uint256 => address) internal addressBook;

    // checkpoints
    struct Checkpoint {
        CheckpointState state;
        string info;
        uint256 cost;
        uint256 partnerID;
    }
    Checkpoint[] internal checkpoints;
    uint256 public activeCheckpoint;

    /////// variables ///////

    /**
        Contract constructor. 
        Defines all the checkpoints that this contract must contains.
    */
    constructor(address _partecipantAddress) {
        // define addresses
        // TODO: create an address book contract
        addressBook[0] = address(0x0000);
        addressBook[1] = address(0x0000);
        addressBook[2] = address(0x0000);

        // define all checkpoints
        checkpoints.push(Checkpoint(CheckpointState.WaitingToStart, "Go to psychologists.", 1, 0));
        checkpoints.push(Checkpoint(CheckpointState.WaitingToStart, "Attend course.", 2, 1));
        checkpoints.push(Checkpoint(CheckpointState.WaitingToStart, "Take the exam.", 1, 2));

        // add other variables
        info = "Re-evaluate a person x doing y";
        partecipant = _partecipantAddress;
    }

    /**
        Receive funds
    */
    function donate() public payable {
        // TODO: check if received funds are a specific currency
        // TODO: hardcap
        // TODO: buffer fee
    }

    /**
        Initialize project
    */
    function startProject() public payable onlyOwner {
        require(projectState == ProjectState.Fundraising, "Project has already started!");

        // count the cost of the entire project
        uint256 _sum = 0;
        for (uint256 i = 0; i < checkpoints.length; i++) {
            _sum = _sum + checkpoints[i].cost;
        }

        // check funds
        require(
            _sum >= IERC20(cUsdTokenAddress).balanceOf(address(this)),
            "This project does not have enough funds to be started!"
        );

        // activate first checkpoint
        address payable _partnerAddress = payable(_getAddress(checkpoints[0].partnerID));
        require(
            IERC20(cUsdTokenAddress).transferFrom(address(this), _partnerAddress, checkpoints[0].cost),
            "First checkpoint payment Failed."
        );
        checkpoints[0].state = CheckpointState.Started;
        activeCheckpoint = 0;

        // start project
        projectState = ProjectState.InProgress;
    }

    /**
        Set a checkpoint as finished and start the next one.
    */
    function approveCheckpoint() public payable onlyOwner {
        require(projectState != ProjectState.Fundraising, "Project has not started yet!");
        require(projectState != ProjectState.Finished, "Project has already finished!");
        require(projectState != ProjectState.Aborted, "Project has been cancelled!");

        // approve current checkpoint
        checkpoints[activeCheckpoint].state = CheckpointState.Finished;

        // activate next one
        activeCheckpoint++;
        if (activeCheckpoint == checkpoints.length) {
            console.log("Project finished succesfully!", msg.sender);
            projectState = ProjectState.Finished;
        } else {
            // pay for next checkpoint
            address payable _partnerAddress = payable(_getAddress(checkpoints[activeCheckpoint].partnerID));
            require(
                IERC20(cUsdTokenAddress).transferFrom(
                    address(this),
                    _partnerAddress,
                    checkpoints[activeCheckpoint].cost
                ),
                "Payment has failed."
            );
            checkpoints[activeCheckpoint].state = CheckpointState.Started;
        }
    }

    function abortProject() public payable {
        // TODO: implement
    }

    /**
        Getter functions
    */
    function getCurrentCheckpoint() public view returns (Checkpoint memory) {
        return checkpoints[activeCheckpoint];
    }

    function getInfo() public view returns (string memory) {
        return info;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function _getAddress(uint256 _index) internal view returns (address) {
        return addressBook[_index];
    }
}
