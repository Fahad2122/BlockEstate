const networkconfig = {
    31337: {
        name: "localhost"
    },
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}

const developmentChains = ["localhost", "hardhat"]

module.exports ={
    networkconfig,
    developmentChains
}