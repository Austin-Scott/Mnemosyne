function addTimeUnits(amount, units) {
    return `${Math.abs(amount)} ${units}` + (Math.abs(amount) > 1 ? 's' : '') + (amount >= 0 ? '' : ' ago')
}

//Round towards zero
function rtz(num) {
    if (num > 0) {
        return Math.floor(num)
    } else {
        return Math.ceil(num)
    }
}

class Duration {
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

export function parseZuluTimeString(str) {
    let year = Number(str.substr(0, 4))
    let month = Number(str.substr(4, 2))-1
    let day = Number(str.substr(6, 2))
    let hour = Number(str.substr(9, 2))
    let minute = Number(str.substr(11, 2))
    let second = Number(str.substr(13, 2))
    return new Date(Date.UTC(year, month, day, hour, minute, second))
}

//Pass Date() objects representing now and then
export function getDuration(now, then) {
    return new Duration(then.getTime()-now.getTime())
}

export function getDurationUntilZuluString(str) {
    return getDuration(new Date(Date.now()), parseZuluTimeString(str))
}