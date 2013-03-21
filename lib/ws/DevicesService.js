function DevicesService(app) {


    return function() {

        /**
         * Add a device in DB
         */

        app.post('/', function(req,res) {
            var db = app.get('db')
            var devices = db.collection('devices')
            var phoneNumber = req.body.phoneNumber
            var registrationId = req.body.registrationId

            db.devices.insert({phoneNumber: phoneNumber, registrationId: registrationId}, function(err, device) {
                if(err) return res.send(err)
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
    }
}

module.exports = DevicesService