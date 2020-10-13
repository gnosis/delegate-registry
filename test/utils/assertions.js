const assertRejects = async (q, msg) => {
    let res, catchFlag = false
    try {
        res = await q
    } catch(e) {
        catchFlag = true
    } finally {
        if(!catchFlag)
            assert.fail(res, null, msg)
    }
    return res
}

Object.assign(exports, {
    assertRejects
})
