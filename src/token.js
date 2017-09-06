import { Tweenable, each } from './tweenable';

const R_NUMBER_COMPONENT = /(\d|\-|\.)/;
const R_FORMAT_CHUNKS = /([^\-0-9\.]+)/g;
const R_UNFORMATTED_VALUES = /[0-9.\-]+/g;
const R_RGB = (() => {
  const number = R_UNFORMATTED_VALUES.source;
  const comma = /,\s*/.source;

  return new RegExp(
  `rgb\\(${number}${comma}${number}${comma}${number}\\)`,
  'g'
  );
})();
const R_RGB_PREFIX = /^.*\(/;
const R_HEX = /#([0-9]|[a-f]){3,6}/gi;
const VALUE_PLACEHOLDER = 'VAL';

// HELPERS

/**
 * @param {Array.number} rawValues
 * @param {string} prefix
 *
 * @return {Array.<string>}
 * @private
 */
const getFormatChunksFrom = (rawValues, prefix) =>
  rawValues.map((val, i) => `_${prefix}_${i}`);

/**
 * @param {string} formattedString
 *
 * @return {string}
 * @private
 */
const getFormatStringFrom = formattedString => {
  let chunks = formattedString.match(R_FORMAT_CHUNKS);

  if (!chunks) {
    // chunks will be null if there were no tokens to parse in
    // formattedString (for example, if formattedString is '2').  Coerce
    // chunks to be useful here.
    chunks = ['', ''];

    // If there is only one chunk, assume that the string is a number
    // followed by a token...
    // NOTE: This may be an unwise assumption.
  } else if (chunks.length === 1 ||
      // ...or if the string starts with a number component (".", "-", or a
      // digit)...
      formattedString.charAt(0).match(R_NUMBER_COMPONENT)) {

    // ...prepend an empty string here to make sure that the formatted number
    // is properly replaced by VALUE_PLACEHOLDER
    chunks.unshift('');
  }

  return chunks.join(VALUE_PLACEHOLDER);
};

/**
 * Convert a base-16 number to base-10.
 *
 * @param {Number|String} hex The value to convert
 *
 * @returns {Number} The base-10 equivalent of `hex`.
 * @private
 */
function hexToDec (hex) {
  return parseInt(hex, 16);
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
const hexToRGBArray = hex => {
  hex = hex.replace(/#/, '');

  // If the string is a shorthand three digit hex notation, normalize it to
  // the standard six digit notation
  if (hex.length === 3) {
    hex = hex.split('');
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  return [
    hexToDec(hex.substr(0, 2)),
    hexToDec(hex.substr(2, 2)),
    hexToDec(hex.substr(4, 2))
  ];
};

/**
 * @param {string} hexString
 *
 * @return {string}
 * @private
 */
const convertHexToRGB = hexString =>
  `rgb(${hexToRGBArray(hexString).join(',')})`;

/**
 * TODO: Can this be rewritten to leverage String#replace more efficiently?
 * Runs a filter operation on all chunks of a string that match a RegExp
 *
 * @param {RegExp} pattern
 * @param {string} unfilteredString
 * @param {function(string)} filter
 *
 * @return {string}
 * @private
 */
const filterStringChunks = (pattern, unfilteredString, filter) => {
  const patternMatches = unfilteredString.match(pattern);
  let filteredString = unfilteredString.replace(pattern, VALUE_PLACEHOLDER);

  if (patternMatches) {
    patternMatches.forEach(match =>
      filteredString = filteredString.replace(VALUE_PLACEHOLDER, filter(match))
    );
  }

  return filteredString;
};

/**
 * @param {string} str
 *
 * @return {string}
 * @private
 */
const sanitizeHexChunksToRGB = str =>
  filterStringChunks(R_HEX, str, convertHexToRGB);

/**
 * Convert all hex color values within a string to an rgb string.
 *
 * @param {Object} stateObject
 *
 * @return {Object} The modified obj
 * @private
 */
const sanitizeObjectForHexProps = stateObject => {
  each(stateObject, prop => {
    const currentProp = stateObject[prop];

    if (typeof currentProp === 'string' && currentProp.match(R_HEX)) {
      stateObject[prop] = sanitizeHexChunksToRGB(currentProp);
    }
  });
};

/**
 * @param {string} rgbChunk
 *
 * @return {string}
 * @private
 */
const sanitizeRGBChunk = rgbChunk => {
  const numbers = rgbChunk.match(R_UNFORMATTED_VALUES).map(Math.floor);
  const prefix = rgbChunk.match(R_RGB_PREFIX)[0];

  return `${prefix}${numbers.join(',')})`;
};

/**
 * Check for floating point values within rgb strings and round them.
 *
 * @param {string} formattedString
 *
 * @return {string}
 * @private
 */
const sanitizeRGBChunks = formattedString =>
  filterStringChunks(R_RGB, formattedString, sanitizeRGBChunk);

/**
 * Note: It's the duty of the caller to convert the Array elements of the
 * return value into numbers.  This is a performance optimization.
 *
 * @param {string} formattedString
 *
 * @return {Array.<string>|null}
 * @private
 */
const getValuesFrom = formattedString =>
  formattedString.match(R_UNFORMATTED_VALUES);

/**
 * @param {Object} stateObject
 *
 * @return {Object} An Object of formatSignatures that correspond to
 * the string properties of stateObject
 * @private
 */
const getFormatSignatures = stateObject => {
  const signatures = {};

  each(stateObject, propertyName => {
    let property = stateObject[propertyName];

    if (typeof property === 'string') {
      signatures[propertyName] = {
        formatString: getFormatStringFrom(property),
        chunkNames: getFormatChunksFrom(
          getValuesFrom(property),
          propertyName
        )
      };
    }
  });

  return signatures;
};

/**
 * @param {Object} stateObject
 * @param {Object} formatSignatures
 * @private
 */
const expandFormattedProperties = (stateObject, formatSignatures) => {
  each(formatSignatures, propertyName => {
    getValuesFrom(stateObject[propertyName]).forEach((number, i) =>
      stateObject[formatSignatures[propertyName].chunkNames[i]] = +number
    );

    delete stateObject[propertyName];
  });
};

/**
 * @param {Object} stateObject
 * @param {Array.<string>} chunkNames
 *
 * @return {Object} The extracted value chunks.
 * @private
 */
const extractPropertyChunks = (stateObject, chunkNames) => {
  const extractedValues = {};

  chunkNames.forEach(chunkName => {
    extractedValues[chunkName] = stateObject[chunkName];
    delete stateObject[chunkName];
  });

  return extractedValues;
};

/**
 * @param {Object} stateObject
 * @param {Array.<string>} chunkNames
 *
 * @return {Array.<number>}
 * @private
 */
const getValuesList = (stateObject, chunkNames) =>
  chunkNames.map(chunkName => stateObject[chunkName]);

/**
 * @param {string} formatString
 * @param {Array.<number>} rawValues
 *
 * @return {string}
 * @private
 */
const getFormattedValues = (formatString, rawValues) => {
  rawValues.forEach(rawValue =>
    formatString = formatString.replace(
      VALUE_PLACEHOLDER, +rawValue.toFixed(4)
    )
  );

  return formatString;
};

/**
 * @param {Object} stateObject
 * @param {Object} formatSignatures
 * @private
 */
const collapseFormattedProperties = (stateObject, formatSignatures) => {
  each(formatSignatures, prop => {
    const { chunkNames, formatString } = formatSignatures[prop];

    const currentProp = getFormattedValues(
      formatString,
      getValuesList(
        extractPropertyChunks(
          stateObject,
          chunkNames
        ),
        chunkNames
      )
    );

    stateObject[prop] = sanitizeRGBChunks(currentProp);
  });
};

/**
 * @param {Object} easingObject
 * @param {Object} tokenData
 * @private
 */
const expandEasingObject = (easingObject, tokenData) => {
  each(tokenData, prop => {
    const { chunkNames } = tokenData[prop];
    const easing = easingObject[prop];

    if (typeof easing === 'string') {
      const easingNames = easing.split(' ');
      const defaultEasing = easingNames[easingNames.length - 1];

      chunkNames.forEach((chunkName, i) =>
        easingObject[chunkName] = easingNames[i] || defaultEasing
      );
    } else { // easing is a function
      chunkNames.forEach(chunkName =>
        easingObject[chunkName] = easing
      );
    }

    delete easingObject[prop];
  });
};

/**
 * @param {Object} easingObject
 * @param {Object} tokenData
 * @private
 */
const collapseEasingObject = (easingObject, tokenData) => {
  each(tokenData, prop => {
    const { chunkNames } = tokenData[prop];
    const { length } = chunkNames;
    const firstEasing = easingObject[chunkNames[0]];

    if (typeof firstEasing === 'string') {
      easingObject[prop] = chunkNames.map(chunkName => {
        const easingName = easingObject[chunkName];
        delete easingObject[chunkName];

        return easingName;
      }).join(' ');
    } else { // firstEasing is a function
      easingObject[prop] = firstEasing;
    }
  });
};

export function tweenCreated (currentState, fromState, toState) {
  [currentState, fromState, toState].forEach(sanitizeObjectForHexProps);

  this._tokenData = getFormatSignatures(currentState);
}

export function beforeTween (currentState, fromState, toState, easingObject) {
  const { _tokenData } = this;
  expandEasingObject(easingObject, _tokenData);

  [currentState, fromState, toState].forEach(state =>
    expandFormattedProperties(state, _tokenData)
  );
}

export function afterTween (currentState, fromState, toState, easingObject) {
  const { _tokenData } = this;
  [currentState, fromState, toState].forEach(state =>
    collapseFormattedProperties(state, _tokenData)
  );

  collapseEasingObject(easingObject, _tokenData);
}
