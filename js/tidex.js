'use strict';

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js');

// ---------------------------------------------------------------------------

module.exports = class tidex extends liqui {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tidex',
            'name': 'Tidex',
            'countries': 'UK',
            'rateLimit': 2000,
            'version': '3',
            'has': {
                // 'CORS': false,
                // 'fetchTickers': true
                'fetchCurrencies': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api': {
                    'web': 'https://web.tidex.com/api',
                    'public': 'https://api.tidex.com/api/3',
                    'private': 'https://api.tidex.com/tapi',
                },
                'www': 'https://tidex.com',
                'doc': 'https://tidex.com/exchange/public-api',
                'fees': [
                    'https://tidex.com/exchange/assets-spec',
                    'https://tidex.com/exchange/pairs-spec',
                ],
            },
            'api': {
                'web': {
                    'get': [
                        'currency',
                        'pairs',
                        'tickers',
                        'orders',
                        'ordershistory',
                        'trade-data',
                        'trade-data/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
                },
            },
            'commonCurrencies': {
                'MGO': 'WMGO',
                'EMGO': 'MGO',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.webGetCurrency (params);
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['symbol'];
            let precision = currency['amountPoint'];
            let code = id.toUpperCase ();
            code = this.commonCurrencyCode (code);
            let active = currency['visible'] === true;
            let status = 'ok';
            if (!active) {
                status = 'disabled';
            }
            let canWithdraw = currency['withdrawEnable'] === true;
            let canDeposit = currency['depositEnable'] === true;
            if (!canWithdraw || !canDeposit) {
                active = false;
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': active,
                'status': status,
                'precision': precision,
                'funding': {
                    'withdraw': {
                        'active': canWithdraw,
                        'fee': currency['withdrawFee'],
                    },
                    'deposit': {
                        'active': canDeposit,
                        'fee': 0.0,
                    },
                },
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['withdrawMinAmout'],
                        'max': undefined,
                    },
                    'deposit': {
                        'min': currency['depositMinAmount'],
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    getVersionString () {
        return '';
    }
};
