// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./IProjectTemplate.sol";
import "./DefaultProject.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/** @dev Default project template for masterZ */
contract MasterZTemplate is DefaultProject {
    using SafeMath for uint256;

    // enums
    enum CheckpointState {
        WaitingInitialization,
        WaitingToStart,
        InProgress,
        Finished
    }
    enum ProjectState {
        Fundraising,
        WaitingToStart,
        InProgress,
        Finished,
        Aborted
    }

    /////// variables ///////
    ProjectState public projectState = ProjectState.Fundraising;
    IERC20 internal cUsdToken = IERC20(0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1);
    string public info;
    uint256 public hardCap;

    // project
    struct Checkpoint {
        CheckpointState state;
        string info;
        uint256 cost;
        uint256 partnerID;
    }
    struct Project {
        address partecipant;
        uint256 deadline;
        Checkpoint[] checkpoints;
        uint256 activeCheckpoint;
    }
    Project[] internal projects;

    // TODO: create a real address book contract
    mapping(uint256 => address) internal partnerAddressBook;
    mapping(address => uint256) public contributions;

    /////// modifiers ///////
    modifier onlyState(ProjectState _state) {
        require(projectState == _state, "You can not call this function with the current project state.");
        _;
    }

    /////// Events ////////
    event FundingReceived(address contributor, uint256 amount, uint256 currentTotal);
    event CheckpointPassed(uint256 checkpointID);
    event PartnerPaid(address partner, uint256 checkpointID);

    /**
     *  Contract constructor.
     *  Defines all the checkpoints that this contract must contains.
     */
    constructor(address _partecipantAddress, uint256 _fundingDurationInDays) {
        // define addresses
        // TODO: create an address book contract
        partnerAddressBook[0] = address(0x11111);
        partnerAddressBook[1] = address(0x22222);
        partnerAddressBook[2] = address(0x33333);

        // define all checkpoints
        checkpoints.push(Checkpoint(CheckpointState.WaitingInitialization, "Follow 80% of courses.", 1, 0));
        checkpoints.push(Checkpoint(CheckpointState.WaitingInitialization, "Complete project-work.", 2, 1));
        checkpoints.push(Checkpoint(CheckpointState.WaitingInitialization, "Pass final examination.", 1, 2));

        // add other variables
        info = "Re-evaluate a person x by completing masterZ";
        partecipant = _partecipantAddress;

        // set hardCap
        // TODO: add buffer fees
        for (uint256 i = 0; i < checkpoints.length; i++) {
            hardCap = hardCap.add(checkpoints[i].cost);
        }

        // Set Fundraising deadline
        deadline = block.timestamp.add(_fundingDurationInDays.mul(1 days));
    }

    /**
     *  Receive funds
     *  // TODO: add buffer fee
     */
    function donate(uint256 _amount) external payable onlyState(ProjectState.Fundraising) {
        // TODO: check https://blog.openzeppelin.com/reentrancy-after-istanbul/
        require(cUsdToken.transferFrom(msg.sender, address(this), _amount), "Donation Failed");

        // save contribution
        contributions[msg.sender] = contributions[msg.sender].add(_amount);
        emit FundingReceived(msg.sender, _amount, cUsdToken.balanceOf(address(this)));

        // check hardcap
        _checkIfHardCapReached();
        if (projectState != ProjectState.WaitingToStart) {
            _checkIfFundingExpired();
        }
    }

    /**
     *  Check if HardCap has been reached
     */
    function _checkIfHardCapReached() private {
        if (cUsdToken.balanceOf(address(this)) >= hardCap) {
            projectState = ProjectState.WaitingToStart;
        }
    }

    /**
     *  Check if funding has expired
     */
    function _checkIfFundingExpired() private {
        if (block.timestamp > deadline) {
            abortProject();
        }
    }

    /**
     *  Start project once fundraising has finished
     */
    function startProject() public onlyOwner onlyState(ProjectState.WaitingToStart) {
        // start project
        projectState = ProjectState.InProgress;

        // activate first checkpoint
        activeCheckpoint = 0;
        initializeCheckPoint(activeCheckpoint);
    }

    /**
     *  Set a checkpoint as finished and start the next one.
     */
    function finishCheckpoint() public onlyOwner onlyState(ProjectState.InProgress) {
        // approve current checkpoint
        checkpoints[activeCheckpoint].state = CheckpointState.Finished;

        // activate next checkpoint
        activeCheckpoint++;
        if (activeCheckpoint == checkpoints.length) {
            console.log("Project finished succesfully!", msg.sender);
            projectState = ProjectState.Finished;
        } else {
            initializeCheckPoint(activeCheckpoint);
        }
    }

    /**
     *  Set checkpoint as ready to get a pull payment request
     */
    function initializeCheckPoint(uint256 _index) internal onlyOwner onlyState(ProjectState.InProgress) {
        require(
            checkpoints[_index].state == CheckpointState.WaitingInitialization,
            "Checkpoint not in the correct state"
        );
        checkpoints[_index].state = CheckpointState.WaitingToStart;
    }

    /**
     *  Start specified checkpoint with pull payment request
     */
    function startCheckPoint(uint256 _index) public onlyOwner onlyState(ProjectState.InProgress) {
        // check correct checkpoint
        require(checkpoints[_index].state == CheckpointState.WaitingToStart, "Checkpoint not ready to start");

        // check partner address
        address payable _partnerAddress = payable(_getAddress(checkpoints[_index].partnerID));
        require(_partnerAddress == msg.sender || msg.sender == this.owner(), "Sender is not due any payment.");

        // If I am the partner, or the owner of the contract, I can start the project and activate the payment
        require(
            cUsdToken.transferFrom(address(this), _partnerAddress, checkpoints[_index].cost),
            "Payment has failed."
        );

        // emit a partner paid event
        emit PartnerPaid(_partnerAddress, _index);
        checkpoints[_index].state = CheckpointState.InProgress;
    }

    function abortProject() public onlyOwner {
        // TODO: return funds
        projectState = ProjectState.Aborted;
    }

    /**
     *  Getter functions
     */
    function getCurrentCheckpoint() public view returns (Checkpoint memory) {
        return checkpoints[activeCheckpoint];
    }

    function getInfo() public view returns (string memory) {
        return info;
    }

    function getBalance() public view returns (uint256) {
        return cUsdToken.balanceOf(address(this));
    }

    function getProjectStatus() public view returns (ProjectState) {
        return projectState;
    }

    function _getAddress(uint256 _index) internal view returns (address) {
        return partnerAddressBook[_index];
    }
}
