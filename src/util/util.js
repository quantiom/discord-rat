module.exports = {
    getShortHwid: (hwid) => {
        if (hwid.length == 64) {
            return hwid.slice(0, 10) + '...';
        }

        return hwid;
    },
};
