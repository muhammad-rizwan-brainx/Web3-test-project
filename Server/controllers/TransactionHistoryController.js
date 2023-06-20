
const mongoose = require("mongoose");
const Transaction = require("../models/TransactionModel");
const dotenv = require("dotenv")
dotenv.config()
const root = process.env.ROOT;

exports.addTransaction = (req, res, next) => {
    const detailsTransaction = new
    Transaction({
            _id: new mongoose.Types.ObjectId(),
            tHash: req.body.tHash,
            tokenname: req.body.tokenname
        });
    detailsTransaction.save().then(result => {
        res.status(201).json({
            message: "Transaction Added",
            Transaction: {
                tHash: result.tHash,
                tokenname: result.tokenname,
                id: result._id
            }
        });
    }).catch(err => console.log(err));

}


exports.getAllTransactions = (re, res, next) => {
    Transaction.find().select('tHash tokenname').exec()
        .then(docs => {
            const response = {
                count: docs.length,
                transactions: docs.map(doc => {
                    return {
                        tHash: doc.tHash,
                        tokenname: doc.tokenname,
                        _id: doc._id
                    }
                })
            }
            res.status(200).json(response);
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}