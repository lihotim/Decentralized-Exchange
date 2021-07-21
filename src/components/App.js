import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'

import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {

    const web3 = window.web3

    //load accounts, fetch account's ETH balance
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // fetch the '5777' value
    const networdId = await web3.eth.net.getId()

    // Load Token smart contract, fetch account's token balance
    const tokenData = Token.networks[networdId]
    if(tokenData){
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })

      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() }) // Note: different from line 39, when we call a function to fetch value, we MUST add "toString()"
    }else{
      window.alert('Token contract not deployed to detected network.')
    }

    // Load EthSwap smart contract, fetch account's token balance
    const ethSwapData = EthSwap.networks[networdId]
    if(ethSwapData){
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    }else{
      window.alert('EthSwap contract not deployed to detected network.')
    }

    this.setState({loading:false})
  }

  buyTokens = (etherAmount) => {
    this.setState({loading:true})
    this.state.ethSwap.methods.buyTokens().send({value: etherAmount, from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({loading:false})
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({loading:true})
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({from: this.state.account}).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading:false})
      })
      
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance:'0',
    }

  }

  render() {
    let content
    if (this.state.loading){
      content = <p id="loader" className="text-center"> Loading... </p>
    }else{
      content = <Main ethBalance={this.state.ethBalance}
                      tokenBalance={this.state.tokenBalance}
                      buyTokens={this.buyTokens}
                      sellTokens={this.sellTokens}
                />
    }

    return (
      <div>
        
        <Navbar account={this.state.account}/>

        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 mx-auto" style={{maxWidth: '600px'}}>
              <div className="content mr-auto ml-auto">
               
                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
