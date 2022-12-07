
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://Santos123:Santos321@santoscluster.t2kk0ky.mongodb.net/?retryWrites=true&w=majority" 
client = new MongoClient(url,{ useUnifiedTopology: true });
	
http.createServer(async function (req, res) 
{

	if (req.url == "/")
	{
		  file = 'index.html';
		  fs.readFile(file, function(err, txt) {
    	  res.writeHead(200, {'Content-Type': 'text/html'});
		  res.write("This is the home page<br>");
          res.write(txt);
          res.end(); 
		  });  
	} 
	else if (req.url == "/process")
	{
        var username;
        var password;
        var task;

		 res.writeHead(200, {'Content-Type':'text/html'});
		 pdata = "";
		 req.on('data', data => {
           pdata += data.toString();
         });

		// when complete POST data is received from the index.html file 
		req.on('end', () => {
			pdata = qs.parse(pdata); 
            username = pdata['username'];
            password = pdata['password'];
            //will modify it to handle more than one task
            task = pdata['task']
		}); 

        //******************** SEARCHING THE COMPANY DITS***********************/
        try 
        {
            await client.connect();
            var dbo = client.db("FinalProject");
            var coll = dbo.collection('ClientRecords'); 

            //check if there is a user with the given username 
            user = coll.find({"Username" : username})
            if ((await user.count()) === 0)
            {
               console.log("We do not have an accont with your logins");
                res.write("User ID or Password invalid. <br>");
            }
            else
            {
                validpassword = coll.find({"password" : user[0]._id})
                if(password == validpassword)
                {
                    //not sure how we intend to display the tasks 
                    //display the tasks
                    await user[0].forEach(function(item){ 
                    console.log("how the task looks like: " + item.Tasks);
                    res.write("Below are your tasks <br>")
                    //use a loop since the tasks is in an array format
                    for(var i = 0; i < item.Tasks.length; i++)
                    {
                        res.write(item.Tasks[i]);
                    } 
                    }); 
                } 
                else 
                {   //even though we know it's the password that is invalid
                    res.write("Your Username or Password is invalid.");
                }
            } 

            res.end();
        } 
        catch(err)
        {
            console.log("Database error: " + err);
        } 
        finally 
        {
            client.close();
        }
        res.end();
	}  
	else 
	{
		res.writeHead(200, {'Content-Type':'text/html'});
		res.write ("Unknown page request");	
	} 

}).listen(8080); 