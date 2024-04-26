import { useEffect, useState } from "react"
import { ethers } from "ethers"

// Components
import Navigation from "./components/Navigation"
import Section from "./components/Section"
import Product from "./components/Product"

// ABIs
import Dappazon from "./abis/Dappazon.json"

// Config
import config from "./config.json"

function App() {
    const [account, setAccount] = useState(null)
    const [provider, setProvider] = useState(null)
    const [dappazon, setDappazon] = useState(null)
    const [electronics, setElectronics] = useState(null)
    const [clothing, setClothing] = useState(null)
    const [toys, setToys] = useState(null)
    const [item, setItem] = useState({})
    const [toggle, setToggle] = useState(false)
    const [money, setMoney] = useState(null)
    const togglePop = (item) => {
        setItem(item)
        toggle ? setToggle(false) : setToggle(true)
    }
    const loadBlockchainData = async () => {
        // connect to blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        const network = await provider.getNetwork()

        //connect to smart contract
        const dappazon = new ethers.Contract(
            config[network.chainId].dappazon.address,
            Dappazon,
            provider,
        )
        setDappazon(dappazon)
        //load product
        const items = []
        for (let i = 0; i < 9; i++) {
            const item = await dappazon.items(i + 1)
            items.push(item)
        }
        // const money = await dappazon.getMoney()
        setMoney(money)
        console.log("Money", money)
        console.log("item", items)
        const electronics = items.filter(
            (item) => item.category === "electronics",
        )
        const clothing = items.filter((item) => item.category === "clothing")
        const toys = items.filter((item) => item.category === "toys")

        setElectronics(electronics)
        setClothing(clothing)
        setToys(toys)
        console.log("toys", toys)
    }
    useEffect(() => {
        loadBlockchainData()
    }, [])
    return (
        <div>
            <Navigation
                dappazon={dappazon}
                provider={provider}
                account={account}
                setAccount={setAccount}
            ></Navigation>
            <h2>Dappazon Best Seller!</h2>
            {electronics && clothing && toys && (
                <>
                    {/* <p>{ethers.utils.formatUnits(money.toString(), "ether")}</p> */}
                    <Section
                        title={"Clothing & Jewelry"}
                        items={clothing}
                        togglePop={togglePop}
                    />
                    <Section
                        title={"Electronics & Gadgets"}
                        items={electronics}
                        togglePop={togglePop}
                    />
                    <Section
                        title={"Toys & Gaming"}
                        items={toys}
                        togglePop={togglePop}
                    />
                </>
            )}
            {toggle && (
                <Product
                    item={item}
                    provider={provider}
                    account={account}
                    dappazon={dappazon}
                    togglePop={togglePop}
                />
            )}
        </div>
    )
}

export default App
