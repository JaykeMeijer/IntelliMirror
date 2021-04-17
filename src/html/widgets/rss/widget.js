/* TODO: Dont search on entire document but only in local object
 */

module.exports = {
    Widget: RSS
}

function RSS(element, id) {
    this.name = 'rss';
    this.class = 'widget_rss';
    this.parentElement = document.getElementById(element);
    this.id = this.name + '_' + id;
    var self = this;
    this.commands = [
        'show_news',
        'hide_news'
    ];
    this.timeout = null;

    // Build the actual app
    this.build = function(callback) {
        var elements = document.getElementsByClassName("rss_title");
        elements.item(0).innerHTML = 'Headlines';

        // Get Feed
        $.get('http://nu.nl/rss/Algemeen', function (data) {
            items = [];
            $(data).find("item").each(function () {
                var el = $(this);
                items.push({'pubdate': new Date(el.find('pubDate').text()),
                            'title': el.find('title').text(),
		            'description': el.find('description').text()});
            });

            // Order items
            items = items.sort(function(a, b) { 
                return b.pubdate - a.pubdate;
            });

            for (var i = 0; i < items.length; i++) {
                $('#' + self.id).find('.rss_headlines').append(
                    '<div class=rss_headline>' + items[i].title +
                    '</div>');
		$('#' + self.id).find('.rss_detailed').append(
		    '<div class=rss_detail>' +
	            '<div class=rss_detail_title>' + items[i].title + '</div>' +
		    '<div class=rss_detail_summary>' + items[i].description + '</div>'
		);
            }
        });
        callback();
    }

    this.handle_message = function(message) {
        if (message.command == 'show_news') {
            this.show_overlay();
            this.timeout = setTimeout(function() {
		console.log('timeout');
		self.hide_overlay();
	        self.timeout = null;
	    }, 60000);
        } else if (message.command == 'hide_news') {
            this.hide_overlay();
            if (this.timeout != null) {
		clearTimeout(this.timeout);
		this.timeout = null;
            }
        }
    }

    this.show_overlay = function() {
        blur();
        $('#rss_overlay').css('left', 0);
    }

    this.hide_overlay = function() {
        $('#rss_overlay').css('left', '-120%');
        deblur();
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
