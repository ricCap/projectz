// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Marketplace {
  uint256 internal productsLength = 0;
  address internal cUsdTokenAddress =
    0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

  struct Product {
    address payable owner;
    string name;
    string image;
    string description;
    string location;
    uint256 price;
    uint256 sold;
  }

  mapping(uint256 => Product) internal products;

  function writeProduct(
    string memory _name,
    string memory _image,
    string memory _description,
    string memory _location,
    uint256 _price
  ) public {
    uint256 _sold = 0;
    products[productsLength] = Product(
      payable(msg.sender),
      _name,
      _image,
      _description,
      _location,
      _price,
      _sold
    );
    productsLength++;
  }

  function readProduct(uint256 _index)
    public
    view
    returns (
      address payable,
      string memory,
      string memory,
      string memory,
      string memory,
      uint256,
      uint256
    )
  {
    return (
      products[_index].owner,
      products[_index].name,
      products[_index].image,
      products[_index].description,
      products[_index].location,
      products[_index].price,
      products[_index].sold
    );
  }

  function buyProduct(uint256 _index) public payable {
    require(
      IERC20(cUsdTokenAddress).transferFrom(
        msg.sender,
        products[_index].owner,
        products[_index].price
      ),
      "Transfer failed."
    );
    products[_index].sold++;
  }

  function getProductsLength() public view returns (uint256) {
    return (productsLength);
  }
}
