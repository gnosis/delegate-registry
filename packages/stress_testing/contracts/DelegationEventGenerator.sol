// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.17;

struct Delegation {
    bytes32 delegate;
    uint256 ratio;
}

contract DelegationEventGenerator {
    event DelegationUpdated(
        address indexed account,
        string context,
        Delegation[] previousDelegation,
        Delegation[] delegation,
        uint256 expirationTimestamp
    );
    event DelegationCleared(
        address indexed account,
        string context,
        Delegation[] delegatesCleared
    );
    event OptOutStatusSet(
        address indexed delegate,
        string context,
        bool optout
    );

    constructor(
        string memory initContext,
        uint256 size,
        uint256 expirationTimestamp
    ) {
        generateDelegations(initContext, 0, size, expirationTimestamp);
        generateClearDelegation(initContext, 0, size);
        generateOptout(initContext, 0, size, true);
    }

    function generateDelegations(
        string memory context,
        uint256 from,
        uint256 to,
        uint256 expirationTimestamp
    ) public {
        for (uint256 i = from; i < to; i++) {
            uint256 numberOfDelegations = i % 5;
            Delegation[] memory delegationSet = new Delegation[](
                numberOfDelegations
            );

            for (uint256 j = 0; j < numberOfDelegations; j++) {
                delegationSet[j] = Delegation({
                    delegate: bytes32(uint256(j + i)),
                    ratio: j + i
                });
            }

            emit DelegationUpdated(
                address(uint160(i)),
                context,
                new Delegation[](0),
                delegationSet,
                expirationTimestamp
            );
        }
    }

    function generateClearDelegation(
        string memory context,
        uint256 from,
        uint256 to
    ) public {
        for (uint256 i = from; i < to; i++) {
            if (i % 12 == 0) {
                emit DelegationCleared(
                    address(uint160(i)),
                    context,
                    new Delegation[](0)
                );
            }
        }
    }

    function generateOptout(
        string memory context,
        uint256 from,
        uint256 to,
        bool _optout
    ) public {
        for (uint256 i = from; i < to; i++) {
            if (i % 6 == 0) {
                emit OptOutStatusSet(address(uint160(i)), context, _optout);
            }
        }
    }
}
