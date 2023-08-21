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
    const { sender, recipient, amount } = req.body;

    setInitialBalance(sender);
    setInitialBalance(recipient);

 if (getOwnerBalance(sender) >= amount) {
    balances.find((record) => record.wallet === sender).balance -= amount;
    balances.find((record) => record.wallet === recipient).balance += amount;
    res.send({ message: "Transfer done successfully", balance: getOwnerBalance(sender) });
} else {
    res.status(400).send({ message: "Not enough funds!" });
}

});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
    if (!balances.some((record) => record.wallet === address)) {
        balances.push({ wallet: address, balance: 0 });
    }
}