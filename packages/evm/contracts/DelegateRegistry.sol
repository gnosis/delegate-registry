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

    event ExpirationUpdated(string id, uint256 expirationTimestamp);
    event DelegationUpdated(
        address indexed delegator,
        string indexed id,
        Delegation[] delegation,
        uint256 expiration
    );

    /// @dev Delegation is already set to this value.
    error DuplicateDelegation(address emitter, Delegation[] delegation);
    /// @dev Duplicate expiration timestamp.
    error DuplicateTimestamp(address emitter, uint256 expirationTimestamp);

    /// @dev Sets a delegate for the msg.sender and a specific id.
    /// @param id Id for which the delegate should be set.
    /// @param delegation Array of delegations.
    /// @param expirationTimestamp 64-bit Unix timestamp for the date at which this expiration should expire.
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

        delete delegations[msg.sender][id];

        // Update delegation mapping
        for (uint i = 0; i < delegation.length; i++) {
            delegations[msg.sender][id].push(delegation[i]);
        }

        // set delegation expiration
        expirationTimestamps[msg.sender][id] = expirationTimestamp;

        emit DelegationUpdated(msg.sender, id, delegation, expirationTimestamp);
    }

    function setExpiration(
        string memory id,
        uint256 expirationTimestamp
    ) public {
        if (expirationTimestamps[msg.sender][id] == expirationTimestamp)
            revert DuplicateTimestamp(address(this), expirationTimestamp);
        expirationTimestamps[msg.sender][id] = expirationTimestamp;
        emit ExpirationUpdated(id, expirationTimestamp);
    }

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
