import { ethers } from "ethers"
import { useEffect, useState } from "react"

const Navigation = ({ dappazon, provider, account, setAccount }) => {
    const [owner, setOwner] = useState("")
    const [isOwner, setIsOwner] = useState(false)
    const connectHandler = async () => {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        })
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)
    }
    // Function to handle withdraw
    const withdrawHandler = async () => {
        try {
            const signer = await provider.getSigner()
            const transaction = await dappazon.connect(signer).withdraw()
            await transaction.wait()
            // Optionally, you can fetch and update the owner's amount here
        } catch (error) {
            console.error("Error withdrawing:", error)
            // Handle error
        }
    }
    useEffect(() => {
        const fetchOwner = async () => {
            const contractOwner = await dappazon.owner()
            setOwner(contractOwner)
            setIsOwner(contractOwner === account) // Check if connected account is owner
        }
        fetchOwner()
    }, [account])
    return (
        <nav>
            <div className="nav__brand">
                <h1>Dappazon </h1>
            </div>
            <input className="nav__search" type="text"></input>
            {/* <button className="nav__connect" type="button">
                {account.slice(0, 6) + "..." + account.slice(38, 42)}
            </button> */}
            <div>
                {isOwner && (
                    <button onClick={withdrawHandler} className="nav__connect">
                        Withdraw
                    </button>
                )}
                {account ? (
                    <button className="nav__connect" type="button">
                        {account.slice(0, 6) + "..." + account.slice(38, 42)}
                    </button>
                ) : (
                    <button
                        className="nav__connect"
                        type="button"
                        onClick={connectHandler}
                    >
                        connect
                    </button>
                )}
            </div>
            <ul className="nav__links">
                <li>
                    <a href="#Clothing & Jewelry">Clothing & Jewelry</a>
                </li>
                <li>
                    <a href="#Electronics & Gadgets">Electronics & Gadgets</a>
                </li>
                <li>
                    <a href="#Toys & Gaming">Toys & Gaming</a>
                </li>
            </ul>
        </nav>
    )
}

export default Navigation
