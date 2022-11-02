// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./DefaultProjectTemplate.sol";
import "./ProjectsLibrary.sol";
import "../IManager.sol";
import "../addressBook/AddressBookLibrary.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

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
    Aborted,
    Expired
}

// project
struct Checkpoint {
    CheckpointState state;
    string title;
    string description;
    uint256 cost;
    uint256 partnerID;
}

struct Project {
    ProjectState projectState;
    string title;
    string description;
    address participant;
    uint256 deadline;
    Checkpoint[] checkpoints;
    uint256 activeCheckpoint;
}

/** @dev Default project template for masterZ */
contract MasterZTemplate is DefaultProjectTemplate {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    /////// variables ///////
    string public info;
    uint256 public hardCap;

    mapping(uint256 => Project) internal projects;
    mapping(uint256 => uint256) public funds;
    mapping(uint256 => mapping(address => uint256)) internal contributions;

    /**
     *  Contract constructor.
     *  Defines all the checkpoints that this contract must contains.
     */
    constructor(string memory _info, uint256 _hardCap) DefaultProjectTemplate("MasterZTemplate", "MASTERZ") {
        info = _info;
        hardCap = _hardCap;
    }

    /**
     * Overwritten safeMint
     */
    function safeMint() public pure override returns (uint256) {
        revert("Call safeMint([Project])");
    }

    /**
     * New safeMint
     */
    function safeMint(Project calldata _project) public returns (uint256 _indexProject) {
        onlyAdmin();
        _indexProject = super.safeMint();
        projects[_indexProject] = _project;
        return _indexProject;
    }

    /**
     *  Receive funds
     */
    function donate(uint256 _indexProject, uint256 _amount) external payable {
        projectExists(_indexProject);
        onlyState(ProjectState.Fundraising, _indexProject);

        // check contribution
        require(funds[_indexProject].add(_amount) <= hardCap, "Donation exceeds hardCap");

        // save contribution
        contributions[_indexProject][msg.sender] = contributions[_indexProject][msg.sender].add(_amount);
        funds[_indexProject] = funds[_indexProject].add(_amount);
        emit ProjectsLibrary.FundingReceived(msg.sender, _amount, funds[_indexProject], _indexProject);

        // check hardcap and expiration data
        _checkIfHardCapReached(_indexProject);
        if (projects[_indexProject].projectState == ProjectState.Fundraising) {
            _checkIfFundingExpired(_indexProject);
        }

        if (!AddressBookLibrary.userExists(owner(), msg.sender)) {
            AddressBookLibrary.addDonor(owner(), msg.sender);
        }

        ProjectsLibrary.donate(msg.sender, address(this), _amount);
    }

    /**
     *  Check if HardCap has been reached
     */
    function _checkIfHardCapReached(uint256 _indexProject) private {
        if (funds[_indexProject] == hardCap) {
            projects[_indexProject].projectState = ProjectState.WaitingToStart;
            emit ProjectsLibrary.ProjectWaitingToStart(_indexProject);
        }
    }

    /**
     *  Check if funding has expired
     */
    function _checkIfFundingExpired(uint256 _indexProject) private {
        if (block.timestamp > projects[_indexProject].deadline) {
            projects[_indexProject].projectState = ProjectState.Expired;
            emit ProjectsLibrary.ProjectExpired(_indexProject);
        }
    }

    /**
     *  Start project once fundraising has finished
     */
    function startProject(uint256 _indexProject) external {
        onlyAdmin();
        projectExists(_indexProject);
        onlyState(ProjectState.WaitingToStart, _indexProject);

        // start project
        projects[_indexProject].projectState = ProjectState.InProgress;

        // activate first checkpoint
        projects[_indexProject].activeCheckpoint = 0;
        initializeCheckPoint(projects[_indexProject].activeCheckpoint, _indexProject);
    }

    /**
     *  Set checkpoint as ready to get a pull payment request
     */
    function initializeCheckPoint(uint256 _indexCheckpoint, uint256 _indexProject) internal {
        onlyAdmin();
        projectExists(_indexProject);
        onlyState(ProjectState.InProgress, _indexProject);
        require(
            projects[_indexProject].checkpoints[_indexCheckpoint].state == CheckpointState.WaitingInitialization,
            "Checkpoint not in the correct state"
        );
        projects[_indexProject].checkpoints[_indexCheckpoint].state = CheckpointState.WaitingToStart;
    }

    /**
     *  Start specified checkpoint with pull payment request
     */
    function startCheckPoint(uint256 _indexProject) external {
        projectExists(_indexProject);
        onlyState(ProjectState.InProgress, _indexProject);

        // gather partner address and active checkpoint
        uint256 _activeCheckpoint = projects[_indexProject].activeCheckpoint;
        uint256 _partnerID = projects[_indexProject].checkpoints[_activeCheckpoint].partnerID;
        address payable _partnerAddress = payable(AddressBookLibrary.getPartnerAddress(owner(), _partnerID));

        // check if I am allowed to start a transaction and if the checkpoint is ready
        require(
            AddressBookLibrary.isAdmin(owner()) ||
                (AddressBookLibrary.isPartner(owner()) && msg.sender == _partnerAddress),
            "Sender is not due any payment."
        );
        require(
            projects[_indexProject].checkpoints[_activeCheckpoint].state == CheckpointState.WaitingToStart,
            "Checkpoint not ready to start"
        );

        // start checkpoint
        projects[_indexProject].checkpoints[_activeCheckpoint].state = CheckpointState.InProgress;
        ProjectsLibrary.payPartner(_partnerAddress, projects[_indexProject].checkpoints[_activeCheckpoint].cost);
        emit ProjectsLibrary.PartnerPaid(_partnerAddress, _activeCheckpoint, _indexProject);
    }

    /**
     *  Set a checkpoint as finished and start the next one.
     */
    function finishCheckpoint(uint256 _indexProject) external {
        onlyAdmin();
        projectExists(_indexProject);
        onlyState(ProjectState.InProgress, _indexProject);

        // approve current checkpoint
        projects[_indexProject].checkpoints[projects[_indexProject].activeCheckpoint].state = CheckpointState.Finished;

        // activate next checkpoint
        projects[_indexProject].activeCheckpoint++;
        if (projects[_indexProject].activeCheckpoint == projects[_indexProject].checkpoints.length) {
            projects[_indexProject].projectState = ProjectState.Finished;
        } else {
            initializeCheckPoint(projects[_indexProject].activeCheckpoint, _indexProject);
        }
    }

    /**
     * Trigger a refund
     */
    function refund(uint256 _indexProject) public {
        projectExists(_indexProject);
        require(
            projects[_indexProject].projectState == ProjectState.Expired ||
                projects[_indexProject].projectState == ProjectState.Aborted,
            "Project State not correct"
        );
        require(contributions[_indexProject][msg.sender] != 0, "Caller can not be refunded");

        // compute spent funds
        uint256 spentFunds = 0;
        for (uint256 i = 0; i < projects[_indexProject].activeCheckpoint; i++) {
            spentFunds = spentFunds.add(projects[_indexProject].checkpoints[i].cost);
        }

        // compute refund amount
        uint256 refundAmount = contributions[_indexProject][msg.sender].mul(funds[_indexProject] - spentFunds).div(
            funds[_indexProject]
        );
        ProjectsLibrary.refund(address(this), msg.sender, refundAmount);
    }

    /**
     * Abort specified project
     */
    function abortProject(uint256 _indexProject) public {
        onlyAdmin();
        projectExists(_indexProject);
        require(projects[_indexProject].projectState != ProjectState.Expired, "Not callable while expired");
        require(projects[_indexProject].projectState != ProjectState.Aborted, "Not callable if already aborted");
        projects[_indexProject].projectState = ProjectState.Aborted;
    }

    /**
     * Return all projects
     */
    function listProjects() public view returns (Project[] memory) {
        uint256 tokensCount = totalSupply();
        Project[] memory result = new Project[](tokensCount);
        for (uint256 i = 0; i < tokensCount; i++) {
            result[i] = projects[i];
        }
        return result;
    }

    /**
     * Check if project exists
     */
    function projectExists(uint256 _indexProject) internal view {
        require(_indexProject < _tokenIdCounter.current(), "Project does not exist");
    }

    /**
     * Check if caller is admin
     */
    function onlyAdmin() private view {
        AddressBookLibrary.onlyAdmin(owner());
    }

    /**
     * Check if state agrees
     */
    function onlyState(ProjectState _state, uint256 _indexProject) private view {
        require(projects[_indexProject].projectState == _state, "PS not correct");
    }
}
