/* TODO: Dont search on entire document but only in local object
 */

module.exports = {
    Widget: Snowwhite
}

function Snowwhite(element, id) {
    this.name = 'snowwhite';
    this.class = 'widget_snowwhite';
    this.parentElement = document.getElementById(element);
    this.id = this.name + '_' + id;
    var self = this;
    this.commands = [
        'show_snowwhite',
        'hide_all'
    ];
    this.timeout = null;

    // Build the actual app
    this.build = function(callback) {
        callback();
    }

    this.run = function() {
    }

    this.handle_message = function(message) {
        if (message.command == 'show_snowwhite') {
	    this.show_overlay();
	    this.timeout = setTimeout(function() {
	        self.hide_overlay();
	        self.timeout = null;
	    }, 20000);
	} else if (message.command == 'hide_all') {
            this.hide_overlay();
            if (this.timeout != null) {
    	        clearTimeout(this.timeout);
    	        this.timeout = null;
    	    }
        }
    }

    this.show_overlay = function() {
        blur();
        $('#snowwhite_overlay').css('left', 0);
	video = document.getElementById("snowwhite_vid");
	video.currentTime = 0;
	video.play();
    }

    this.hide_overlay = function() {
	video = document.getElementById("snowwhite_vid");
	video.pause();
        $('#snowwhite_overlay').css('left', '-120%');
        deblur();
    }

    this.init = function() {
        var fs = require('fs');
        var path = require('path');

        var div = document.createElement('div');
        div.id = this.name + '_' + id;
        div.className = this.class;
        fs.readFile(path.join(__dirname, 'view.html'), function(err, data) {
            if (!err) {
                div.innerHTML = data;
                self.parentElement.appendChild(div);
            }

            // Append CSS
            var file = location.pathname.split( "/" ).pop();

            var link = document.createElement("link");
            link.href = path.join(__dirname, 'style.css');
            link.type = "text/css";
            link.rel = "stylesheet";
            document.getElementsByTagName( "head" )[0].appendChild(link);
            
            self.build(self.run);
        });
    }
    this.init();
}
