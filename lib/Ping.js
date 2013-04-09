var pings = []

module.exports = {
    createPing : function (ping_id) {
        pings.push({ping_id: ping_id, responses: []})
    },

    deletePing : function(ping_id) {
        var found = false
        for(var i=0; i<pings.length && !found; i++) {
            if(pings[i].ping_id == ping_id) {
                pings.slice(i, 1)
                found = true
            }
        }
        if(!found) return new Error(404, "ping_id not found")
    },

    getPing : function(ping_id) {
        for(var i=0; i<pings.length; i++) {
            if(pings[i].ping_id == ping_id) return pings[i]
        }
        return new Error(404, "ping_id not found")
    },

    addResponse : function (ping_id, phoneNumber, ip) {
        pings.forEach(function(ping) {
            if(ping_id == ping.ping_id) {
                ping.responses.push({
                    phone_number : phoneNumber,
                    ip : ip
                })
            }
            return ping
        })
        return new Error(404, "ping_id not found")
    }


}
