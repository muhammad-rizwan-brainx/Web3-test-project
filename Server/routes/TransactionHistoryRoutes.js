const express = require('express');

const transactionController = require('../controllers/TransactionHistoryController');


const Router = express.Router()

Router.post('/', transactionController.addTransaction);
Router.get('/', transactionController.getAllTransactions);

module.exports = Router;