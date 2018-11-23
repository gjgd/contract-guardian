const OwnableWithGuardian = artifacts.require('OwnableWithGuardian.sol');
const {
  assertFail,
  blockMiner,
 } = require('./utils');

contract('OwnableWithGuardian', (accounts) => {
  let contract;
  const owner = accounts[0];
  const guardian = accounts[1];
  const newOwner = accounts[2];
  const other = accounts[3];

  before(async () => {
    contract = await OwnableWithGuardian.deployed({from: owner});
  });

  describe('setGuardian', () => {
    it('should fail if not called by the owner', async () => {
      await assertFail(
        contract.setGuardian(guardian, {from: other})
      );
    });

    it('should set a guardian for the contract', async () => {
      let value = await contract.guardian.call();
      assert.equal(0, value);
      await contract.setGuardian(guardian, {from: owner});
      value = await contract.guardian.call();
      assert.equal(guardian, value);
    });
  });

  describe('initiateOwnershipRecovery', () => {
    beforeEach(async () => {
      contract = await OwnableWithGuardian.new({from: owner});
      await contract.setGuardian(guardian, {from: owner});
    });

    it('should fail if not called by the guardian', async () => {
      await assertFail(
        contract.initiateOwnershipRecovery({from: other})
      );
    });

    it('should set endOfChallengePeriod', async () => {
      const length = await contract.CHALLENGE_PERIOD_LENGTH.call();
      let value = await contract.endOfChallengePeriod.call();
      assert.equal(0, value);
      await contract.initiateOwnershipRecovery({from: guardian});
      value = await contract.endOfChallengePeriod.call();
      assert.deepEqual(length.add(web3.eth.blockNumber), value);
    });

    it('should emit an OwnershipRecoveryInitiated event', async () => {
      const tx = await contract.initiateOwnershipRecovery({from: guardian});
      assert.equal('OwnershipRecoveryInitiated', tx.logs[0].event)
    });
  });

  describe('recoverOwnership', () => {
    beforeEach(async () => {
      contract = await OwnableWithGuardian.new({from: owner});
      await contract.setGuardian(guardian, {from: owner});
    });

    it('should fail if called before initiateOwnershipRecovery', async () => {
      await assertFail(
        contract.recoverOwnership(newOwner, { from: guardian })
      );
    });

    it('should fail if called before the end of the challenge period', async () => {
      await contract.initiateOwnershipRecovery({from: guardian});
      await assertFail(
        contract.recoverOwnership(newOwner, { from: guardian })
      );
      const endOfChallengePeriod = await contract.endOfChallengePeriod.call();
      await blockMiner.mineUntilBlock(endOfChallengePeriod - 2);
      await assertFail(
        contract.recoverOwnership(newOwner, { from: guardian })
      );
    });

    it('should fail if not called by the guardian', async () => {
      await contract.initiateOwnershipRecovery({from: guardian});
      const endOfChallengePeriod = await contract.endOfChallengePeriod.call();
      await blockMiner.mineUntilBlock(endOfChallengePeriod - 1);
      await assertFail(
        contract.recoverOwnership(newOwner, { from: other })
      );
    });

    it('should reset the challenge period', async () => {
      await contract.initiateOwnershipRecovery({from: guardian});
      let endOfChallengePeriod = await contract.endOfChallengePeriod.call();
      assert.isAbove(endOfChallengePeriod, web3.eth.blockNumber);
      await blockMiner.mineUntilBlock(endOfChallengePeriod - 1);
      await contract.recoverOwnership(newOwner, {from: guardian});
      endOfChallengePeriod = await contract.endOfChallengePeriod.call();
      assert.equal(endOfChallengePeriod, 0);
    });

    it('should transfer ownership to new owner address', async () => {
      await contract.initiateOwnershipRecovery({from: guardian});
      const endOfChallengePeriod = await contract.endOfChallengePeriod.call();
      await blockMiner.mineUntilBlock(endOfChallengePeriod - 1);
      let currentOwner = await contract.owner.call();
      assert.equal(currentOwner, owner);
      await contract.recoverOwnership(newOwner, {from: guardian});
      currentOwner = await contract.owner.call();
      assert.equal(currentOwner, newOwner);
    });
  });

  describe('cancelOwnershipRecovery', () => {
    it('should fail if not called by the owner', async () => {

    });

    it('should reset the challenge period', async () => {

    });
  });
});
