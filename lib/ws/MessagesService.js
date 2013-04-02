var gcm = require('node-gcm')
var configurations = require('../../configurations.js')
var pings = require('../Ping.js')

function MessagesService(app) {

    return function() {

        app.post('/ping', function(req, res) {
            var ping_id = req.body.ping_id
            var phone_number = req.body.phone_number
            var ip = req.body.ip

            res.send(pings.addResponse(ping_id, phone_number, ip))

        })

    }
}

module.exports = MessagesService
