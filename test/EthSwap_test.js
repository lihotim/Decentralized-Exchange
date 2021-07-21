const { assert } = require('chai');
const { default: Web3 } = require('web3');

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
.use(require('chai-as-promised'))
.should()

function tokens(n) {
    return web3.utils.toWei(n, 'Ether')
}

contract('EthSwap', ([deployer, investor1, investor2]) => {

    let token, ethSwap

    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    describe('Token deployment', async () => {
        it('Contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('EthSwap deployment', async () => {
        it('Contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('Contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Buy tokens', async () => {
        let result

        before(async () => {
            // Purchase tokens of 1 ETH before each example
            result = await ethSwap.buyTokens({from: investor1, value: web3.utils.toWei('1', 'ether')})
        })

        it('Allows users to instantly purchase tokens from EthSwap for a fixed price', async () => {
            // Check investor's token balance after purchase
            let investorBalance = await token.balanceOf(investor1)
            assert.equal(investorBalance.toString(), tokens('100'))

            // Check EthSwap Balance after each purchase 
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'))

            const event = result.logs[0].args
            // console.log(event)
            // console.log(event._account)
            // console.log(event._token)
            // console.log(event._amount.toString())
            // console.log(event._rate.toString())

            assert.equal(event._account, investor1)
            assert.equal(event._token, token.address)
            assert.equal(event._amount.toString(), tokens('100').toString())
            assert.equal(event._rate.toString(), '100')
        })
    })

    describe('Sell tokens', async () => {
        let result

        before(async () => {
            // Investor must approve tokens before the purchase 
            await token.approve(ethSwap.address, tokens('100'), {from: investor1})
            // Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), {from: investor1})
        })

        it('Allows users to instantly sell tokens to EthSwap for a fixed price', async () => {
            let investorBalance = await token.balanceOf(investor1)
            assert.equal(investorBalance.toString(), tokens('0'))

            // Check EthSwap Balance after each purchase 
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether'))

            const event = result.logs[0].args
            assert.equal(event._account, investor1)
            assert.equal(event._token, token.address)
            assert.equal(event._amount.toString(), tokens('100').toString())
            assert.equal(event._rate.toString(), '100')

            // FAILURE: investors cannot sell more tokens than they possess

            await ethSwap.sellTokens(tokens('500'), {from: investor1}).should.be.rejected
        })
    })



})