const parseCorsOrigin = (origin: string): string | string[] => {
  const arrayPattern = /^\[.*\]$/
  const isArrayOfStrings = arrayPattern.test(origin)

  if (isArrayOfStrings) {
    // Remove single quotes and parse the string as JSON
    const parsedArr = JSON.parse(origin.replace(/'/g, '"'))

    if (!Array.isArray(parsedArr) || !parsedArr.every((item) => typeof item === 'string')) {
      throw new Error('CORS_ORIGIN array is invalid')
    }

    return parsedArr
  }

  return origin
}

export { parseCorsOrigin }
