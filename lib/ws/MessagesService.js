var gcm = require('node-gcm')
var configurations = require('../../configurations.js')


function MessagesService(app) {

    return function() {

        app.post('/send', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')
            var phoneNumbers = req.body.phoneNumbers
            var params = req.body.params
            var message = new gcm.Message()
            var sender = new gcm.Sender(configurations.apikey)
            var registrationIds = []

            //TODO Get registrationsId from DB
            //appel DB pour remplir le tableau
            var remainingCalls = phoneNumbers.length
            var errors = []

            phoneNumbers.forEach(function(number) {
                db.devices.findOne({phoneNumber: number}, function(err, device) {

                    if(err) errors.push(err)

                    registrationIds.push(device.registrationId)

                    remainingCalls--

                    if(remainingCalls == 0) {

                        if(errors.length>0) return res.send(errors)

                        for(var key in params) {
                            message.addData(key, params[key])
                        }

                        //4 is the number of retries, could be omitted with function sendNoRetry
                        sender.send(message, registrationIds, 4, function (err, result) {
                            if(err) return res.send(err)
                            res.send(result)
                        })
                    }
                })
            })
        })

    }
}

module.exports = MessagesService