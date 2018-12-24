# Contract Guardian [![Build Status](https://travis-ci.com/gjgd/contract-guardian.svg?branch=master)](https://travis-ci.com/gjgd/contract-guardian) [![Coverage Status](https://coveralls.io/repos/github/gjgd/contract-guardian/badge.svg?branch=master)](https://coveralls.io/github/gjgd/contract-guardian?branch=master)

This repository is a proof of concept for an alternative way for recovering ownership of a smart contract after the owner lost access to their private keys.

## Existing solutions for recovering ownership of a smart contract

- Don't lose your keys
- Use upgradable contracts: expensive (uses a proxy contract), and trades off trust for convenience
- Multisig: Impractical because too expensive
- Multiple owners: Trust problem
- Creating a new contract: Not convenient, have to update the reference of the new contract in all client software.

Guardians solve all those problems:

- Low trust required: A guardian has no power until the owner lose their keys
- Lightweight: Doesn't increase gas cost of transactions (no proxy contract)


## New approach to key recovery: the Guardian

The solution introduced in this repo is to add another role: the "guardian" who is a trusted third party whose only power is to give back the ownership of the contract to the owner when they lost their keys.


### How it works in the case where the owner lost access to his private keys

1) Owner asks the guardian to initiate an `OwnershipRecovery` procedure
2) Guardian calls the `initiateOwnershipRecovery()` function of the smart contract.
3) This will start a `ChallengePeriod` that will last for `challengePeriodLength` blocks
4) If the owner lost his keys, guardian waits out the challenge period and is then able to change the owner of the contract to another address.
5) If the owner didn't lose his keys, the owner can notice that his guardian wants to change ownership of the contract. The owner can cancel the request during the challenge period. He can notice it by watching the blockchain eventlog. 



## FAQ

### Why not use a multisig owner

Multisig is expensive, both in terms of on-chain computation it requires, and of the number of operations necessary to sign a transactions.

### What if the guardian loses their keys?

It's ok because the owner can nominate another guardian by calling `setGuardian()`. This is what makes the guardian system robust: An owner can nominate a new guardian after the old one lost their keys, and a guardian can nominate a new owner after the old one lost their keys. However if both the guardian and the owner lose their keys, then ownership cannot be recovered.

### In the case where the owner lost their keys, what keeps the guardian from giving himself, or a malicious third party ownership of the contract?

Nothing. You should only give guardianship of your contract to a trusted person. By chosing to use a guardian, you are deciding that you'd rather be able to recover ownership (with a small chance that someone else gets the ownership in the case where you guardian is malicious) than not being able to recover ownership at all.

You only have to trust that your guardian will give ownership to an address you have control of when you lost your keys (and when the challenge period is over).

### What happens if an attacker steals my private keys?

If an attacker steals your private keys, you can potentially recover ownership with your guardian, if the attacker forgets to reset the guardian...


## Running the tests

Run 
```
npm run test
```
