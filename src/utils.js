'use strict'

const GetDateObjFromEpochTS = (epoch) => (new Date( Number(epoch) * 1000 ))
const GetEpochUnixFromDate = (dateObj) => {
    if ( !(dateObj instanceof Date) ) {
        throw new Error('Argument received is not a Date object.')
    }

    return dateObj.getTime() / 1000
}

module.exports = {
    GetDateObjFromEpochTS,
    GetEpochUnixFromDate
}