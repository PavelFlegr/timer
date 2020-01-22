if(window.localStorage.getItem("timers") === null) {
	window.localStorage.setItem("timers", JSON.stringify([]))
}
let timers = JSON.parse(window.localStorage.getItem("timers"))
timers.forEach((timer) => {
	timer.killed = moment(timer.killed)
})
var app = new Vue({
	el: "#app",
	data: {
		name: "",
		map: "",
		time: "",
		timers: timers,
		now: moment().subtract(9,"h")
	},
	methods: {
		//add a mob timer
		add: function() {
			this.timers.push({name: this.name, map: this.map, time: this.time, killedModel: "", killed: false, remaining: "", active: false})
		},
		//start timer
		start: function(timer) {
			if(timer.killedModel === "") {
				timer.killed = this.now
			}
			else {
				//timer.killed = this.now.subtract(timer.time - timer.killedModel, "m")
				timer.killed = moment(timer.killedModel, "HH:mm")
				timer.killedModel = ""
			}
			if(timer.killed.diff(this.now, "m") > 0) {
				timer.killed = timer.killed.subtract(1, "d")
			}
			timer.active = true
		},
		//remove a timer
		remove: function(timer) {
			let pos = this.timers.indexOf(timer)
			this.timers.splice(pos, 1)
		},
		updateTime: function() {
			this.timers.forEach((timer) => {
				minutesPassed = this.now.diff(timer.killed, "m")
				let remaining = timer.time - minutesPassed
				if(remaining == 0 && timer.active) {
					var audio = new Audio('light.mp3');
					audio.play();
				}
				if(remaining <= 0) {
					timer.active = false
				}
				timer.remaining = remaining
			})
		}
	},
	computed: {
		//order timers alphabetically
		alphabeticalTimers: function() {
			return this.timers.sort((timer1, timer2) => {
				if(timer1.name < timer2.name) {
					return -1
				}
				if(timer1.name > timer2.name) {
					return 1
				}
				
				return 0
			})
		},
		//filter started timers
		activeTimers: function() {
			return this.alphabeticalTimers.filter((timer) => timer.remaining > 0 )
		},
		//started timers ordered by time remaining
		activeTimersOrdered: function() {
			return this.activeTimers.sort((timer1, timer2) => {
				if(timer1 < 0) return 1
				return timer1.remaining - timer2.remaining
			})
		}
	},
	watch: {
		//immediately save changes to localstorage
		timers: {
			handler: function(timers) {
				this.updateTime()
				window.localStorage.setItem("timers", JSON.stringify(this.timers))
			},
			deep: true
		},
		//update remaining time on tick
		now: function(now) {
			this.updateTime()
		}
	}
})

setInterval(() => {
	app.now = moment().subtract(9,"h")
}, 1000)