const healthcheck = (req, res) => {
    res.status(200)
    .json({
        message: 'Success',
        string: 'Finternet is future',
        timestamp: new Date().toISOString(),
    })
}

export { healthcheck };