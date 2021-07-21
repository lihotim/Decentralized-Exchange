// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

 contract EthSwap {

    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;
    
    event TokensPurchased(address _account, address _token, uint _amount, uint _rate);
    event TokensSold(address _account, address _token, uint _amount, uint _rate);
    
    constructor (Token _token) payable {
        token = _token;
    }
    
    function buyTokens() public payable {

        // Calculate the number of tokens to buy
        uint tokenAmount = msg.value * rate;
        
        // Require that the exchange has enough tokens for sale
        require(token.balanceOf(address(this)) >= tokenAmount, "There aren't enough tokens for sale!");
        
        // Transfer tokens to the investor
        token.transfer(msg.sender, tokenAmount);
        
        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }
    
    function sellTokens(uint _amount) public {
        // User cannot sell more tokens than they possess
        require(token.balanceOf(msg.sender)>=_amount, "You don't have enough tokens!");
        
        // Calculate the amount of Eth to redeem
        uint etherAmount = _amount/rate;
        
        // Require that EthSwap has enough Eth to pay to investors
        require(address(this).balance >= etherAmount, "EthSwap has insufficient ETHs!");
        
        // Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        payable(msg.sender).transfer(etherAmount);
        
        emit TokensSold(msg.sender, address(token), _amount, rate);
        
    }
    
}