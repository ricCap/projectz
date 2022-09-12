// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/** @dev Default project template */
/** TODO: how to receive money from constructor?? */
contract DefaultProject is Ownable, ERC721{

    // counter variable
    using Counters for Counters.Counter;
    Counters.Counter private _contractIdCounter;

    // addresses
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    // variables
    string internal info;
    string internal state;
    address internal partecipant;

    // checkpoints
    struct Checkpoint {
        uint id;
        string info;
        bool passed;
        uint cost;
        address payable partnerAddress;
    }
    Checkpoint[] internal checkpoints;
    uint public activeCheckpoint;
    bool public isStarted = false;

    /**
        Contract constructor. 
        Defines all the checkpoints that this contract must contains.
    */
    constructor() 
        ERC721("DefaultProjectTemplate", "DEFAULT")
        { // solhint-disable-line no-empty-blocks

        // define all checkpoints
        checkpoints.push(Checkpoint(
            0,
            "Go to psychologists.",
            false,
            1,
            payable(address(0x0000))
        ));
        checkpoints.push(Checkpoint(
            1,
            "Attend course.",
            false,
            2,
            payable(address(0x0000))
        ));
        checkpoints.push(Checkpoint(
            2,
            "Take the exam.",
            false,
            1,
            payable(address(0x0000))
        ));
        
    }

    /**
        Receive funds
    */
    function donate() public onlyOwner payable {}

    /**
        Initialize project
    */
    function startProject() public onlyOwner payable {
        uint _sum = 0;
        for (uint i=0; i<checkpoints.length; i++){
            _sum = _sum + checkpoints[i].cost;
        }
        require(_sum >= address(this).balance, "This project does not have enough funds to be started!");

        // if enough balance pay the first checkpont and set it as active
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                address(this),
                checkpoints[0].partnerAddress,
                checkpoints[0].cost
            ),
            "First checkpoint payment Failed."
        );
        activeCheckpoint = 0;
        isStarted = true;
    }

    /**
        Set a checkpoint as finished and start the next one.
    */
    function approveCheckpoint() public onlyOwner payable  {
        require(isStarted, "Project has not started yet!");
        require(activeCheckpoint < checkpoints.length, "Project has already finished!");

        // pass current checkpoint
        checkpoints[activeCheckpoint].passed = true;

        // activate next one
        activeCheckpoint++;
        if (activeCheckpoint == checkpoints.length) {
            console.log("Project finished succesfully!", msg.sender);
        } else {
            // pay for next checkpoint
            require(
                IERC20Token(cUsdTokenAddress).transferFrom(
                    address(this),
                    checkpoints[activeCheckpoint].partnerAddress,
                    checkpoints[activeCheckpoint].cost
                ),
                "Payment has failed."
            );
        }
        
    }

    /**
        Mint the contract and return the address as the contract Id
    */
    function safeMint() public onlyOwner returns (uint256 _contractId) {
        _contractId = _contractIdCounter.current();
        _contractIdCounter.increment();
        _safeMint(msg.sender, _contractId);
    }

    /**
        Getter functions
    */
    function getCurrentCheckpoint() public view returns (Checkpoint memory){
        return checkpoints[activeCheckpoint];
    }

    function getBalance() public view returns (uint){
        return address(this).balance;
    }


}