// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    string public name;
    address public owner;
    uint256 public money;
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }
    struct Order {
        uint256 time;
        Item item;
    }
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;
    event List(string name, uint256 cost, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    constructor() {
        name = "Dappazon";
        owner = msg.sender;
        money = 0;
    }

    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        require(msg.sender == owner);
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );
        items[_id] = item;

        // Emit event
        emit List(_name, _cost, _stock);
    }

    //buy the product
    function buy(uint256 _id) public payable {
        // fetch the item
        Item memory item = items[_id];
        // Require enough ether to buy item
        require(msg.value >= item.cost);

        // Require item is in stock
        require(item.stock > 0);
        // create order
        Order memory order = Order(block.timestamp, item);
        money = money + msg.value;
        //add order for user
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        // decrease the stock
        items[_id].stock = item.stock - 1;
        //emit the event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
        //alternate code
        //    payable(owner).transfer(address(this).balance);
        //
    }

    function getMoney() public view returns (uint256) {
        return money;
    }
}
