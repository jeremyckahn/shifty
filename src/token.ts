import { Tweenable } from './tweenable'

import { EasingKey, EasingObject, isEasingKey, TweenState } from './types'

declare module './tweenable' {
  interface Tweenable {
    /**
     * @ignore
     */
    _tokenData?: FormatSignature
  }
}

interface FormatSignature {
  [propertyName: string]: {
    formatString: string
    chunkNames: string[]
  }
}

type PropertyChunks = { [chunkName: string]: string | number }

const R_NUMBER_COMPONENT = /(\d|-|\.)/
const R_FORMAT_CHUNKS = /([^\-0-9.]+)/g
const R_UNFORMATTED_VALUES = /[0-9.-]+/g

const R_RGBA = (() => {
  const number = R_UNFORMATTED_VALUES.source
  const comma = /,\s*/.source

  return new RegExp(
    `rgba?\\(${number}${comma}${number}${comma}${number}(${comma}${number})?\\)`,
    'g'
  )
})()

const R_RGBA_PREFIX = /^.*\(/
const R_HEX = /#([0-9]|[a-f]){3,6}/gi
const VALUE_PLACEHOLDER = 'VAL'

// HELPERS

/**
 * @param {number[]} rawValues
 * @param {string} prefix
 *
 * @return {Array.<string>}
 * @private
 */
const getFormatChunksFrom = (
  rawValues: number[],
  prefix: string
): Array<string> => rawValues.map((_val, i) => `_${prefix}_${i}`)

/**
 * @param {string} formattedString
 *
 * @return {string}
 * @private
 */
const getFormatStringFrom = (formattedString: string): string => {
  let chunks = formattedString.match(R_FORMAT_CHUNKS)

  if (!chunks) {
    // chunks will be null if there were no tokens to parse in
    // formattedString (for example, if formattedString is '2').  Coerce
    // chunks to be useful here.
    chunks = ['', '']

    // If there is only one chunk, assume that the string is a number
    // followed by a token...
    // NOTE: This may be an unwise assumption.
  } else if (
    chunks.length === 1 ||
    // ...or if the string starts with a number component (".", "-", or a
    // digit)...
    formattedString.charAt(0).match(R_NUMBER_COMPONENT)
  ) {
    // ...prepend an empty string here to make sure that the formatted number
    // is properly replaced by VALUE_PLACEHOLDER
    chunks.unshift('')
  }

  return chunks.join(VALUE_PLACEHOLDER)
}

/**
 * Convert a base-16 number to base-10.
 *
 * @param {string} hex The value to convert.
 *
 * @returns {number} The base-10 equivalent of `hex`.
 * @private
 */
function hexToDec(hex: string): number {
  return parseInt(hex, 16)
}

/**
 * Convert a hexadecimal string to an array with three items, one each for
 * the red, blue, and green decimal values.
 *
 * @param {string} hex A hexadecimal string.
 *
 * @returns {Array.<number>} The converted Array of RGB values if `hex` is a
 * valid string, or an Array of three 0's.
 * @private
 */
const hexToRGBArray = (hex: string): Array<number> => {
  hex = hex.replace(/#/, '')

  // If the string is a shorthand three digit hex notation, normalize it to
  // the standard six digit notation
  if (hex.length === 3) {
    const [r, g, b] = hex.split('')
    hex = r + r + g + g + b + b
  }

  return [
    hexToDec(hex.substring(0, 2)),
    hexToDec(hex.substring(2, 4)),
    hexToDec(hex.substring(4, 6)),
  ]
}

/**
 * @param {string} hexString
 *
 * @return {string}
 * @private
 */
const convertHexToRGB = (hexString: string): string =>
  `rgb(${hexToRGBArray(hexString).join(',')})`

/**
 * TODO: Can this be rewritten to leverage String#replace more efficiently?
 * Runs a filter operation on all chunks of a string that match a RegExp.
 *
 * @param {RegExp} pattern
 * @param {string} unfilteredString
 * @param {function(string)} filter
 *
 * @return {string}
 * @private
 */
const filterStringChunks = (
  pattern: RegExp,
  unfilteredString: string,
  filter: (filter: string) => string
): string => {
  const patternMatches = unfilteredString.match(pattern)
  let filteredString = unfilteredString.replace(pattern, VALUE_PLACEHOLDER)

  if (patternMatches) {
    patternMatches.forEach(
      match =>
        (filteredString = filteredString.replace(
          VALUE_PLACEHOLDER,
          filter(match)
        ))
    )
  }

  return filteredString
}

/**
 * @param {string} str
 *
 * @return {string}
 * @private
 */
const sanitizeHexChunksToRGB = (str: string): string =>
  filterStringChunks(R_HEX, str, convertHexToRGB)

/**
 * Convert all hex color values within a string to an rgb string.
 *
 * @param {Object} stateObject
 * @private
 */
const sanitizeObjectForHexProps = (stateObject: TweenState) => {
  for (const prop in stateObject) {
    const currentProp = stateObject[prop]

    if (typeof currentProp === 'string' && currentProp.match(R_HEX)) {
      stateObject[prop] = sanitizeHexChunksToRGB(currentProp)
    }
  }
}

/**
 * @param {string} rgbChunk
 *
 * @return {string}
 * @private
 */
const sanitizeRGBAChunk = (rgbChunk: string): string => {
  const rgbaRawValues = rgbChunk.match(R_UNFORMATTED_VALUES) ?? []
  const rgbNumbers = rgbaRawValues
    .slice(0, 3)
    .map(rgbChunk => Math.floor(Number(rgbChunk)))
  const prefix = rgbChunk.match(R_RGBA_PREFIX)?.[0]

  if (rgbaRawValues.length === 3) {
    return `${prefix}${rgbNumbers.join(',')})`
  } else if (rgbaRawValues.length === 4) {
    return `${prefix}${rgbNumbers.join(',')},${rgbaRawValues[3]})`
  }

  throw new Error(`Invalid rgbChunk: ${rgbChunk}`)
}

/**
 * Check for floating point values within rgb strings and round them.
 *
 * @param {string} formattedString
 *
 * @return {string}
 * @private
 */
const sanitizeRGBChunks = (formattedString: string): string =>
  filterStringChunks(R_RGBA, formattedString, sanitizeRGBAChunk)

/**
 * Note: It's the duty of the caller to convert the Array elements of the
 * return value into numbers.  This is a performance optimization.
 *
 * @param {string} formattedString
 *
 * @return {Array.<string>|null}
 * @private
 */
const getValuesFrom = (formattedString: string): Array<string> =>
  formattedString.match(R_UNFORMATTED_VALUES) ?? []

/**
 * @param {TweenState} stateObject
 *
 * @return {FormatSignature} An Object of formatSignatures that correspond to
 * the string properties of stateObject.
 * @private
 */
const getFormatSignatures = (stateObject: TweenState): FormatSignature => {
  const signatures: FormatSignature = {}

  for (const propertyName in stateObject) {
    const property = stateObject[propertyName]

    if (typeof property === 'string') {
      signatures[propertyName] = {
        formatString: getFormatStringFrom(property),
        chunkNames: getFormatChunksFrom(
          getValuesFrom(property)?.map(Number),
          propertyName
        ),
      }
    }
  }

  return signatures
}

/**
 * @param {TweenState} stateObject
 * @param {FormatSignature} formatSignatures
 * @private
 */
const expandFormattedProperties = (
  stateObject: TweenState,
  formatSignatures: FormatSignature
) => {
  for (const propertyName in formatSignatures) {
    getValuesFrom(String(stateObject[propertyName])).forEach(
      (number, i) =>
        (stateObject[formatSignatures[propertyName].chunkNames[i]] = +number)
    )

    delete stateObject[propertyName]
  }
}

/**
 * @param {Object} stateObject
 * @param {Array.<string>} chunkNames
 *
 * @return {Object} The extracted value chunks.
 * @private
 */
const extractPropertyChunks = (
  stateObject: TweenState,
  chunkNames: string[]
): PropertyChunks => {
  const extractedValues: PropertyChunks = {}

  chunkNames.forEach(chunkName => {
    extractedValues[chunkName] = stateObject[chunkName]
    delete stateObject[chunkName]
  })

  return extractedValues
}

/**
 * @param {Object} stateObject
 * @param {Array.<string>} chunkNames
 *
 * @return {Array.<number>}
 * @private
 */
const getValuesList = (
  stateObject: TweenState,
  chunkNames: Array<string>
): Array<number> => chunkNames.map(chunkName => Number(stateObject[chunkName]))

/**
 * @param {string} formatString
 * @param {Array.<number>} rawValues
 *
 * @return {string}
 * @private
 */
const getFormattedValues = (
  formatString: string,
  rawValues: Array<number>
): string => {
  rawValues.forEach(
    rawValue =>
      (formatString = formatString.replace(
        VALUE_PLACEHOLDER,
        String(+rawValue.toFixed(4))
      ))
  )

  return formatString
}

/**
 * @param {Object} stateObject
 * @param {FormatSignature} formatSignature
 * @private
 */
const collapseFormattedProperties = (
  stateObject: TweenState,
  formatSignature: FormatSignature
) => {
  for (const prop in formatSignature) {
    const { chunkNames, formatString } = formatSignature[prop]

    const currentProp = getFormattedValues(
      formatString,
      getValuesList(extractPropertyChunks(stateObject, chunkNames), chunkNames)
    )

    stateObject[prop] = sanitizeRGBChunks(currentProp)
  }
}

/**
 * @param {Record<string, string>} easingObject
 * @param {FormatSignature} formatSignature
 * @private
 */
const expandEasingObject = (
  easingObject: EasingObject,
  formatSignature: FormatSignature
) => {
  for (const prop in formatSignature) {
    const { chunkNames } = formatSignature[prop]
    const easing = easingObject[prop]

    if (typeof easing === 'string') {
      const easingNames = easing.split(' ')
      const defaultEasing = easingNames[easingNames.length - 1]

      for (let i = 0; i < chunkNames.length; i++) {
        const chunkName = chunkNames[i]
        const easingName = easingNames[i] ?? defaultEasing

        if (isEasingKey(easingName)) {
          easingObject[chunkName] = easingName
        }
      }
    } else {
      // easing is a function
      chunkNames.forEach(chunkName => (easingObject[chunkName] = easing))
    }

    delete easingObject[prop]
  }
}

/**
 * @param {EasingObject} easingObject
 * @param {FormatSignature} formatSignature
 * @private
 */
const collapseEasingObject = (
  easingObject: EasingObject,
  formatSignature: FormatSignature
) => {
  for (const prop in formatSignature) {
    const { chunkNames } = formatSignature[prop]
    const firstEasing = easingObject[chunkNames[0]]

    if (typeof firstEasing === 'string') {
      easingObject[prop] = chunkNames
        .map(chunkName => {
          const easingName = easingObject[chunkName]
          delete easingObject[chunkName]

          return easingName
        })
        // This typecast isn't accurate, but the logic works and it's performant.
        //
        // TODO: In a future major version, drop support for a single string
        // containing a space-separated list of EasingKeys and add support for an
        // Array of EasingKeys.
        .join(' ') as EasingKey
    } else {
      // firstEasing is a function
      easingObject[prop] = firstEasing
    }
  }
}

/**
 * @memberof Tweenable.filters.token
 * @param {Tweenable} tweenable
 * @returns {boolean}
 */
export const doesApply = (tweenable: Tweenable): boolean => {
  for (const key in tweenable._currentState) {
    if (typeof tweenable._currentState[key] === 'string') {
      return true
    }
  }

  return false
}

/**
 * @memberof Tweenable.filters.token
 * @param {Tweenable} tweenable
 */
export function tweenCreated(tweenable: Tweenable) {
  const { _currentState, _originalState, _targetState } = tweenable
  ;[_currentState, _originalState, _targetState].forEach(
    sanitizeObjectForHexProps
  )

  tweenable._tokenData = getFormatSignatures(_currentState)
}

/**
 * @memberof Tweenable.filters.token
 * @param {Tweenable} tweenable
 */
export function beforeTween(tweenable: Tweenable) {
  const {
    _currentState,
    _originalState,
    _targetState,
    _easing,
    _tokenData,
  } = tweenable

  if (typeof _easing !== 'function' && _tokenData) {
    expandEasingObject(_easing, _tokenData)
  }

  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;[_currentState, _originalState, _targetState].forEach(state =>
    expandFormattedProperties(state, _tokenData ?? {})
  )
}

/**
 * @memberof Tweenable.filters.token
 * @param {Tweenable} tweenable
 */
export function afterTween(tweenable: Tweenable) {
  const {
    _currentState,
    _originalState,
    _targetState,
    _easing,
    _tokenData,
  } = tweenable
  ;[_currentState, _originalState, _targetState].forEach(state =>
    collapseFormattedProperties(state, _tokenData ?? {})
  )

  if (typeof _easing !== 'function' && _tokenData) {
    collapseEasingObject(_easing, _tokenData)
  }
}