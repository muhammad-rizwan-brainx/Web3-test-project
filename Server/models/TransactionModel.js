const mongoose = require('mongoose');


const transactionSchema = mongoose.Schema({
    tHash: {
        type: String,
        required: true
    },
    tokenname: {
        type: String
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Transaction', transactionSchema);