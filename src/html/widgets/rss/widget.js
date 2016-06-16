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
                            'title': el.find('title').text()});
            });

            // Order items
            items = items.sort(function(a, b) { 
                return b.pubdate - a.pubdate;
            });

            for (var i = 0; i < items.length; i++) {
                $('#' + self.id).find('.rss_headlines').append(
                    '<div class=rss_headline>' + items[i].title +
                    '</div>');
            }
        });
        callback();
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