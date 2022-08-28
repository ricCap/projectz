import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export const createNft = async (
    minterContract,
    performActions,
    { name, description, ipfsImage, ownerAddress, attributes }
) => {
    await performActions(async (kit) => {
        if (!name || !description || !ipfsImage) return;
        const { defaultAccount } = kit;

        // convert NFT metadata to JSON format
        const data = JSON.stringify({
            name,
            description,
            image: ipfsImage,
            owner: defaultAccount,
            attributes,
        });

        try {
            // save NFT metadata to IPFS
            const added = await client.add(data);

            // IPFS url for uploaded metadata
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;

            // mint the NFT and save the IPFS url to the blockchain
            let transaction = await minterContract.methods
                .safeMint(ownerAddress, url)
                .send({ from: defaultAccount });

            return transaction;
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    });
};

export const uploadToIpfs = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const added = await client.add(file, {
            progress: (prog) => console.log(`received: ${prog}`),
        });
        return `https://ipfs.infura.io/ipfs/${added.path}`;
    } catch (error) {
        console.log("Error uploading file: ", error);
    }
};

export const getNfts = async (minterContract) => {
    try {
        const nfts = [];
        const nftsLength = await minterContract.methods.totalSupply().call();
        for (let i = 0; i < Number(nftsLength); i++) {
            const nft = new Promise(async (resolve) => {
                const res = await minterContract.methods.tokenURI(i).call();
                const meta = await fetchNftMeta(res);
                const owner = await fetchNftOwner(minterContract, i);
                resolve({
                    index: i,
                    owner,
                    name: meta.data.name,
                    image: meta.data.image,
                    description: meta.data.description,
                    attributes: meta.data.attributes,
                });
            });
            nfts.push(nft);
        }
        return Promise.all(nfts);
    } catch (e) {
        console.log({ e });
    }
};

export const fetchNftMeta = async (ipfsUrl) => {
    try {
        if (!ipfsUrl) return null;
        const meta = await axios.get(ipfsUrl);
        return meta;
    } catch (e) {
        console.log({ e });
    }
};

export const fetchNftOwner = async (minterContract, index) => {
    try {
        return await minterContract.methods.ownerOf(index).call();
    } catch (e) {
        console.log({ e });
    }
};

export const fetchNftContractOwner = async (minterContract) => {
    try {
        let owner = await minterContract.methods.owner().call();
        return owner;
    } catch (e) {
        console.log({ e });
    }
};