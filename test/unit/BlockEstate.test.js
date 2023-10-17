const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");

describe("blockEstate", function () {
    let blockEstate;
    let MockV3Aggregator;
    let deployer;
    let blockEstateContractAddress;
    let MockV3AggregatorContractAddress;

    let propertyId = 123;
    let propertHash = "0x99db9F61834dfD1B5010120f68378c11f990a14d";
    let propertyValue = 1000;

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        blockEstateContractAddress = (await deployments.get("BlockEstate")).address;
        blockEstate = await ethers.getContractAt("BlockEstate", blockEstateContractAddress);
        MockV3AggregatorContractAddress = (await deployments.get("MockV3Aggregator")).address;
        MockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", MockV3AggregatorContractAddress);
    });

    describe("constructor", function () {
        it("sets the aggregator address correctly", async () => {
            const response = await blockEstate.getPriceFeed();
            assert.equal(response, (await MockV3Aggregator.getAddress()));
        })
    })

    describe("sell", function () {
        beforeEach(async() => {
            await blockEstate.sell(propertyId, propertHash, propertyValue);
        })

        it("sets the house sell data correctly", async () => {
            const valueResponse = await blockEstate.checkPropertyValue(propertyId);
            assert.equal(propertyValue, valueResponse);
        })

        let newValue = 900;
        it("Negotiate the price and sets new price correctly", async () => {
            await blockEstate.negotiaite(propertyId, newValue);
            const valueResponse = await blockEstate.checkPropertyValue(propertyId);
            assert.equal(newValue, valueResponse)
        })

        it("close the sell of house", async () => {
            await blockEstate.closeSale(propertyId);
            const availbilty = await blockEstate.checkIsAvailble(propertyId);
            assert.equal(false, availbilty);
        })

        it("initially house is not approved by inspection team", async () => {
            assert.equal(false, await blockEstate.checkIsApproved(propertyId));
        })

        it("Fail, if owner is not calling this function", async () => {
            await expect(blockEstate.approveInspection(propertyId)).to.be.revertedWithCustomError(blockEstate, "NotOwner")
        })

        // it("approve the house", async () => {
            // await blockEstate.app
        // })

        describe("purchase", function () {
            it("Fails, because house is not for sell", async () => {
                await blockEstate.closeSale(propertyId);
                await expect(blockEstate.purchase(propertyId)).to.be.revertedWith("Not for sell!");
            })
            it("Fails, because house is not approved by inspection team", async () => {
                await expect(blockEstate.purchase(propertyId)).to.be.revertedWith("Not Approved Yet!");
            })
            // it("Fails if you don't transfer required property value", async () => {
                // await expect(blockEstate.purchase(propertyId)).to.be.revertedWith("You need to spend more ETH!");
            // })
        })

    })

    // describe("negotiaite", function () {
    //     
        
    // })

    // describe("purchase", function () {
    //     beforeEach(async() =>)
    // })
})