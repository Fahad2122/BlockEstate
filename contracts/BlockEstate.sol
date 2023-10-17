// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

error NotOwner();

/** @title BlockEstate, blockchain based solution for sell and purchase of property
 * @author Muhammad Fahad
 * @notice this contract is used for record of property ownership
 * @dev This implement priceFeed as library
 */

contract BlockEstate{
    using PriceConverter for uint256;

    struct Property{
        address propertyHash;
        address propertyOwner;
        uint256 value;
        bool isApproved;
        bool isAvailble;
    }
    mapping (uint256 => Property) properties;
    address immutable owner;

    AggregatorV3Interface priceFeed;

    constructor(address priceFeedAddress){
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner{
        if(owner == msg.sender) revert NotOwner();
        _;
    }

    function sell(uint256 _propertyId, address _propertyHash, uint256 _value) public {
        properties[_propertyId] = Property({
            propertyHash: _propertyHash,
            propertyOwner: msg.sender,
            value: _value,
            isApproved: false,
            isAvailble: true
        });
    }

    function purchase(uint256 _propertyId) public payable {
        Property storage prop = properties[_propertyId];
        require(prop.isAvailble, "Not for sell!");
        require(prop.isApproved, "Not Approved Yet!");
        uint256 ethAmountInUsd = msg.value.getConversionRate(priceFeed);
        require(ethAmountInUsd >= prop.value*1e18);
        if(ethAmountInUsd > prop.value*1e18){
            payable(msg.sender).transfer(msg.value - prop.value);
        }
        payable(prop.propertyOwner).transfer(prop.value);
        prop.propertyOwner = msg.sender;
        prop.isAvailble = false;
        prop.value = 0;
    }

    function approveInspection(uint256 _propertyId) public onlyOwner {
        properties[_propertyId].isApproved = true;
    }

    function negotiaite(uint256 _propertyId, uint256 _value) public {
        Property storage prop = properties[_propertyId];
        require(msg.sender == prop.propertyOwner);
        prop.value = _value;
    }

    function closeSale(uint256 _propertyId) public {
        Property storage prop = properties[_propertyId];
        require(msg.sender == prop.propertyOwner);
        prop.isAvailble = false;
    }

    function openSale(uint256 _propertId, uint256 _value) public {
        Property storage prop = properties[_propertId];
        require(msg.sender == prop.propertyOwner);
        prop.isAvailble = true;
        prop.value = _value;
        prop.isApproved = false;
    }

    function checkPropertyOwner(uint256 _propertyId) public view returns(address) {
        return properties[_propertyId].propertyOwner;
    }
    function checkPropertyValue(uint256 _propertyId) public view returns(uint256) {
        return properties[_propertyId].value;
    }
    function checkIsApproved(uint256 _propertyId) public view returns(bool) {
        return properties[_propertyId].isApproved;
    }
    function checkIsAvailble(uint256 _propertId) public view returns(bool) {
        return properties[_propertId].isAvailble;
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return priceFeed;
    }

}