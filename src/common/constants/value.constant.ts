/**
 * @file Value constant
 * @module constant/value
 * @author Devhoangkien <https://github.com/devhoangkien>
 */

 export const NULL = null
 export const UNDEFINED = void 0
 
 export const isNull = (value) => value === NULL
 export const isUndefined = (value) => value === UNDEFINED
 export const isVoid = (value) => isNull(value) || isUndefined(value)