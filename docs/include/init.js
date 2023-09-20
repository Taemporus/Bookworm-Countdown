fetch('include/releases.txt').then(resp => resp.text()).then(function(data) {
	var releases = [];
	var keys = void 0;
	// Parse file line by line
	var lines = data.split(/\r?\n/);
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();
		if (line === '')
			continue;
		// Split non-blank lines by TAB characters
		var parts = line.split('\t');
		if (keys === void 0) {
			// The first time, save parts as keys for later
			keys = parts;
		} else {
			// Otherwise, add new release data
			var entry = {};
			for (var j = 0; j < keys.length; j++) {
				entry[keys[j]] = parts[j];
			}
			releases.push(entry);
		}
	}
	// Parse release dates
	releases.forEach(function(entry) {
		var match = entry.time.match(/([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+):([0-9]+)/);
		if (match) {
			entry.time = Date.UTC(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
		}
	});
	return releases;
}).then(function(releases) {
	var timeoutID = 0;
	var update = function() {
		// Clear any previously initialized timer
		clearTimeout(timeoutID);
		timeoutID = 0;
		// Find latest and next part
		var now = Date.now();
		var latest = void 0;
		var next = void 0;
		for (var i = 0; i < releases.length; i++) {
			var entry = releases[i];
			if (entry.time > now) {
				next = entry;
				break;
			} else {
				latest = entry;
			}
		}
		// Get new values
		var fields = [];
		// Next part
		fields.push(
			{id: 'next_part'     , value: next.part     },
			{id: 'next_volume'   , value: next.volume   },
			{id: 'next_minorpart', value: next.minorpart}
		);
		// Clock
		var diff = Math.min(Math.max(0, next.time - now), 100 * 24 * 60 * 60 * 1000 - 1);
		var seconds = (diff = Math.ceil (diff / 1000)) % 60;
		var minutes = (diff = Math.floor(diff /   60)) % 60;
		var hours   = (diff = Math.floor(diff /   60)) % 24;
		var days    = (diff = Math.floor(diff /   24));
		fields.push(
			{id: 'time_s_1' , value: seconds % 10},
			{id: 'time_s_10', value: Math.floor(seconds / 10)},
			{id: 'time_m_1' , value: minutes % 10},
			{id: 'time_m_10', value: Math.floor(minutes / 10)},
			{id: 'time_h_1' , value: hours % 10},
			{id: 'time_h_10', value: Math.floor(hours / 10)},
			{id: 'time_d_1' , value: days % 10},
			{id: 'time_d_10', value: Math.floor(days / 10) % 10}
		);
		// Latest part
		fields.push(
			{id: 'read_link', attr: 'href', value: latest ? ('https://j-novel.club/read/ascendance-of-a-bookworm' + '-part-' + latest.part + '-volume-' + latest.volume + '-part-' + latest.minorpart) : null}
		);
		// Update fields that changed
		fields.forEach(function(field) {
			var elt = document.getElementById(field.id);
			if (!elt)
				return;
			var newValue = (field.value !== null) ? field.value.toString() : null;
			if (field.attr) {
				var oldValue = elt.getAttribute(field.attr);
				if (oldValue !== newValue) {
					if (newValue !== null) {
						elt.setAttribute(field.attr, newValue);
					} else {
						elt.removeAttribute(field.attr);
					}
				}
			} else {
				var oldValue = elt.innerHTML;
				if (oldValue !== newValue) {
					elt.innerHTML = newValue;
				}
			}
		});
		// Schedule next update
		var delay = (Math.floor(now / 1000) === Math.floor((now = Date.now()) / 1000)) ? (1000 - (now % 1000)) : 0;
		timeoutID = setTimeout(update, Math.max(delay, 10));
	};
	// Call first update when DOM is loaded
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', evt => {update();});
	} else {
		update();
	}
});
