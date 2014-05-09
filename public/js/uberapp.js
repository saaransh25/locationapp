        $.fn.serializeObject = function()
        {
          var o = {};
          var a = this.serializeArray();
          $.each(a, function() {
          if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
            } else {
           o[this.name] = this.value || '';
            }
          });
          return o;
        };

        var map;
        var markers=[];

        var latlng =new google.maps.LatLng(37.78, -122.42);
        var myOptions = {
            zoom: 12,
            center: latlng,
        };
        
        var Locations = Backbone.Collection.extend ({
            url:'api/locations'
        });

        var LocationModel=Backbone.Model.extend ({
            urlRoot:'api/locations'
        });

        var Mapview=Backbone.View.extend ({
          render: function(id) {

            var locations=new Locations();
            locations.fetch({ success: function (location) {
              map.setZoom(12);
              map.setCenter(latlng);
              for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
              }
              markers=[];
              location.models.forEach(function (loc) {
                var marker=new google.maps.Marker({
                  map: map,
                  position: new google.maps.LatLng(loc.get('lat'), loc.get('long'))
                });
                var infoWindow = new google.maps.InfoWindow({
                  content: loc.get('address')
                });
                marker.rowid=loc.get('id');

                google.maps.event.addListener(marker, 'click', function() {
                  infoWindow.open(map, marker);
                });
                markers.push(marker);
              });
            }
          });
          }
        });

        var LocationList = Backbone.View.extend ({
            el:'.textdiv',

            render: function (userid) {
              var locations=new Locations();
              var that=this;
              locations.fetch({
                  success: function (locations) {
                      var template=_.template($('#homepaget').html(), {locations: locations.models});
                      //mview.render({locations: locations.models});
                      that.$el.html(template);
                  }
              });
            },

            events: {
              'click .viewbut':'viewonmap'
            },

            viewonmap: function (ev) {
              var target=ev.target;
              var id=$(target).attr('id');
              markers.forEach(function (marker) {
                  if (marker.rowid == id) google.maps.event.trigger(marker,'click'); 
              });
            }

        });

        var editlocmarker;
        var EditLocation = Backbone.View.extend ({
            el:'.textdiv',
            render: function (options) {
                if (options.id) {
                  var locations=new LocationModel({id: options.id});
                  var that=this;
                  locations.fetch({
                      success: function (loc) {
                          if (!loc.err) {
                          var template=_.template($('#editlocationt').html(), {location: loc});
                          that.$el.html(template); 
                          }
                      }
                  });  
                }
                else {
                  var template=_.template($('#editlocationt').html(), {location: null});
                  this.$el.html(template); 
                }
            },
            events: {
              'click .editlocationform': 'saveLocation',
              'click .viewonmap': 'viewonmap'
            },
            saveLocation: function (ev) {
                ev.preventDefault();
                var geocoder = new google.maps.Geocoder();
                var lat=$("input[name='lat']");
                var long=$("input[name='longt']");
                geocoder.geocode({'address': $("input[name='address']").val()}, function (results, status) {
                  if (status==google.maps.GeocoderStatus.OK) {
                    lat.val(results[0].geometry.location.lat());
                    long.val(results[0].geometry.location.lng());
                    var loc=$('.editform').serializeObject();
                    var locationmodel=new LocationModel();
                    locationmodel.save(loc,{
                        success: function (user) {
                        router.navigate('', {trigger: true});
                      }
                    });
                  }
                  else {
                    alert("The entered location is not valid");
                  }
                });
                return false;
            },

            viewonmap: function (ev) {
                if(editlocmarker) editlocmarker.setMap(null);
                var loc=$('.editform').serializeObject();
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({'address': $("input[name='address']").val()}, function (results, status) {
                  if (status==google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(15);
                    var marker = new google.maps.Marker({
                      map: map,
                      position: results[0].geometry.location,
                      animation: google.maps.Animation.BOUNCE
                    });
                    editlocmarker=marker;
                    markers.push(editlocmarker);
                  }
                  else {
                    alert("The entered location is not valid");
                  }
                });
                return false;
            }
        });
        
        var mview=new Mapview();
        var editloc=new EditLocation();
        var locationlist=new LocationList();

        var Router = Backbone.Router.extend ({
            routes: {
              '':'home',
              'editlocation':'editloc',
              'editlocation/:id':'editloc',
              'deletelocation/:id':'deleteloc',
            }
        });
        var router=new Router();
        router.on('route:home', function () {
            locationlist.render();
            mview.render();
        });
        router.on('route:editloc', function(id) {
            editloc.render({id: id});
            mview.render();
        });
        router.on('route:deleteloc', function(id) {
           var locations=new LocationModel({id: id});
           locations.destroy({
              success: function () {
                router.navigate('', {trigger: true});
              }
           })
        });


        map = new google.maps.Map($('#map-canvas')[0], myOptions);

        Backbone.history.start();