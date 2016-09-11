'use strict';

let ajaxproxy = require('ajaxproxy');

let {
    get
} = require('jsenhance');

let jsonTransfer = require('json-transfer');

let {
    proxyAjax
} = ajaxproxy();

let {
    find
} = require('bolzano');

// TODO expand state to same dom node state nearby
// TODO scope logic
module.exports = (opts, {
    initState
}) => {
    let getLog = () => opts.log;

    let stopFlag = false;

    let state = initState;

    let log = (info) => {
        let passLog = getLog();
        if (passLog) {
            return passLog(info);
        } else {
            setTimeout(() => {
                log(info);
            }, 100);
        }
    };

    proxyAjax({
        xhr: {
            proxyOptions: (options) => {
                if (stopFlag) return options;

                log(`[ajax start] options ${JSON.stringify(options)}`);
                return Promise.resolve(state).then((curState) => {
                    if (!curState) return options;
                    let rule = findRuleFromState(curState, options);

                    log(`[ajax rule] find rule ${JSON.stringify(rule)}`);
                    options.rule = rule;
                    return options;
                });
            },

            proxySend: (options) => {
                let rule = options.rule;
                if (rule && rule.type === 'mock') {
                    log(`[ajx mock] rule is ${JSON.stringify(rule)}`);
                    let body = rule.mock;
                    log(`[ajx mock] response body is ${body}`);
                    return {
                        status: 200,
                        statusText: 'OK',
                        bodyType: '',
                        body,
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8'
                        }
                    };
                }
            },

            proxyResponse: (response, options) => {
                let rule = options.rule;
                if (!rule || rule.type === 'mock') return response;

                let oriBody = response.body;
                let body = oriBody;
                try {
                    body = JSON.parse(oriBody);
                } catch (err) {
                    return response;
                }
                if (options.rule) {
                    log(`[ajx tamper] rule is ${JSON.stringify(rule)}`);

                    log(`[ajx tamper] response body is ${oriBody}`);
                    body = jsonTransfer(body, rule.items);

                    log(`[ajx tamper] result is ${JSON.stringify(body)}`);
                }
                response.body = JSON.stringify(body);
                return response;
            }
        }
    });

    return {
        afterPlay: () => {
            stopFlag = true;
        },

        beforeRunAction: (action) => {
            state = action.afterState;
        }
    };
};

let findRuleFromState = (curState, options) => {
    let rules = get(curState, 'externals.ajaxTamper') || [];
    return findRule(options, rules);
};

let findRule = (options, rules) => {
    return find(rules, options, {
        eq: matchRule
    });
};

let matchRule = (options, rule) => {
    let urlReg = new RegExp(rule.url);
    if (!urlReg.test(options.url)) {
        return false;
    }

    if (options.method !== rule.method) {
        return false;
    }

    return true;
};
