import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(CampaignFactory.abi, "0x1538d9E239fB5091299d0f7502b832A577E1Ed75");

export default instance;
