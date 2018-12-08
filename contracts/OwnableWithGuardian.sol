pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title OwnableWithGuardian 
 * @dev OwnableWithGuardian is an extension of the standard Ownable pattern that provides a trustless
 * mechanism for recovering the ownership of a contract in the event of a loss of private keys
 */
contract OwnableWithGuardian is Ownable {
  address public guardian;

  // Challenge period's length is roughly one week
  uint public challengePeriodLength = 5760 * 7;
  uint public endOfChallengePeriod;

  event OwnershipRecoveryInitiated();

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyGuardian() {
    require(msg.sender == guardian);
    _;
  }

  /**
   * @dev Allows the current owner to change the length of the challenge period
   * @param _challengePeriodLength New length of the challenge period
   */
  function setChallengePeriodLength(uint _challengePeriodLength) external onlyOwner {
    challengePeriodLength = _challengePeriodLength;
  }

  /**
   * @dev Allows the current owner to nominate a guardian for the contract
   * @param _guardian The address of the guardian
   */
  function setGuardian(address _guardian) external onlyOwner {
    guardian = _guardian;
  }

  /**
  * @dev Allows the current guardian to start an ownership recovery procedure
  * This starts a challenge period of length CHALLENGE_PERIOD_LENGTH
  * after which the guardian will be able to call recoverOwnership
  */
  function initiateOwnershipRecovery() external onlyGuardian {
    endOfChallengePeriod = block.number + challengePeriodLength;
    emit OwnershipRecoveryInitiated();
  }

  /**
   * @dev Allows the current guardian to transfer ownership to a new address
   * after the challenge period is over.
   * The assumption is that if the owner hasn't called cancelOwnershipRecovery
   * at this point, it means he lost his private keys and trusts that the guardian
   * will give him ownership back on his _newOwner address
   * @param _newOwner The new address of the owner
   * (or the address of the new owner...)
   */
  function recoverOwnership(address _newOwner) external onlyGuardian {
    require(
      endOfChallengePeriod > 0,
      "Cannot call recoverOwnership before initiateOwnershipRecovery()"
    );
    require(
      block.number >= endOfChallengePeriod,
      "Cannot call recoverOwnership before the end of the challenge period"
    );
    // Reset challenge period so that recoverOwnership cannot be called
    // without calling initiateOwnershipRecovery again
    endOfChallengePeriod = 0;
    // This method is from the Ownable contract
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Allows the current owner to cancel an ownership recovery procedure
   * if owner is still in control of his private keys
   */
  function cancelOwnershipRecovery() external onlyOwner {
    // Reset challenge period so that recoverOwnership cannot be called
    endOfChallengePeriod = 0;
  }
}
