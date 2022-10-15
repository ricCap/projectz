// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../Manager.sol";
import "./DefaultProjectTemplate.sol";
import "./ProjectLibrary.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
    Aborted
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
    address partecipant;
    uint256 deadline;
    Checkpoint[] checkpoints;
    uint256 activeCheckpoint;
}

/** @dev Default project template for masterZ */
contract MasterZTemplate is DefaultProjectTemplate {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    /////// variables ///////
    address internal cUSDContract = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    string public info;

    mapping(uint256 => Project) internal projects;
    mapping(uint256 => uint256) public hardCaps;
    mapping(uint256 => uint256) public funds;
    mapping(uint256 => mapping(address => uint256)) internal contributions;

    // TODO: create a real address book contract
    mapping(uint256 => address) internal partnerAddressBook;

    /////// modifiers ///////
    modifier onlyState(ProjectState _state, uint256 _indexProject) {
        require(projects[_indexProject].projectState == _state, "PS not correct");
        _;
    }

    /////// Events ////////
    event FundingReceived(address contributor, uint256 amount, uint256 currentTotal, uint256 indexProject);
    event CheckpointPassed(uint256 checkpointID, uint256 indexProject);
    event PartnerPaid(address partner, uint256 checkpointID, uint256 indexProject);
    event ProjectWaitingToStart(uint256 indexProject);

    /**
     *  Contract constructor.
     *  Defines all the checkpoints that this contract must contains.
     */
    constructor() DefaultProjectTemplate("MasterZTemplate", "MASTERZ") {
        // define addresses
        // TODO: create an address book contract
        partnerAddressBook[0] = address(0x11111);
        partnerAddressBook[1] = address(0x22222);
        partnerAddressBook[2] = address(0x33333);

        // add other variables
        info = "Re-evaluate x";
    }

    function safeMint() public pure override returns (uint256) {
        revert("Call safeMint([string,string])");
    }

    function safeMint(address _partecipantAddress, uint256 _fundingDurationInDays)
        public
        returns (uint256 _indexProject)
    {
        onlyAdmin();
        _indexProject = super.safeMint();

        uint256 _deadline = block.timestamp.add(_fundingDurationInDays.mul(1 days));

        // define new project
        // TODO: check deepcopy checkpoints
        // checkpoints
        Project storage project = projects[_indexProject];
        project.title = "Title";
        project.description = "Description";
        project.deadline = _deadline;
        project.partecipant = _partecipantAddress;
        project.projectState = ProjectState.Fundraising;
        project.activeCheckpoint = 0;
        project.checkpoints.push(
            Checkpoint(CheckpointState.WaitingInitialization, "Checkpoint title", "Follow 80% of courses.", 1, 0)
        );

        hardCaps[_indexProject] = 5 wei;
    }

    function listProjects() public view returns (Project[] memory) {
        uint256 tokensCount = totalSupply();
        Project[] memory result = new Project[](tokensCount);
        for (uint256 i = 0; i < tokensCount; i++) {
            result[i] = projects[i];
        }
        return result;
    }

    /**
     *  Receive funds
     *  // TODO: add buffer fee
     *  // TODO: add hardcap per project
     *  // TODO: refund
     *  // check different require
     */
    function donate(uint256 _indexProject, uint256 _amount)
        external
        payable
        onlyState(ProjectState.Fundraising, _indexProject)
    {
        projectExists(_indexProject);
        // TODO: check https://blog.openzeppelin.com/reentrancy-after-istanbul/
        require(IERC20(cUSDContract).transferFrom(msg.sender, address(this), _amount), "Donation Failed");

        // save contribution
        contributions[_indexProject][msg.sender] = contributions[_indexProject][msg.sender].add(_amount);
        funds[_indexProject] = funds[_indexProject].add(_amount);
        emit FundingReceived(msg.sender, _amount, IERC20(cUSDContract).balanceOf(address(this)), _indexProject);

        // check hardcap
        _checkIfHardCapReached(_indexProject);
        if (projects[_indexProject].projectState == ProjectState.Fundraising) {
            _checkIfFundingExpired(_indexProject);
        }
    }

    /**
     *  Check if HardCap has been reached
     *  TODO: check balance payment splitter
     */
    function _checkIfHardCapReached(uint256 _indexProject) private {
        if (funds[_indexProject] > hardCaps[_indexProject]) {
            projects[_indexProject].projectState = ProjectState.WaitingToStart;
            emit ProjectWaitingToStart(_indexProject);
        }
    }

    /**
     *  Check if funding has expired
     */
    function _checkIfFundingExpired(uint256 _indexProject) private {
        if (block.timestamp > projects[_indexProject].deadline) {
            abortProject(_indexProject);
        }
    }

    /**
     *  Start project once fundraising has finished
     */
    function startProject(uint256 _indexProject) public onlyState(ProjectState.WaitingToStart, _indexProject) {
        onlyAdmin();
        projectExists(_indexProject);

        // start project
        projects[_indexProject].projectState = ProjectState.InProgress;

        // activate first checkpoint
        projects[_indexProject].activeCheckpoint = 0;
        initializeCheckPoint(projects[_indexProject].activeCheckpoint, _indexProject);
    }

    /**
     *  Set checkpoint as ready to get a pull payment request
     */
    function initializeCheckPoint(uint256 _indexCheckpoint, uint256 _indexProject)
        internal
        onlyState(ProjectState.InProgress, _indexProject)
    {
        onlyAdmin();
        projectExists(_indexProject);
        require(
            projects[_indexProject].checkpoints[_indexCheckpoint].state == CheckpointState.WaitingInitialization,
            "Checkpoint not in the correct state"
        );
        projects[_indexProject].checkpoints[_indexCheckpoint].state = CheckpointState.WaitingToStart;
    }

    /**
     *  Start specified checkpoint with pull payment request
     */
    function startCheckPoint(uint256 _indexProject) public onlyState(ProjectState.InProgress, _indexProject) {
        onlyAdmin();
        projectExists(_indexProject);
        uint256 _activeCheckpoint = projects[_indexProject].activeCheckpoint;

        // check correct checkpoint
        require(
            projects[_indexProject].checkpoints[_activeCheckpoint].state == CheckpointState.WaitingToStart,
            "Checkpoint not ready to start"
        );

        // check partner address
        address payable _partnerAddress = payable(
            _getAddress(projects[_indexProject].checkpoints[_activeCheckpoint].partnerID)
        );
        require(_partnerAddress == msg.sender || msg.sender == this.owner(), "Sender is not due any payment.");

        // If I am the partner, or the owner of the contract, I can start the project and activate the payment
        require(
            IERC20(cUSDContract).transferFrom(
                address(this),
                _partnerAddress,
                projects[_indexProject].checkpoints[_activeCheckpoint].cost
            ),
            "Payment has failed."
        );

        // emit a partner paid event
        emit PartnerPaid(_partnerAddress, _activeCheckpoint, _indexProject);
        projects[_indexProject].checkpoints[_activeCheckpoint].state = CheckpointState.InProgress;
    }

    /**
     *  Set a checkpoint as finished and start the next one.
     */
    // function finishCheckpoint(uint256 _indexProject) public onlyState(ProjectState.InProgress, _indexProject) {
    //     onlyAdmin()

    //     // approve current checkpoint
    //     projects[_indexProject].checkpoints[projects[_indexProject].activeCheckpoint].state
    //         = CheckpointState.Finished;

    //     // activate next checkpoint
    //     projects[_indexProject].activeCheckpoint++;
    //     if (projects[_indexProject].activeCheckpoint == projects[_indexProject].checkpoints.length) {
    //         projects[_indexProject].projectState = ProjectState.Finished;
    //     } else {
    //         initializeCheckPoint(projects[_indexProject].activeCheckpoint, _indexProject);
    //     }
    // }

    function projectExists(uint256 _indexProject) internal view {
        require(_indexProject < _tokenIdCounter.current(), "project does not exist");
    }

    function abortProject(uint256 _indexProject) public {
        // TODO: return funds
        projects[_indexProject].projectState = ProjectState.Aborted;
    }

    function onlyAdmin() private view {
        ProjectLibrary.onlyAdmin(owner());
    }

    // /**
    //  *  Getter functions
    //  */
    // function getCurrentCheckpoint(uint256 _indexProject) public view returns (Checkpoint memory) {
    //     return projects[_indexProject].checkpoints[projects[_indexProject].activeCheckpoint];
    // }

    function getInfo() public view returns (string memory) {
        return info;
    }

    function getProjectStatus(uint256 _indexProject) public view returns (ProjectState) {
        return projects[_indexProject].projectState;
    }

    function _getAddress(uint256 _index) internal view returns (address) {
        return partnerAddressBook[_index];
    }
}
