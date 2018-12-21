module.exports = {
  compilers: {
    solc: {
      version: '^0.4.24',
    },
  },
  networks: {
    local: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
    },
  },
};
