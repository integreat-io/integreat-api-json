const createShouldInclude = ({ include = [], exclude = [] }) =>
  function (...parts) {
    const endpoints = parts
      .map((part, index) => parts.slice(0, index + 1).join('/'))

    if (
      exclude.length > 0 &&
      endpoints.some((endpoint) => exclude.includes(endpoint))
    ) {
      return false
    }

    return (include.length === 0) ||
      endpoints.some((endpoint) => include.includes(endpoint))
  }

module.exports = createShouldInclude
