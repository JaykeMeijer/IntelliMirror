/* TODO: Dont search on entire document but only in local object
 */

module.exports = {
    Widget: Printer
}

function Printer(element, id) {
    this.name = '3dprinter';
    this.class = 'widget_3dprinter';
    this.parentElement = document.getElementById(element);
    this.id = this.name + '_' + id;
    var self = this;

    // Build the actual app
    this.build = function(callback) {
        self.getData('http://octopi.vredebest/api/job',
                     self.handleJobStatus);
        callback();
    }

    this.getData = function(url, handler) {
        var path = require('path');
        var fs = require('fs');

        var APIkey = "79A09D71DF9B479895F8FF95B6B7B04E";

        $.ajax({
            url: url,
            type: "GET",
            beforeSend: function(xhr) {xhr.setRequestHeader('X-Api-Key', APIkey)},
            success: handler,
            error: function() {handler({data: {state: "Error"}})}  // Trigger hide logic
        });
    }

    this.handleJobStatus = function(data) {        
        if (data.state == "Printing") {
            var elements = document.getElementsByClassName("printer_jobname");
            elements.item(0).innerHTML = data.job.file.name;

            var elements = document.getElementsByClassName("printer_eta");
            elements.item(0).innerHTML = self.timeFormat(data.progress.printTimeLeft) + ' remaining';

            var elements = document.getElementsByClassName("printer_progress");
            elements.item(0).innerHTML = elements.item(0).innerHTML + Math.round(data.progress.completion) + '%';

            var elements = document.getElementsByClassName("printer_progressbar_done");
            elements.item(0).style.width = data.progress.completion + '%';

            var elem = document.getElementById(self.id);
            elem.style.display = 'block';
        } else {
            var elem = document.getElementById(self.id);
            elem.style.display = 'none';
            return;
        }
    }


    this.timeFormat = function(seconds) {
        var date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    }

    this.run = function() {
        // Easiest in this case is to just rebuild the app
        setTimeout(function() {
            self.parentElement.removeChild(document.getElementById(self.id));
            self.init();
        }, 60000);
    }

    this.init = function() {
        var fs = require('fs');
        var path = require('path');

        var div = document.createElement('div');
        div.id = self.id;
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
