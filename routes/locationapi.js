// A wrapper over PostgreSql db 
var dbwrap=require('./dbwrap.js');


exports.getAllLocations = function (req, res) {
  	dbwrap.runsql("Select * from locations where userid=$1",[req.params.userid], function (err, results) {
  		if (err) {
  			console.error("Error selecting locations from db", err);
        return res.send({err: "Cannot read locations"});
  		}
  		else res.send(results.rows);
  	});
};

exports.readlocationbyid = function(req, res) {
  	dbwrap.runsql("Select * from locations where id=$1 and userid=$2", [req.params.id,req.params.userid], function (err, results) {
  		if (err) {
  			console.error("Error selecting locations from db", err);
  			return res.send({err: "Cannot read locations"});
  		}
  		else {
          if (results.rows[0])
            res.send(results.rows[0]);
          else return res.send({err: "Cannot read locations"});
      } 
  	});		
};

exports.createlocation = function(req, res) {
  	dbwrap.runsql("Insert into locations (lat,long,address,name,userid) values ($1,$2,$3,$4,$5)", 
          [req.body.lat,req.body.longt,req.body.address,req.body.name,req.params.userid],function (err, results) {
  		if (err) {
  			console.error("Error writing locations to db", err);
  			return res.send({err: "Cannot create location"});
  		}
  		else res.send({success: "Location stored Successfully"});
  	});
  
};

exports.updatelocation = function(req, res) {

  	dbwrap.runsql("update locations set lat=$1, long=$2, address=$3, name=$4 where id=$5 and userid=$6", 
      [req.body.lat,req.body.longt,req.body.address,req.body.name,req.params.id,req.params.userid],function (err, results) {
  		if (err) {
  			console.error("Error updating db", err);
  			return res.send({err: "Location Not Found"});
  		}
  		else res.send({success: "Location deleted successfully"});
  	});		
};

exports.deletelocation = function(req, res) {
  	dbwrap.runsql("delete from locations where id=$1 and userid=$2", [req.params.id,req.params.userid], function (err, results) {
  		if (err) {
  			console.error("Error selecting locations from db", err);
  			return res.send({err: "Cannot delete location"});
  		}
  		else res.send({success: "Location deleted Successfully"});
  	});		
};

/* This is not how it should be done in production */
export.createschema = function(req,res) {
    dbwrap.runsql("CREATE TABLE locations
(
  id serial NOT NULL,
  lat character varying(10),
  long character varying(10),
  address character varying(200),
  name character varying(100),
  userid character varying(10),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);", [req.params.id,req.params.userid], function (err, results) {
      if (err) {
        console.error("Error selecting locations from db", err);
        return res.send({err: "Cannot delete location"});
      }
      else res.send({success: "Location deleted Successfully"});
    }); 

}

