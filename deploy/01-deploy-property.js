const { network } = require("hardhat");
const { networkconfig, developmentChains } = require("../helper-hardhat-config");
// const { verify } = require("../utils/verify");
require('dotenv').config();

module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if(chainId==31337){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }
    else{
        ethUsdPriceFeedAddress = networkconfig[chainId]["ethUsdPriceFeed"];
    }
    log("-------------------------------------------------------")
    log("Deploying BlockEstate and waiting confirmation...")
    const blockEstate = await deploy("BlockEstate", {
        contract: "BlockEstate",
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log(`BlockEstate deployed at ${blockEstate.address}`);

    // if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
    //     await verify(blockEstate.address, [ethUsdPriceFeedAddress])
    // }
}

module.exports.tags = ["all", "blockEstate"];