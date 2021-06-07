export const required = value => (value || typeof value === 'number' ? undefined : 'Required');
export const maxLength = max => value =>
    value && value.length > max ? `Maximum ${max} characters` : undefined
export const minLength = min => value =>
    value && value.length < min ? `Must be at least ${min} characters` : undefined
export const number = value =>
    value && isNaN(Number(value)) ? 'Must be a number' : undefined
export const minValue = min => value =>
    value && value < min ? `Must be at least ${min}` : undefined
export const maxValue = max => value =>
    value && value > max ? `Must be less than or equal to ${max}` : undefined
export const validateEmail = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
        ? 'Invalid email address'
        : undefined
export const tooYoung = value =>
    value && value < 13
        ? 'You do not meet the minimum age requirement!'
        : undefined
export const aol = value =>
    value && /.+@aol\.com/.test(value)
        ? 'Really? You still use AOL for your email?'
        : undefined
export const alphaNumeric = value =>
    value && /[^a-zA-Z0-9 ]/i.test(value)
        ? 'Only alphanumeric characters'
        : undefined
export const phoneNumber = value =>
    value && !/^(0|[1-9][0-9]{9})$/i.test(value)
        ? 'Invalid phone number, must be 10 digits'
        : undefined
export const time = value =>
    value && !/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/i.test(value) ? 'Invalid time' : undefined
export const nonZeroPositive = value =>
    value && value <= 0 ? `Must be positive and greater than zero` : undefined
export const zeroPositive = value =>
    value && value < 0 ? `Must be zero or positive` : undefined

export const maxLength5000 = maxLength(5000)
export const maxLength2000 = maxLength(2000)
export const maxLength500 = maxLength(500)
export const maxLength320 = maxLength(320)
export const maxLength255 = maxLength(255)
export const maxLength200 = maxLength(200)
export const maxLength100 = maxLength(100)
export const maxLength50 = maxLength(50)
export const maxLength30 = maxLength(30)
export const maxLength25 = maxLength(25)
export const maxLength15 = maxLength(15)
export const maxLength11 = maxLength(11)
export const maxLength10 = maxLength(10)
export const maxLength6 = maxLength(6)
export const maxLength3 = maxLength(3)

export const maxValue100 = maxValue(100)
export const maxValue1000000 = maxValue(1000000)

export const minLength10 = minLength(10)
export const minLength6 = minLength(6)
export const minLength5 = minLength(5)
export const minLength3 = minLength(3)
export const minLength2 = minLength(2)

export const minValue13 = minValue(13)
export const minValue0 = minValue(0)