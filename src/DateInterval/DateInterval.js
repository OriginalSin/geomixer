(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory()
    } else {
        window.nsGmx = window.nsGmx || {}
        window.nsGmx.DateInterval = factory()
    }
})(function() {
    var DateInterval = window.Backbone.Model.extend({
        initialize: function() {
            if (!('dateBegin' in this.attributes) && !('dateEnd' in this.attributes)) {
                this.set(DateInterval.getUTCDayBoundary());
            }
        },

        saveState: function() {
            return {
                version: '1.1.0',
                dateBegin: +this.attributes.dateBegin,
                dateEnd: +this.attributes.dateEnd
            }
        },

        loadState: function(state) {
            if (!state.version || state.version === '1.1.0' || state.version === '1.0.0') {
                this.set({
                    dateBegin: new Date(state.dateBegin),
                    dateEnd: new Date(state.dateEnd)
                })
            } else {
                throw 'Unknown state version';
            }
        }
    }, {
        //number of milliseconds in one day
        MS_IN_DAY: 24*3600*1000,

        //set time to UTC midnight
        toMidnight: function(date) {
            return new Date(date - date % DateInterval.MS_IN_DAY);
        },

        getUTCDayBoundary: function(date) {
            date = date || new Date();

            var midnight = DateInterval.toMidnight(date);
            return {
                dateBegin: midnight,
                dateEnd: new Date(midnight.valueOf() + DateInterval.MS_IN_DAY)
            }
        },

        // 24+n interval
        defaultFireDateInterval: function() {
            var now = new Date(),
                lastMidnight = DateInterval.toMidnight(now),
                dateEnd = new Date((now - 1) - (now - 1) % (3600*1000) + 3600*1000), //round to the nearest hour greater then 'now'
                isTooSmall = dateEnd - lastMidnight < 12*3600*1000,
                dateBegin = new Date(isTooSmall ? (lastMidnight - nsGmx.DateInterval.MS_IN_DAY) : lastMidnight.valueOf());

            return {
                dateBegin: dateBegin,
                dateEnd: dateEnd
            }
        }
    })

    return DateInterval
})
