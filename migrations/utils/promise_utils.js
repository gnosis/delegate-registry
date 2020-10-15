const toConfirmationPromise = promiEvent => new Promise((resolve, reject) => {
    promiEvent
        .on('confirmation', (_n, receipt) => resolve(receipt))
        .on('error', reject);
});

Object.assign(exports, {
    toConfirmationPromise,
})