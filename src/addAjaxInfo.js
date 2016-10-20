'use strict';

module.exports = (recordInfo, info) => {
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

    ajaxs.push(info);

    return recordInfo;
};
