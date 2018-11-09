const Migrations = artifacts.require("./Migrations.sol");
const OwnableWithGuardian = artifacts.require("./OwnableWithGuardian.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(OwnableWithGuardian);
};
