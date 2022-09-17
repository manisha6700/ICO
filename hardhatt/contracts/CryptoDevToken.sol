// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable {

    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant tokensPerNFT = 10 * 10**18; 
    uint public constant maxTotalSupply = 10000 * 10**18;
    //It is taking the TokenId so that to keep a track for claimed tokens for nfts
    mapping(uint256 => bool) public tokenIdsClaimed;

    ICryptoDevs CryptoDevsNFT;

    constructor(address _cryptoDevsContract) ERC20("Manisha Token", "MT"){
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    //for the persons having no NFTs
    function mint(uint256 amount) public payable{
        uint256 _requiredAmount = tokenPrice * amount; 
        require(msg.value >= _requiredAmount, "Ether sent is incorrect");
        uint256 amountWithDecimals = amount * 10**18;
        //totalSupply keeps track of total tokens minted till now
        require((totalSupply() + amountWithDecimals) <= maxTotalSupply, "Exceeds the max total supply available");

        _mint(msg.sender, amountWithDecimals);
    }

    function claim() public {
        address sender = msg.sender;
        //it return the no. of NFTs the sender has
        uint256 balance = CryptoDevsNFT.balanceOf(sender);
        require(balance > 0,"You don't own any Crypto Dev NFTs");

        //keep track of tokens that are not claimed
        uint256 amount = 0;
        //so here we are getting the tokenId of each NFT a sender has
        for(uint256 i = 0; i<balance; i++){
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender,i);
            if(!tokenIdsClaimed[tokenId]){
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount >0, "You have already claimed all your tokens");

        _mint(msg.sender, amount* tokensPerNFT);
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent,) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable{}
    fallback() external payable{}

}