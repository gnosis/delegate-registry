// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.17;

struct Delegation {
    bytes32 delegate;
    uint256 ratio;
}

contract Delegates {
    event DelegationUpdated(
        address indexed account,
        string context,
        Delegation[] previousDelegation,
        Delegation[] delegation,
        uint256 expirationTimestamp
    );

    /// @dev Sets a delegate for the msg.sender and a specific context.
    /// @param context ID of the context in which delegation should be set.
    /// @param delegation Array of delegations. Must be sorted in numerical order, from smallest to largets.
    /// @param expirationTimestamp Unix timestamp for at which this delegation should expire.
    /// @notice setDelegation() will overrite the user's previous delegation for the given context.
    function setDelegation(
        string memory context,
        Delegation[] memory delegation,
        uint256 expirationTimestamp
    ) public {
        Delegation[] memory empty;

        emit DelegationUpdated(
            msg.sender,
            context,
            empty,
            delegation,
            expirationTimestamp
        );
    }
}
