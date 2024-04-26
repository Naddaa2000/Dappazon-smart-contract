const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}
let result
const id = 1
const name = "Shoes"
const category = "Clothing"
const image =
    "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const cost = tokens(1)
const rating = 4
const stock = 3
describe("Dappazon", () => {
    let dappazon

    beforeEach(async () => {
        //setup account
        ;[deployer, buyer] = await ethers.getSigners()
        //deploy contract
        const Dappazon = await ethers.getContractFactory("Dappazon")
        dappazon = await Dappazon.deploy()
    })
    describe("development", () => {
        it("has a name", async () => {
            const name = await dappazon.name()
            expect(name).to.equal("Dappazon")
        })
        it("has a address", async () => {
            const name = await dappazon.owner()
            expect(name).to.equal(deployer.address)
        })
    })
    describe("listing", () => {
        let transaction
        beforeEach(async () => {
            transaction = await dappazon
                .connect(deployer)
                .list(id, name, category, image, cost, rating, stock)
            await transaction.wait()
        })
        it("REturn item attribute", async () => {
            const item = await dappazon.items(1)
            expect(item.id).to.equal(id)
            expect(item.name).to.equal(name)
            expect(item.image).to.equal(image)
            expect(item.stock).to.equal(stock)
            expect(item.rating).to.equal(rating)
            expect(item.cost).to.equal(cost)
            expect(item.category).to.equal(category)
        })
        it("emit list event", async () => {
            expect(transaction).to.emit(dappazon, "list")
        })
    })
    describe("buying", () => {
        let transaction
        beforeEach(async () => {
            // list the item
            transaction = await dappazon
                .connect(deployer)
                .list(id, name, category, image, cost, rating, stock)
            await transaction.wait()
            // buy the itemt
            transaction = await dappazon.connect(buyer).buy(id, { value: cost })
        })

        it("Update buyer order count", async () => {
            const result = await dappazon.orderCount(buyer.address)
            expect(result).to.equal(1)
        })
        it("Adds the order", async () => {
            const result = await dappazon.orders(buyer.address, 1)

            expect(result.time).to.be.greaterThan(0)
            expect(result.item.name).to.equal(name)
        })
        it("Update the contract balance", async () => {
            result = await ethers.provider.getBalance(dappazon.address)
            expect(result).to.equal(cost)
        })
        it("emit buy event", async () => {
            expect(transaction).to.emit(dappazon, "buy")
        })
        it("shows total money", async () => {
            const name = await dappazon.getMoney()
            console.log("money", name, "hi", result)
            expect(name).to.equal(result)
        })
    })

    describe("withdraw funds", async () => {
        let transaction, beforeBalance

        beforeEach(async () => {
            // add the product
            transaction = await dappazon
                .connect(deployer)
                .list(id, name, category, image, cost, rating, stock)
            await transaction.wait()

            //buy an item
            transaction = await dappazon.connect(buyer).buy(id, { value: cost })
            await transaction.wait()

            //get developer balance
            beforeBalance = await ethers.provider.getBalance(deployer.address)

            //withdraw funds
            transaction = await dappazon.connect(deployer).withdraw()
            await transaction.wait()
        })

        it("Updates the owner balance", async () => {
            const balanceAfter = await ethers.provider.getBalance(
                deployer.address,
            )
            console.log("before", beforeBalance)
            console.log("after", balanceAfter)
            expect(balanceAfter).to.be.greaterThan(beforeBalance)
        })
        it("Updates the Contract balance", async () => {
            const result = await ethers.provider.getBalance(dappazon.address)
            expect(result).to.equal(0)
        })
    })
})
