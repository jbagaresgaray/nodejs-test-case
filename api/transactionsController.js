'use strict';

var Transactions = require('../models/transactions.model.js');
var config = require('../config');
var Stripe = require('stripe')(config.stripeApiKey);
var async = require('async');

exports.index = function(req, res, next) {
    if (req.body) {
        var transaction = new Transactions({
            name: req.body.name
        });
        transaction.save(function(err, trans) {
            if (err) {
                return console.log(err);
            }
            res.status(200).end();
        });
    }
};

exports.createTransaction = function(req, res, next) {
    Stripe.card.createToken({
        number: req.body.cardnumber,
        exp_month: req.body['card-expiry-month'],
        exp_year: req.body.['card-expiry-year'],
        cvc: req.body.cvc
    }, function(status, response) {
        Stripe.charges.create({
            amount: req.body.amount,
            currency: req.body.currency,
            source: response.id,
            description: 'Charge for test@example.com'
        }, function(err, charge) {
            if (err) {
                return console.log(err);
            }
            var transaction = new Transactions({
                transactionId: charge.id,
                amount: charge.amount,
                created: charge.created,
                currency: charge.currency,
                description: charge.description,
                paid: charge.paid,
                sourceId: charge.source.id
            });
            transaction.save(function(err) {
                if (err) {
                    return res.status(500);
                } else {
                    res.status(200).json({
                        message: 'Payment is created.'
                    });
                }
            });
            // asynchronously called
        });
    });
};
