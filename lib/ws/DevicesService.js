var devicesHelper = require('../helpers/DevicesHelper.js')

function DevicesService(app) {

    return function() {

        /**
         * List all devices
         */
        app.get('/', function(req,res) {
            devicesHelper.get_all_devices(function(err, objects) {
                if(err) return res.send(err)
                res.send(objects)
            })
        })

        /**
         * List all available devices (ping)
         */
        app.get('/available', function(req,res) {
            console.log(JSON.stringify(req.query))
            
            var reg_id_src = req.query.reg_id

            devicesHelper.ping_all_devices(reg_id_src, function(err, ping_id) {
                if(err) return res.send(err)
                console.log("Global ping id : " + ping_id)
                res.send(200, ping_id)
            })
        })

        /**
         * Send a ping result
         */
        app.get('/infos', function(req,res) {
            var ping_id = req.query.ping_id
            devicesHelper.get_ping_result(ping_id, function(devices) {
                console.log("Ping result " + JSON.stringify(devices))
                res.send(devices)
            })
        })


        /**
         * Unregister a device
         */
        app.post('/unregister', function(req,res) {
            var registration_id = req.body.reg_id
            devicesHelper.unregister_device(registration_id, function(err, numberOfDevices) {
                if(err) {
                    console.log(err)
                    return res.send(err)
                }
		        if(numberOfDevices == 0) return res.send(404, "Device not found")
		        res.send(200, "Device unregistered")
            })
        })


        /**
         * Add a device in DB
         */
        app.post('/register', function(req,res) {
            var phone_number = req.body.phone_number
            var registration_id = req.body.reg_id

            devicesHelper.register_device(phone_number, registration_id, function(err, device) {
                if(err) {
                    console.log(err)
                    return res.send(err)
                }
                console.log(JSON.stringify(device))
                res.send(device)
            })
        })

        /**
         * Check if device is register
         */
        app.post('/check_registration', function(req,res) {
            var reg_id = req.body.reg_id
            var phone_number = req.body.phone_number

            console.log('Checking registration for '+reg_id+' and '+phone_number)

            devicesHelper.check_registration(reg_id, phone_number, function(err, status_code) {
                if(err) return res.send(err)
                res.send(status_code)
            })
                
        })

        /**
         * Find device by phone number
         */
        app.get('/phoneNumber/:phone_number', function(req,res) {
            var phone_number = req.param("phone_number")

            devicesHelper.find_by_phone_number(phone_number, function(err, device) {
                if(err) return res.send(err)
                res.send(device)
            })
        })

        /**
         * Find device by registration ID
         */
        app.get('/registrationId/:registration_id', function(req,res) {
            var registration_id = req.param("registration_id")

            devicesHelper.find_by_registration_id(registration_id, function(err, device) {
                if(err) return res.send(err)
                res.send(device)
            })
        })

        /**
         * Update device registration ID
         */
        app.put('/updateRegistrationId/:registration_id', function(req,res) {
            var registration_id = req.param("registration_id")
            var phone_number = req.body.phone_number

            devicesHelper.update_registration_id(phone_number, registration_id, function(err, device) {
                if(err) return res.send(err)
                res.send(device)
            })
        })


        /**
         * Update device registration ID
         */
        app.put('/updatePhoneNumber', function(req,res) {
            var reg_id = req.body.reg_id
            var new_phone_number = req.body.new_phone_number

            console.log("Updating "+reg_id+" with phone number "+new_phone_number)

            devicesHelper.update_phone_number(reg_id, new_phone_number, function(err, device) {
                if(err) return res.send(err)
                res.send(device)
            })
        })
    }
}

module.exports = DevicesService
