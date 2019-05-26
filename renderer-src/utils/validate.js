export const validateValuesWithRules = (values = {}, rules = {}, ignoredFields = ['errors']) => {

  let errors = null

  Object.keys(values).forEach((key) => {

    if (ignoredFields.includes(key) || !rules[key]) {
      return true
    }

    if (rules[key].pattern && values[key] && !(rules[key].pattern.test(values[key]))) {
      errors = errors || {}
      errors[key] = rules[key].invaildMessage
    }

    if (rules[key].required && !values[key]) {
      errors = errors || {}
      errors[key] = rules[key].emptyMessage
    }

    if (rules[key].equalField && values[key] !== values[rules[key].equalField]) {
      errors = errors || {}
      errors[key] = rules[key].feildNotEqualMessage
    }

    if (rules[key].equalValue && values[key] !== rules[key].equalValue) {
      errors = errors || {}
      errors[key] = rules[key].valueNotEqualMessage
    }

  })

  return errors

}