/* TODO: Dont search on entire document but only in local object
 */

module.exports = {
    Widget: Weather
}

function Weather(element, id) {
    this.name = 'weather';
    this.class = 'widget_weather';
    this.parentElement = document.getElementById(element);
    this.id = this.name + '_' + id;
    var self = this;

    // Build the actual app
    this.build = function(callback) {        
        self.getData('http://api.openweathermap.org/data/2.5/weather', 
                     'current_weather',
                     self.handleOpenWeatherCurrent);

        self.getData('http://api.openweathermap.org/data/2.5/forecast', 
                     'forecast',
                     self.handleOpenWeatherForecast);

        callback();
    }

    this.getData = function(url, cache, handler) {
        var path = require('path');
        var fs = require('fs');

        var cachedir = path.join('..', 'cache');
        if (!fs.existsSync(cachedir)) {
            fs.mkdirSync(cachedir);
        }

        var cachepath = path.join(cachedir, cache);
        fs.readFile(cachepath, function(err1, data) {
            fs.stat(cachepath, function(err2, stats) {
                var now = new Date();
                var created = new Date(stats.mtime);

                if (err1 == undefined &&
                        now.getTime() - created.getTime() < 10 * 60 * 1000) {
                    handler(JSON.parse(data));
                } else {
                    console.log('Reloading');
                    $.get(url, {
                        id: '2759794', // Amsterdam
                        APPID: '15e79497893ad73998faa51a71efe8c1',
                        units: 'metric',
                        lang: 'nl'
                    }, function(data) {
                        fs.writeFile(cachepath, JSON.stringify(data),
                                     function(err) {
                            if(err) {
                                return console.log(err);
                            }
                        });

                        handler(data);
                    });
                }
            });
        });
    }

    this.handleOpenWeatherCurrent = function(data) {
        var elements = document.getElementsByClassName("weather_text");
        elements.item(0).innerHTML = data.weather[0].description;

        var elements = document.getElementsByClassName("weather_wind");
        var wind = 'Wind: ' + Math.round(data.wind.speed * 3.6 * 10) / 10 +
                   ' km/h / ' + self.parseWindSpeed(data.wind.speed) +
                   ' Bft ' + self.parseWindDir(parseInt(data.wind.deg));
        elements.item(0).innerHTML = wind;

        var elements = document.getElementsByClassName("weather_temp");
        var temp = Math.round(parseFloat(data.main.temp) * 10) / 10;
        elements.item(0).innerHTML = temp + '&deg;';
    }

    this.handleOpenWeatherForecast = function(data) {
        var mintemp = 1000;
        var maxtemp = -1000;
        var temps = [];
        var rain = [];
        for (var i = 0; i < 8; i++) {
            var elem = data.list[i];
            var bgstyle = 'background: url(widgets/weather/icons/' +
                          elem.weather[0].icon + '.svg);';
            $('.weather_graph_icon').append('<td style="' + bgstyle +
                                            '"></td>');

            // Determine rain. We assume a max of 100mm in 3 hours
            var rainfactor = Math.min(elem.rain['3h'], 50) / 50 * 100;
            var bgstyle = 'background: linear-gradient(180deg, #000000 ' +
                          (100 - rainfactor).toString() + '%, #888888 ' +
                          rainfactor + '%);';

            $('.weather_graph_graph').append(
                '<td style="' + bgstyle + '"></td>');

            var time =
                elem.dt_txt.split(' ')[1].split(':').slice(0, -1).join(':');
            $('.weather_graph_time').append('<td>' + time + '</td>');

            temps.push(elem.main.temp);
            mintemp = Math.min(mintemp, elem.main.temp);
            maxtemp = Math.max(maxtemp, elem.main.temp);
        }

        mintemp = Math.round(mintemp - 3);
        maxtemp = Math.round(maxtemp + 3);
        $('.weather_graph_graph_left').append(
            '<div class="weather_graph_graph_max">' + maxtemp + '&deg;</div>' +
            '<div class="weather_graph_graph_min">' + mintemp + '&deg;</div>');
        setTimeout(function() {self.drawTemperature(temps, maxtemp, mintemp)},
                   100);
    }

    this.drawTemperature = function(temps, maxtemp, mintemp) {
        // Determine temperature points
        var bar_width = $('.weather_graph td').next().outerWidth();
        var bar_height = $('.weather_graph_graph td').next().outerHeight();
        var base_y = Math.round($('.weather_graph_graph').offset().top + 
                                $('.weather_graph_graph').outerHeight() + 2);
        var base_x = Math.round($('.weather_graph_graph').offset().left +
                                $('.weather_graph_graph_left').outerWidth() +
                                bar_width / 2);

        points = [];
        var range = maxtemp - mintemp;
        for (var i = 0; i < 8; i++) {
            var temperature_fraction = (temps[i] - mintemp) / range;
            points.push({
                'x': base_x + Math.round(i * bar_width),
                'y': base_y - Math.round(temperature_fraction * bar_height)
            });
        }

        for (var i = 0; i < 7; i++) {
            self.createLine(points[i].x, points[i].y,
                            points[i + 1].x, points[i + 1].y);
        }
    }

    this.createLine = function(x1,y1, x2,y2){
        var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        //console.log(length);
        var transform = 'rotate('+angle+'deg)';

        var line = $('<div>')
            .appendTo('.weather_graph_graph')
            .addClass('templine')
            .css({
              'position': 'absolute',
              'transform': transform
            })
            .width(length)
            .offset({left: x1 < x2 ? x1 : x1 - (x1-x2),
                     top: y1 < y2 ? y1 : y1 - (y1-y2)});

        return line;
    }

    this.parseWindSpeed = function(speed) {
        return Math.min(12, Math.round(Math.pow(speed / 0.836, 2.0/3)));
    }

    this.parseWindDir = function(deg) {
        var lim = Math.ceil(deg / 45) * 45;
        switch(lim) {
            case 0:   return 'N';
            case 45:  return  'NE';
            case 90:  return  'E';
            case 135: return  'SE';
            case 180: return  'S';
            case 225: return  'SW';
            case 270: return  'W';
            case 315: return  'NW';
        }
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