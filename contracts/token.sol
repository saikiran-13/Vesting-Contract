// SPDX-License-Identifier: MIT

pragma solidity >=0.8.18 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract CreateToken is ERC20 {
    address public tokenowner;
    uint public intialSupply;
  
    constructor(uint _intialSupply) ERC20("SaiKiranToken", "SKT") {
        intialSupply = _intialSupply;
        tokenowner = msg.sender;
        _mint(tokenowner, intialSupply* (10**18));
    }

    modifier onlyowner() {
        require(msg.sender == tokenowner, "Only Owner can allow this operation");
        _;
    }

    function mint(address _to, uint256 _amount) external onlyowner {
        _mint(_to, _amount);
    }

}