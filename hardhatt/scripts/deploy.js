const {ethers} = require("hardhat");
require("dotenv").config({path:".env"})
const {CRYPTO_DEVS_NFT_CONTRACT_ADDRESS} = require("../constants")

async function main(){

  const cryptoDevsTokenContract = await ethers.getContractFactory("CryptoDevToken")
  const deployCryptoDevsTokenContract = await cryptoDevsTokenContract.deploy(CRYPTO_DEVS_NFT_CONTRACT_ADDRESS);

  console.log(
    "Crypto Dev Token Contract Address:", deployCryptoDevsTokenContract.address
  )

}

main()
.then(()=>process.exit(0))
.catch((err)=>{
  console.error(err);
  process.exit(1);
})