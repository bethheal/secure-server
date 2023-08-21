const { secp256k1: secp } = require("ethereum-cryptography/secp256k1"); // Use require for secp
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");
const { toBuffer } = require("ethereum-cryptography/utils");

const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, "..", "records.json");
const fsLines = fs.readFileSync(filePath, "utf8");
const balances = JSON.parse(fsLines);

const getOwnerBalance = (owner) => {
    const record = balances.find((record) => record.wallet === owner);
    return record ? record.balance : 0;
};

app.get("/balance/:address", (req, res) => {
    const { address } = req.params;
    const balance = getOwnerBalance(address);
    res.send({ balance });
});

app.post("/send", (req, res) => {
    const { sender, recipient, amount, nonce, signature } = req.body;

    setInitialBalance(sender);
    setInitialBalance(recipient);

    // Verify the signature
    const isValidSignature = verifySignature(sender, nonce, signature);

    if (!isValidSignature) {
        res.status(400).send({ message: "Invalid signature!" });
        return;
    }

    if (getOwnerBalance(sender) < amount) {
        res.status(400).send({ message: "Not enough funds!" });
    } else {
        balances.find((record) => record.wallet === sender).balance -= amount;
        balances.find((record) => record.wallet === recipient).balance += amount;
        res.send({ balance: getOwnerBalance(sender) });
    }
});

function verifySignature(sender, nonce, signature) {
    const { r, s, v } = signature;
    const publicKey = secp.recoverPublicKey(Buffer.from(nonce.toString(), 'hex'), { r: Buffer.from(r, 'hex'), s: Buffer.from(s, 'hex') }, v - 27);
    const recoveredAddress = getAddress(publicKey);
    return recoveredAddress === sender;
}


app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
    if (!balances.some((record) => record.wallet === address)) {
        balances.push({ wallet: address, balance: 0 });
    }
}