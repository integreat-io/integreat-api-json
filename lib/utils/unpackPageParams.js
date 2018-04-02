const decodePage = (page) => {
  const json = Buffer.from(decodeURIComponent(page), 'base64').toString('ascii')
  try {
    return JSON.parse(json)
  } catch (err) {
    return {}
  }
}

const unpack = (params) => {
  const {page, ...rest} = params

  if (isNaN(page)) {
    const pageParams = decodePage(page)
    return {...rest, ...pageParams}
  } else {
    return {...rest, pageSize: page}
  }
}

function unpackPageParams (params) {
  if (!params || !params.page) {
    return params
  }

  return unpack(params)
}

module.exports = unpackPageParams
