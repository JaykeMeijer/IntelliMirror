/* TODO: Dont search on entire document but only in local object
 */

module.exports = {
    Widget: Clock
}

function Clock(element, id) {
    this.name = 'clock';
    this.class = 'widget_clock';
    this.parentElement = document.getElementById(element);
    this.id = this.name + '_' + id;
    var self = this;
    var last = [0, 0, 0, 0];

    // Build the actual app
    this.build = function(callback) {
        callback();
    }

    this.run = function() {
        var now = new Date();
        var time = ("0" + now.getHours()).slice(-2) + 
                   ("0" + now.getMinutes()).slice(-2);

        for (var i = 0; i < 4; i++) {
            var cur = parseInt(time.charAt(i));
            if (last[i] != cur) {
                self.character_animate(i, time.charAt(i));
                last[i] = cur;
            }
        }
        setTimeout(self.run, 1000);
    }

    this.character_animate = function(pos, newval) {
        var class_string = '.clock_time_' + pos;
        var oldchar = $('#' + self.id).find(class_string);
        var height = oldchar.outerHeight();

        var newchar =
            jQuery("<div></div>",
              {class: 'clock_time_' + pos + ' clock_digit',
               style: 'top: -' + height + 'px; opacity: 0.0;',
               text: newval}).appendTo($('#' + self.id));
        oldchar.after(newchar);
        newchar.animate({top: '+=' + height, opacity: '+=1'}, 1000);
        oldchar.animate({top: '+=' + height, opacity: '-=1'}, 1000, function() {
            oldchar.remove();
        });
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