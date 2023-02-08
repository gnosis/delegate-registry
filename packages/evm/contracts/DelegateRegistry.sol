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

    event ExpirationUpdated(
        address indexed delegator,
        string id,
        Delegation[] delegation,
        uint256 expirationTimestamp
    );
    event DelegationUpdated(
        address indexed delegator,
        string id,
        Delegation[] previousDelegation,
        Delegation[] delegation,
        uint256 expirationTimestamp
    );
    event DelegationCleared(
        address indexed delegator,
        string id,
        Delegation[] delegatesCleared
    );

    /// @dev Delegation is already set to this value.
    error DuplicateDelegation(address emitter, Delegation[] delegation);
    /// @dev Duplicate expiration timestamp.
    error DuplicateTimestamp(address emitter, uint256 expirationTimestamp);
    /// @dev Given delegate ID is 0 or a duplicate.
    error InvalidDelegateID(address emiter, bytes32 delegateId);

    /// @dev Sets a delegate for the msg.sender and a specific id.
    /// @param id  ID of the context in which delegation should be set.
    /// @param delegation Array of delegations.
    /// @param expirationTimestamp Unix timestamp for at which this delegation should expire.
    function setDelegation(
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
        ) revert DuplicateDelegation(address(this), delegation);

        emit DelegationUpdated(
            msg.sender,
            id,
            delegations[msg.sender][id],
            delegation,
            expirationTimestamp
        );

        delete delegations[msg.sender][id];

        // Update delegation mapping
        bytes32 previous;
        for (uint i = 0; i < delegation.length; i++) {
            if (delegation[i].id <= previous)
                revert InvalidDelegateID(address(this), delegation[i].id);
            delegations[msg.sender][id].push(delegation[i]);
            previous = delegation[i].id;
        }

        // set delegation expiration
        expirationTimestamps[msg.sender][id] = expirationTimestamp;
    }

    /// @dev Clears msg.sender's delegation in a given context.
    /// @param id ID of the context in which delegation should be cleared.
    function clearDelegation(string memory id) public {
        emit DelegationCleared(msg.sender, id, delegations[msg.sender][id]);
        delete delegations[msg.sender][id];
        delete expirationTimestamps[msg.sender][id];
    }

    /// @dev Sets msg.senders expiration timestamp for a given context.
    /// @param id ID of the context in which the timestamp should be set.
    /// @param expirationTimestamp Unix timestamp at which the delegations in this context should expire.
    function setExpiration(
        string memory id,
        uint256 expirationTimestamp
    ) public {
        if (expirationTimestamps[msg.sender][id] == expirationTimestamp)
            revert DuplicateTimestamp(address(this), expirationTimestamp);
        expirationTimestamps[msg.sender][id] = expirationTimestamp;
        emit ExpirationUpdated(
            msg.sender,
            id,
            delegations[msg.sender][id],
            expirationTimestamp
        );
    }

    /// @dev Returns the delegation details for a given delegator in a given context.
    /// @param id ID of the context to query.
    /// @param delegator Address of the delegator to query.
    /// @return delegation Array of delegations.
    /// @return expirationTimestamp Unix timestamp at which this delegation will expire.
    function getDelegation(
        string memory id,
        address delegator
    )
        public
        view
        returns (Delegation[] memory delegation, uint256 expirationTimestamp)
    {
        delegation = delegations[delegator][id];
        expirationTimestamp = expirationTimestamps[delegator][id];
    }
}
