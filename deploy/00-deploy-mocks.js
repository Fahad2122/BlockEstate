const { network } = require("hardhat");

const DECIMALS = 8;
const INITIAL_VALUE = 20000000000000;
module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if(chainId==31337){
        log("Local netwrok detected, deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_VALUE]
        })
        log("Mock Deployed");
        log("-------------------------------------------------------")
    }

}

module.exports.tags = ["all", "mocks"];