function log(req, res, next){
    console.log('logging.....');
    next()
}

function auth(req, res, next){
    console.log('authenticando .....')
    next()
}

module.exports = {
    log,
    auth
}
