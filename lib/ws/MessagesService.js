var gcm = require('node-gcm')
var configurations = require('../../configurations.js')
var pings = require('../Ping.js')

function MessagesService(app) {

    return function() {

        app.post('/ping', function(req, res) {
            console.log("Ping response received from " + req.ip)
            var ping_id = req.body.ping_id
            var phone_number = req.body.phone_number
            var ip = req.body.ip
            var status_code = req.body.status_code

            res.send(pings.addResponse(ping_id, phone_number, ip, status_code))

        })

    }
}

module.exports = MessagesService
