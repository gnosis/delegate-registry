// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.17;

struct Delegation {
    bytes32 id;
    uint64 ratio;
    uint64 term;
}

contract DelegateRegistry {
    // The first key is the delegator and the second key a id.
    // The value is the delegation information.
    mapping(address => mapping(string => Delegation[])) public delegations;

    // Using these events it is possible to process the events to build up reverse lookups.
    // The indeces allow it to be very partial about how to build this lookup (e.g. only for a specific delegate).
    event SetDelegate(
        address indexed delegator,
        string indexed id,
        Delegation[] delegation
    );

    /// @dev Delegation is already set to this value.
    error DuplicateDelegation();

    /// @dev Sets a delegate for the msg.sender and a specific id.
    ///      The combination of msg.sender and the id can be seen as a unique key.
    /// @param id Id for which the delegate should be set.
    /// @param delegation Array of delegations.
    function setDelegate(
        string memory id,
        Delegation[] memory delegation
    ) public {
        Delegation[] memory currentDelegation = delegations[msg.sender][id];
        bytes32 currentDelegationHash = keccak256(
            abi.encode(currentDelegation)
        );
        bytes32 delegationHash = keccak256(abi.encode(delegation));

        if (currentDelegationHash == delegationHash)
            revert DuplicateDelegation();

        // Update delegation mapping
        delegations[msg.sender][id] = delegation;

        emit SetDelegate(msg.sender, id, delegation);
    }
}
