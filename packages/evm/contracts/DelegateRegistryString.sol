// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.17;

struct Delegation {
    string data;
    uint64 term;
}

contract DelegateRegistry {
    // The first key is the delegator and the second key a id.
    // The value is the delegation information.
    mapping(address => mapping(string => Delegation)) public delegation;

    // Using these events it is possible to process the events to build up reverse lookups.
    // The indeces allow it to be very partial about how to build this lookup (e.g. only for a specific delegate).
    event SetDelegation(
        address indexed delegator,
        string indexed id,
        Delegation delegation
    );

    /// @dev Delegation is already set to this value.
    error DuplicateDelegation();

    /// @dev Sets a delegate for the msg.sender and a specific id.
    ///      The combination of msg.sender and the id can be seen as a unique key.
    /// @param id Id for which the delegate should be set.
    /// @param data Delegation data.
    /// @param term Delegation term limit.
    function setDelegate(
        string memory id,
        string memory data,
        uint64 term
    ) public {
        Delegation memory currentDelegation = delegation[msg.sender][id];
        bytes32 currentDelegationDataHash = keccak256(
            abi.encode(currentDelegation.data)
        );
        bytes32 dataHash = keccak256(abi.encode(data));

        if (
            currentDelegationDataHash == dataHash &&
            currentDelegation.term == term
        ) {
            revert DuplicateDelegation();
        }

        // Update delegation mapping
        delegation[msg.sender][id].data = data;
        delegation[msg.sender][id].term = term;

        emit SetDelegation(msg.sender, id, delegation[msg.sender][id]);
    }
}

contract Hmm {
    uint public variable;
}
