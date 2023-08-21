const { secp256k1: secp } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");
const fs = require('fs').promises; // Use promises-based fs
const path = require('path');

async function getAddress(publicKey) {
    const newPubKey = publicKey.slice(1)
    const hash = toHex(keccak256(newPubKey))
    return hash.slice(-20)
}

const getNewWallet = async () => {
    try {
        const pik = secp.utils.randomPrivateKey();
        const addr = await getAddress(secp.getPublicKey(pik));

        const record = {
            "wallet": addr,
            "pik": toHex(pik),
            "balance": 200
        }

        const filePath = path.join(__dirname, '..', 'records.json');
        let records = [];
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            if (data) {
                records = JSON.parse(data);
            }
        } catch (err) {
            console.error("Error reading file:", err);
        }

        records.push(record);

        try {
            await fs.writeFile(filePath, JSON.stringify(records));
            console.log("Record added successfully.");
        } catch (err) {
            console.error("Error writing file:", err);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

getNewWallet();