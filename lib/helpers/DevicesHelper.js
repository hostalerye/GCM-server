var gcm = require('node-gcm')
var configurations = require('../../configurations.js')
var crypto = require('crypto')
var pings = require('../Ping.js')

var db = require('mongojs').connect(configurations.db)
var devices = db.collection('devices')


function send_ping(registrationIds, cb) {

    var message = new gcm.Message()
    var sender = new gcm.Sender(configurations.apikey)
    
    var ping_id = crypto.randomBytes(20).toString('hex')
    
    pings.createPing(ping_id)

    message.addData('ping_id', ping_id)
    message.addData('status_code',42)

    cb(undefined, ping_id)

    console.log("Sending ping to : "+ registrationIds)
    sender.send(message, registrationIds, 4, function (err, results) {
        if(err) console.log(err)
        
        console.log("Message sent. Responses :" + JSON.stringify(results))

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
    
        cb(undefined, ping_id)
    })
}

var DevicesHelper = {}

DevicesHelper.get_all_devices = function(cb) {
    db.devices.find({}, function(err, objects) {
        cb(err, objects)
    })
}

DevicesHelper.ping_all_devices = function(reg_id_src, cb) {
    var registrationIds = []

    db.devices.find().toArray(
        function(err, objects) {
            if(err) return cb(err)

            objects.forEach(function(object) {
                if(object.registration_id != reg_id_src) registrationIds.push(object.registration_id)
            })
            
            
            send_ping(registrationIds, cb)
        })
}

DevicesHelper.get_ping_result = function(ping_id, cb) {
    var ping = pings.getPing(ping_id)
    pings.deletePing(ping_id)
    cb(ping)
}

DevicesHelper.unregister_device = function(reg_id, cb) {
    console.log("Trying to unregister reg_id : " + reg_id)
    db.devices.remove({registration_id: reg_id}, function(err, number_of_devices) {
        cb(err, number_of_devices)
    })
}

DevicesHelper.register_device = function(phone_number, registration_id, cb) {
    db.devices.insert({phone_number: phone_number, registration_id: registration_id}, 
        function(err, device) {
            cb(err, device)
        }
    )
}

DevicesHelper.find_by_phone_number = function(phone_number, cb) {
    db.devices.findOne({phone_number: phone_number}, 
        function(err, device) {
            cb(err, device)
        }
    )
}

DevicesHelper.find_by_registration_id = function(registration_id, cb) {
    db.devices.findOne({registration_id: registration_id}, 
        function(err, device) {
            cb(err, device)
        }
    )
}

DevicesHelper.update_registration_id = function(phone_number, new_registration_id, cb) {
    db.devices.findAndModify({
        query: {phone_number: phone_number},
        update: {$set: {registration_id: new_registration_id}},
        new: true
    }, function(err, device) {
        cb(err, device)
    })
}

module.exports = DevicesHelper
