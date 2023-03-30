const path = require("path");
const { ethers, FixedNumber } = require('ethers');

require('dotenv').config()

const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC);
const quikNodeProvider = new ethers.JsonRpcProvider("https://arbitrum-nova.public.blastapi.io");

const liquidityPoolAddressMini = "0xc09756432dad2ff50b2d40618f7b04546dd20043";
const swapUniAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

const moon = '0x0057Ac2d777797d31CD3f8f13bF5e927571D6Ad0';
const weth = '0x722E8BdD2ce80A4422E880164f2079488e115365';

const lp = "0xD6C821b282531868721b41BAdca1F1ce471f43C5";

const liquidityPoolAddressMiniAbi = require(path.resolve(__dirname, "contracts/minichefv2.json"));
const swapUniAbi = require(path.resolve(__dirname, "contracts/uniswapv2router.json"));
const uniswapERC20ABI = require(path.resolve(__dirname, "contracts/uniswapERC20.json"));

const erc20AbiBalanceOf = [
    "function balanceOf(address account) public view returns (uint256)",
  ];

const moonsContract = new ethers.Contract(
    moon,
    erc20AbiBalanceOf,
    quikNodeProvider
);

const liquidityPoolMiniProvider = new ethers.Contract(
    liquidityPoolAddressMini,
    liquidityPoolAddressMiniAbi,
    quikNodeProvider);

const lpContract = new ethers.Contract(
    lp,
    uniswapERC20ABI,
    quikNodeProvider
);

const swapContract = new ethers.Contract(
    swapUniAddress,
    swapUniAbi,
    quikNodeProvider);


const myWallet = wallet.connect(quikNodeProvider);
const poolId = 2n;
const blocksToWait = 4;
const moonToWETH = [ moon, weth ];

async function harvestRewards() {
    const harvestTx = await liquidityPoolMiniProvider.harvest.populateTransaction(poolId, myWallet.address);

    await myWallet.signTransaction(harvestTx);

    const harvestResponse = await myWallet.sendTransaction(harvestTx);

    await harvestResponse.wait(blocksToWait);

    console.log(`Harvested rewards.`);
}

async function convertMoonsToWETH() {
    const block = await quikNodeProvider.getBlock();
    const sixtySecondsFromNow = block.timestamp + 60000;

    const moonsBalance = await moonsContract.balanceOf(myWallet.address);

    const moonBalanceDecimal = FixedNumber.fromValue(moonsBalance, 18);
    const percentage = FixedNumber.fromString(".495");
    const moonsBalancePercent = moonBalanceDecimal.mul(percentage);

    const swapTx = await swapContract.swapExactTokensForETH.populateTransaction(
        moonsBalancePercent.value,
        0n,
        moonToWETH,
        myWallet.address,
        sixtySecondsFromNow);

    await myWallet.signTransaction(swapTx);

    const swapResponse = await myWallet.sendTransaction(swapTx);

    await swapResponse.wait(blocksToWait);

    console.log(`Swapped about 50% of moons for WETH.`);
}

async function addLiquidity() {
    const swapContract = new ethers.Contract(
        swapUniAddress,
        swapUniAbi,
        quikNodeProvider);

    const block = await quikNodeProvider.getBlock();
    const sixtySecondsFromNow = block.timestamp + 60000;

    const response = await lpContract.getReserves();

    const moonReserve = response[0];
    const ethReserve = response[1];
    
    const moonsBalance = await moonsContract.balanceOf(myWallet.address);

    const moonBalanceDecimal = FixedNumber.fromValue(moonsBalance, 18);
    const percentage = FixedNumber.fromString(".99");
    const moonsBalancePercent = moonBalanceDecimal.mul(percentage);
    const moonsBalanceMin = moonsBalancePercent.value;


    const ethReserveFixed = FixedNumber.fromValue(ethReserve, 18);
    const moonReserveFixed = FixedNumber.fromValue(moonReserve, 18);

    const ethToMoonRatio = ethReserveFixed.div(moonReserveFixed);
    const ethToDepositFixed = ethToMoonRatio.mul(moonBalanceDecimal);
    const ethToDepositPercent = ethToDepositFixed.mul(percentage);
    const ethToDeposit = ethToDepositFixed.value;
    const ethToDepositMin = ethToDepositPercent.value;

    console.log(`Reserved moons: ${moonReserve}, Reserved weth: ${ethReserve}.`);
    console.log(`ETH to deposit: ${ethToDeposit}, MOONS to deposit: ${moonsBalance}.`);
    
    const liquidityTx = await swapContract.addLiquidityETH.populateTransaction(
        moon,
        moonsBalance,
        moonsBalanceMin,
        ethToDepositMin,
        myWallet.address,
        sixtySecondsFromNow);

    liquidityTx.value = ethToDeposit;

    await myWallet.signTransaction(liquidityTx);
    const liquidityResponse = await myWallet.sendTransaction(liquidityTx);

    await liquidityResponse.wait(blocksToWait);

    console.log(`Liquidity added.`);
}

async function depositLp() {
    const lpTokenContract = new ethers.Contract(
        lp,
        uniswapERC20ABI,
        quikNodeProvider
    );

    const lpTokenAmount = await lpTokenContract.balanceOf(myWallet.address);

    const depositTx = await liquidityPoolMiniProvider.deposit.populateTransaction(
        poolId, 
        lpTokenAmount, 
        myWallet.address);

    await myWallet.signTransaction(depositTx);

    const depositResponse = await myWallet.sendTransaction(depositTx);

    await depositResponse.wait(blocksToWait);
    
    console.log(`LP tokens deposited.`);
}

exports.sow = async (eventData, context, callback) => {

    await harvestRewards();

    await convertMoonsToWETH();

    await addLiquidity();

    await depositLp();
};