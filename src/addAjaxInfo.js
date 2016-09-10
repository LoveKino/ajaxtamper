'use strict';

module.exports = (ajaxInfoP, recordInfo) => {
    let last = recordInfo.nodes[recordInfo.nodes.length - 1];

    let ajaxs = [];

    if (!last || last.type === 'action') {
        let node = {
            type: 'state',
            duration: [],
            externals: {
                ajax: ajaxs
            }
        };

        recordInfo.nodes.push(node);
    } else {
        last.externals = last.externals || {};
        last.externals.ajax = last.externals.ajax || [];
        ajaxs = last.externals.ajax;
    }

    return Promise.resolve(ajaxInfoP).then((info) => {
        ajaxs.push(info);
    });
};
