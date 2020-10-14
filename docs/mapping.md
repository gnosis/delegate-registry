## Building a reverse delegate lookup map

### Events

```js
event SetDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate);
event ClearDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate);
```

We can filter the events on a specific `delegate` or `id` to calculate the reverse lookup only in that context.

### Pseudo Code for simple reverse lookup

```
map(delegate -> id -> set(delegator)) reverse_lookup

for each event:
  if "SetDelegate":
    reverse_lookup[delegate][id].add(delegator)
  if "ClearDelegate":
    reverse_lookup[delegate][id].remove(delegator)
```

### TODO
- Example reverse lookup at specific block time
- Example for subgraph