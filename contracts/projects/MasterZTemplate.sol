// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./IProjectTemplate.sol";
import "./DefaultProject.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/** @dev Default project template */
contract MasterZTemplate is DefaultProject {
    using SafeMath for uint256;

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
        WaitingStart,
        InProgress,
        Finished,
        Aborted
    }

    /////// variables ///////
    ProjectState public projectState = ProjectState.Fundraising;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    address internal partecipant;
    string public info;
    uint256 public currentBalance = 0;
    uint256 public hardCap;

    // TODO: create a real address book contract
    mapping(uint256 => address) internal addressBook;
    mapping(address => uint256) public contributions;

    // checkpoints
    struct Checkpoint {
        CheckpointState state;
        string info;
        uint256 cost;
        uint256 partnerID;
    }
    Checkpoint[] internal checkpoints;
    uint256 public activeCheckpoint;

    /////// modifiers ///////
    modifier getState(ProjectState _state) {
        require(projectState == _state, "You can not call this function with the current project state.");
        _;
    }

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

        // set hardCap
        for (uint256 i = 0; i < checkpoints.length; i++) {
            hardCap.add(checkpoints[i].cost);
        }
    }

    /**
        Receive funds
        // TODO: buffer fee
        // TODO: add expiration time (?)
    */
    function donate(uint256 _amount) external payable getState(ProjectState.Fundraising) {
        IERC20(cUsdTokenAddress).transferFrom(msg.sender, address(this), _amount);

        contributions[msg.sender] = contributions[msg.sender].add(_amount);
        currentBalance.add(_amount);

        // check hardcap
        if (checkHardCap()) {
            projectState = ProjectState.WaitingStart;
        }
    }

    /**
     * Check if HardCap has been reached
     */
    function checkHardCap() public view returns (bool) {
        if (currentBalance >= hardCap) {
            return true;
        } else {
            return false;
        }
    }

    /**
        Initialize project
    */
    function startProject() public payable onlyOwner getState(ProjectState.WaitingStart) {
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
    function approveCheckpoint() public payable onlyOwner getState(ProjectState.InProgress) {
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

    function abortProject() public payable onlyOwner {
        // TODO: return funds
        projectState = ProjectState.Aborted;
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
