import fs from "fs";
import Web3 from "web3";
import env from "../interfaces/env"

// if the user has buy the templateid
export const marketProvider = () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(env.ETH_NODE))
    const contractInfo = JSON.parse(fs.readFileSync('./abi/contract.json', 'utf-8'));
    return new web3.eth.Contract(contractInfo,env.CONTRACT_ADDRESS)
}