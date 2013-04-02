var gcm = require('node-gcm')
var configurations = require('../../configurations.js')
var crypto = require('crypto')
var pings = require('../Ping.js')

var db = require('mongojs').connect(configurations.db)
var devices = db.collection('devices')


function send_ping(timeout, registrationIds, cb) {

    var message = new gcm.Message()
    var sender = new gcm.Sender(configurations.apikey)
    
    var ping_id = crypto.randomBytes(20).toString('hex')
    
    pings.createPing(ping_id)

    message.addData('ping_id', ping_id)
    message.addData('status_code',42)

    if(results && results.results) {
        for(var i=0; i<results.results.length;i++) {
            var result = results.results[i]

            if(result.messageId) {
                var canonicalRegId = result.canonicalRegistrationId

                if(canonicalRegId) {
                    db.devices.findAndModify({
                        query: {registration_id: registrationIds[i]},
                        update: {$set: {registration_id: canonicalRegId}},
                        new: true
                    }, function(update_error, device) {
                        if(err) console.log(update_error)
                    })
                }
            } else {
                if(result.errorCode && result.errorCode.equals(gcm.Constants.ERROR_NOT_REGISTERED)) {
                    db.devices.remove({registration_id: registrationsIds[i]}, function(db_err, device) {
                            if(err) console.log(db_err)
                    })
                }
            }
        }
    }
    
    setTimeout(
        function() {
            cb(undefined, pings.getPing(ping_id).responses)
        }, timeout
    )
}



}

var DevicesHelper = {}

DevicesHelper.get_all_devices = function(cb) {
    db.devices.find({}, cb(err, objects))
}

DevicesHelper.ping_all_devices = function(timeout, cb) {
    var registrationIds = []

    db.devices.find().toArray(
        function(err, objects) {
            if(err) return cb(err)

            objects.forEach(function(object) {
                registrationIds.push(object.registration_id)
            })
            
            
            send_ping(timeout, registrationIds, cb)
        })
}

DevicesHelper.ping_devices = function(devices, timeout, cb) {
    var registrationIds = []

    db.devices.find({registration_id: {$in: devices}}).toArray(
        function(err, objects) {
            if(err) return cb(err)

            objects.forEach(function(object) {
                registrationIds.push(object.registration_id)
            })
            
            
            send_ping(timeout, registrationIds, cb)
    })
}

module.exports = DevicesHelper
