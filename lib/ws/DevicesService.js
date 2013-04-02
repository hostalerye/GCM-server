var gcm = require('node-gcm')
var configurations = require('../../configurations.js')
var crypto = require('crypto')
var pings = require('../Ping.js')


function DevicesService(app) {

    return function() {

        /**
         * List all devices
         */
        app.get('/', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')

            db.devices.find({}, function(err, objects) {
                if(err) return res.send(err)
                res.send(objects)
            })
        })

        /**
         * List all available devices (ping)
         */
        app.get('/available', function(req,res) {
            var timeout = req.body.timeout
            var db = app.get('db')
            var devices = db.collection('devices')
            var registrationIds = []
            var message = new gcm.Message()
            var sender = new gcm.Sender(configurations.apikey)

            var ping_id = crypto.randomBytes(20).toString('hex')

            pings.createPing(ping_id)

            db.devices.find().toArray(function(err, objects) {
                if(err) return res.send(err)

                objects.forEach(function(object) {
                    registrationIds.push(object.registrationId)
                })

                message.addData('ping_id', ping_id)
                message.addData('status_code', 42)

                sender.send(message, registrationIds, 4, function (err, results) {
                    if(err) return res.send(err)

                    for(var i=0; i<results.results.length;i++) {
                        var result = results.results[i]

                        if (result.messageId) {

                            var canonicalRegId = result.canonicalRegistrationId

                            if (canonicalRegId) {

                                db.devices.findAndModify({
                                    query: {registrationId: registrationIds[i]},
                                    update: {$set: {registrationId:canonicalRegId}},
                                    new: true
                                }, function(err, device) {
                                    if(err) console.log(error)
                                })

                            }


                        } else {
                            var error = result.errorCode
                            if (error.equals(gcm.Constants.ERROR_NOT_REGISTERED)) {
                                // application has been removed from devices.get(i) - unregister database
                                db.devices.remove({registrationId: registrationIds[i]}, function(err, device) {
                                    if(err) console.log(res.send(err))
                                })
                            }
                        }
                    }

                    setTimeout(
                        function(){
                            var devicesAvailable = pings.getPing(ping_id).responses
                            res.send(devicesAvailable)
                        },
                        timeout
                    )

                })
            })
        })

        /**
         * Unregister a device
         */
        app.post('/unregister', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')
            var registrationId = req.body.reg_id
            db.devices.remove({registrationId: registrationId}, function(err, device) {
                if(err) {
                    console.log(err)
                    return res.send(err)
                }
                console.log(JSON.stringify(device))
                res.send(device)
            })
        })


        /**
         * Add a device in DB
         */
        app.post('/register', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')
            var phoneNumber = req.body.phone_number
            var registrationId = req.body.reg_id

            db.devices.insert({phoneNumber: phoneNumber, registrationId: registrationId}, function(err, device) {
                if(err) {
                    console.log(err)
                    return res.send(err)
                }
                console.log(JSON.stringify(device))
                res.send(device)
            })
        })

        /**
         * Find device by phone number
         */
        app.get('/phoneNumber/:phoneNumber', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')
            var phoneNumber = req.param("phoneNumber")

            db.devices.findOne({phoneNumber: phoneNumber}, function(err, device) {
                if(err) return res.send(err)
                res.send(device)
            })
        })

        /**
         * Find device by registration ID
         */
        app.get('/registrationId/:registrationId', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')
            var registrationId = req.param("registrationId")

            db.devices.findOne({registrationId: registrationId}, function(err, device) {
                if(err) return res.send(err)
                res.send(device)
            })
        })

        /**
         * Update device registration ID
         */
        app.put('/updateRegistrationId/:registrationId', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')
            var registrationId = req.param("registrationId")
            var phoneNumber = req.body.phoneNumber

            db.devices.findAndModify({
                query: {phoneNumber: phoneNumber},
                update: {$set: {registrationId:registrationId}},
                new: true
            }, function(err, device) {
                if(err) return res.send(err)
                res.send(device)
            })
        })
    }
}

module.exports = DevicesService
