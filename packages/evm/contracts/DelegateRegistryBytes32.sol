// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.17;

struct Delegation {
    bytes32 id;
    uint256 ratio;
}

contract DelegateRegistry {
    // Mapping from delegator address => context ID => array of delegations.
    mapping(address => mapping(string => Delegation[])) private delegations;
    // Mapping from delegator address => context ID => user-defined delegation expiration dates.
    mapping(address => mapping(string => uint256)) private expirationTimestamps;

    // Using these events it is possible to process the events to build up reverse lookups.
    // The indeces allow it to be very partial about how to build this lookup (e.g. only for a specific delegate).
    event SetDelegate(
        address indexed delegator,
        string indexed id,
        Delegation[] delegation,
        uint256 expiration
    );

    /// @dev Delegation is already set to this value.
    error DuplicateDelegation();

    /// @dev Sets a delegate for the msg.sender and a specific id.
    ///      The combination of msg.sender and the id can be seen as a unique key.
    /// @param id Id for which the delegate should be set.
    /// @param delegation Array of delegations.
    /// @param expirationTimestamp 64-bit Unix timestamp for the date at which this expiration should expire.
    function setDelegate(
        string memory id,
        Delegation[] memory delegation,
        uint256 expirationTimestamp
    ) public {
        // Delegation[] memory currentDelegation = delegations[msg.sender][id];
        bytes32 currentDelegationHash = keccak256(
            abi.encode(delegations[msg.sender][id])
        );
        bytes32 delegationHash = keccak256(abi.encode(delegation));

        if (
            currentDelegationHash == delegationHash &&
            expirationTimestamps[msg.sender][id] == expirationTimestamp
        ) revert DuplicateDelegation();

        delete delegations[msg.sender][id];

        // Update delegation mapping
        for (uint i = 0; i < delegation.length; i++) {
            delegations[msg.sender][id][i] = delegation[i];
        }

        // set delegation expiration
        expirationTimestamps[msg.sender][id] = expirationTimestamp;

        emit SetDelegate(msg.sender, id, delegation, expirationTimestamp);
    }
}
