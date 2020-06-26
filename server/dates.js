/**
 * 
 * @param {Number} amount The quantitative amount to display. The "10" part of "10 minutes".
 * @param {String} units Non-plural form of the units. Example: "minute"
 * @returns {String} String with properly formatted time units concatenated.  
 */
function addTimeUnits(amount, units) {
    return `${Math.abs(amount)} ${units}` + (Math.abs(amount) > 1 ? 's' : '') + (amount >= 0 ? '' : ' ago')
}

/**
 * 
 * @param {Number} num Number to round towards zero.
 * @returns {Number} Number rounded towards zero. The absolution value of this number will be less than or equal to num. 
 */
function rtz(num) {
    if (num > 0) {
        return Math.floor(num)
    } else {
        return Math.ceil(num)
    }
}

/**
 * Class that describes durations between two time points. 
 */
class Duration {
    /**
     * 
     * @param {Number} milliseconds Duration in milliseconds. Can be negative.
     */
    constructor(milliseconds) {
        this.milliseconds = milliseconds
        let milliPerYear = 1000 * 60 * 60 * 24 * 365
        this.years = rtz(milliseconds / milliPerYear)
        milliseconds -= this.years * milliPerYear
        let milliPerMonth = 1000 * 60 * 60 * 24 * 30
        this.months = rtz(milliseconds / milliPerMonth)
        milliseconds -= this.months * milliPerMonth
        let milliPerWeek = 1000 * 60 * 60 * 24 * 7
        this.weeks = rtz(milliseconds / milliPerWeek)
        milliseconds -= this.weeks * milliPerWeek
        let milliPerDay = 1000 * 60 * 60 * 24
        this.days = rtz(milliseconds / milliPerDay)
        milliseconds -= this.days * milliPerDay
        let milliPerHour = 1000 * 60 * 60
        this.hours = rtz(milliseconds / milliPerHour)
        milliseconds -= this.hours * milliPerHour
        let milliPerMinute = 1000 * 60
        this.minutes = rtz(milliseconds / milliPerMinute)
        let milliPerSecond = 1000
        this.seconds = rtz(milliseconds / milliPerSecond)
    }
    /**
     * @returns Human readable string describing the duration using the most coast units greater than zero
     */
    toRelativeString() {
        if (Math.abs(this.years) > 0) {
            return addTimeUnits(this.years, 'year')
        } else if (Math.abs(this.months) > 0) {
            return addTimeUnits(this.months, 'month')
        } else if (Math.abs(this.weeks) > 0) {
            return addTimeUnits(this.weeks, 'week')
        } else if (Math.abs(this.days) > 0) {
            return addTimeUnits(this.days, 'day')
        } else if (Math.abs(this.hours) > 0) {
            return addTimeUnits(this.hours, 'hour')
        } else if (Math.abs(this.minutes) > 0) {
            return addTimeUnits(this.minutes, 'minute')
        } else if (Math.abs(this.seconds) > 0) {
            return addTimeUnits(this.seconds, 'second')
        } else {
            return addTimeUnits(this.milliseconds, 'millisecond')
        }
    }
}
/**
 * 
 * @param {String} str String in zulu time format. "20190503T161432" 
 */
export function parseZuluTimeString(str) {
    let year = Number(str.substr(0, 4))
    let month = Number(str.substr(4, 2))-1
    let day = Number(str.substr(6, 2))
    let hour = Number(str.substr(9, 2))
    let minute = Number(str.substr(11, 2))
    let second = Number(str.substr(13, 2))
    return new Date(Date.UTC(year, month, day, hour, minute, second))
}

/**
 * 
 * @param {Date} now 
 * @param {Date} then 
 * @returns {Duration} Duration describing the time period between now and then. Then can be in the future or in the past.
 */
export function getDuration(now, then) {
    return new Duration(then.getTime()-now.getTime())
}

/**
 * 
 * @param {String} str String with a zulu encoded time stamp. "20190503T161432"  
 * @returns {Duration} Duration object representing the time between right now and the date described in the string.
 */
export function getDurationUntilZuluString(str) {
    return getDuration(new Date(Date.now()), parseZuluTimeString(str))
}