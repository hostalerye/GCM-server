var gcm = require('node-gcm')
var configurations = require('../../configurations.js')
var pings = require('../Ping.js')

function MessagesService(app) {

    return function() {

        app.post('/ping', function(req, res) {
            var ping_id = req.body.ping_id
            var phone_number = req.body.phone_number
            var ip = req.body.ip
            var status_code = req.body.status_code
            console.log("Ping received from "+phone_number+" with status "+status_code)
            res.send(pings.addResponse(ping_id, phone_number, ip, status_code))

        })

    }
}

module.exports = MessagesService
