import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {

  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  //overall tokens minted
  const [tokensMinted, setTokensMinted] = useState(zero);
  //amount of Tokens user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  //keeps the no of tokens the user have
  const [balanceOfCryptoDevsTokens, setBalanceOfCryptoDevTokens] = useState(zero)
  
  const web3ModalRef = useRef();

  const getProviderOrsigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if(chainId !== 5){
      window.alert("Switch to Goerli Network");
      throw new Error("Switch to Goerli Network")
    }

    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  }

  const connectWallet = async () =>{
    try{
      await getProviderOrsigner();
      setWalletConnected(true);
    }catch(err){
      console.error(err)
    }
  }

  const getOwner = async () => {
    try{
      const provider = await getProviderOrsigner();

      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider);

      const _owner = await tokenContract.owner();

      const signer = await getProviderOrsigner(true);
      const address = await signer.getAddress();

      if(address.toLowerCase() === _owner.toLowerCase()){
        setIsOwner(true);
      }

    }catch(err){
      console.error(err.message)
    }
    
  }

  const getBalanceOfCryptoDevTokens = async () => {
    try{
      const provider = await getProviderOrsigner();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider);

      const signer = await getProviderOrsigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);

      setBalanceOfCryptoDevTokens(balance);
    }catch(err){
      console.error(err);
      setBalanceOfCryptoDevTokens(zero)
    }
  }

  const getTokensToBeClaimed = async () => {
    try{
      const provider = await getProviderOrsigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )

      const signer = await getProviderOrsigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);

      if(balance === zero){
        setTokensToBeClaimed(zero);
      }else{
        var amount = 0;
        for(var i = 0;i< balance;i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if(!claimed){
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    }catch(err){
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  }

  const claimCryptoDevTokens = async() =>{
    try{
      const signer = await getProviderOrsigner(true);

      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer);

      const transact = await tokenContract.claim();

      setLoading(true);
      await transact.wait();
      setLoading(false);

      window.alert("You successfully claimed a Token");

      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    }catch(err){
      console.error(err)
    }
  }

  const mintCryptoDevToken = async (amount) =>{
    try{
      const signer = await getProviderOrsigner(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const value = 0.001 * amount;
      const transact = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString())
      })
      console.log("hey")
      setLoading(true);
      await transact.wait();
      setLoading(false);
      console.log("hello")

      window.alert("You have successfully minted a Token");

      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
      
    }catch(err){
      console.error(err)
    }
  }

  const getTotalTokensMinted = async () => {
    try{
      const provider = await getProviderOrsigner();

      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider);

      const _tokensMinted = await tokenContract.totalSupply();

      setTokensMinted(_tokensMinted);

    }catch(err){
      console.error(err)
    }
  }

  const withdrawCoins = async () => {
    try{
      const signer = await getProviderOrsigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const transact = await tokenContract.withdraw();
      setLoading(true);
      await transact.wait();
      setLoading(false);
      await getOwner();
    }catch(err){
      console.error(err)
    }
  }

  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network:"goerli",
        providerOptions:{},
        disableInjectedProvider:false
      })
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
      getOwner();
    }
    
  }, [walletConnected])


  const renderButton = () =>{

    if(loading){
      return (
        <button className={styles.button} disabled>
          Loading...
        </button>
      )
    }

    if(walletConnected && isOwner){
      return(
        <button onClick={withdrawCoins} className={styles.button}>
          Withdraw Coins
        </button>
      )
    }

    if(tokensToBeClaimed > 0){
      return(
        <div>
          <div className={styles.description}>
            You have {tokensToBeClaimed * 10} Tokens left to claim!!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      )
    }

    return (
      <div style={{display: "flex-col"}}>

        <input type="number" placeholder="Amount of Tokens" onChange={(e)=>setTokenAmount(BigNumber.from(e.target.value))} className={styles.input}/>

        <button className={styles.button} disabled={!(tokenAmount >0)} onClick={() => (mintCryptoDevToken(tokenAmount))}>
          Mint Tokens
        </button>

      </div>
    )
  } 
  

  return (
    <div>
      <Head>
        <title>Crypto Devs ICO</title>
        <meta name="description" content="ICO-dApp" />
        <link rel='icon' href="./favicon.ico"/>
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome To Crypto Devs ICO</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev Tokens Here
          </div>

          {
            walletConnected ? (
              <div>
                <div className={styles.description}>
                  {/* format takes a bignumber and converts it into string */}
                  You have minted {utils.formatEther(balanceOfCryptoDevsTokens)} Tokens!      
                </div>
                <div className={styles.description}>
                  {/* format takes a bignumber and converts it into string */}
                  Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!           
                </div>
                {renderButton()}
              </div>
            ): (
                <button onClick={connectWallet} className={styles.button}>
                  Connect Wallet
                </button>
          )}

        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Manisha Jain
      </footer>
    </div>
  )
}
