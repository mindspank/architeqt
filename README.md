#Architeqt

Architeqt allows you to define Qlik Sense application as Blueprints.  
Other Qlik Sense apps can inherit properties from one or multiple Blueprints.  

Introduction video: https://www.youtube.com/watch?v=LBelK5Vb7b8

Example
```
App 1 contains a generic story that explains how to use Qlik Sense, App 1 is marked as a blueprint.
App 2, 3 and 4 inherits objects from App 1, in this case the story. 
App 1 makes changes to the story, changes are propogated to App 2, 3 and 4.
```  
```
App A, B, C, D all share similar data models and wants to share common dimensions and measures.
Define app A as a Blueprint and build our a generic master library.
Apps B, C, D are then set up to inherit properties from app A.
Master library are synced to app B, C, D from Blueprint app A.
```

##Supported Entities
* Sheets and their objects
* Stories and their slides & slideitems
* Snapshots
* Variables
* Dimensions
* Measures
* Master Objects  

##Installation

### Server  
Architeqt is a REST API built using NodeJS. It can be hosted and maintained through the Qlik Sense Service Dispatcher.  
Modules added to the Service Dispatcher has to be re-applied after an upgrade of Qlik Sense.

* Download this package here: https://github.com/mindspank/architeqt/archive/master.zip  
  
* Extract the zipped package on the Qlik Sense Server.  
* Run the file install.bat with admin priviliges to copy the package into  
```C:\Program Files\Qlik\Sense\ServiceDispatcher\Node\architeqt\```  
You can also copy the files manually if you wish to do so.  

* Then append the following configuration options to  
```C:\Program Files\Qlik\Sense\ServiceDispatcher\services.conf```  
This will let the Service Dispatcher know how to run the module, this step has to be re-applied in a upgrade of Qlik Sense Server.

```
[architeqt-service]
Identity=Qlik.architeqt-service
Enabled=true
DisplayName=Architeqt
ExecType=nodejs
ExePath=Node\node.exe
Script=Node\architeqt\index.js

[architeqt-service.parameters]
```

* Open the config.js file in the architeqt folder in ```C:\Program Files\Qlik\Sense\ServiceDispatcher\Node\architeqt\``` and change the hostname to match your installation.  
The Engine and QRS configuration depends on the Qlik Sense server host and the REST API config is the external hostname.

* Restart the Qlik Sense Service Dispatcher windows service to pick up the new module.

* Lastly, add 2 custom properties in QMC. The default names are Blueprint with a value 'true' and UseBlueprint.  
Useblueprint will have values that corresponds with the IDs of the apps you have defined as Blueprints. See the QMC section below.

###Client
Architeqt also includes a sample client that operates against the REST API. The client allows you to start a sync between either all blueprints and associated children or just a select few children or blurprints.  
Note: If you changed the port for the REST api then you need to edit the file main.js for the client and specify your custom port.  

Zip the ```architect-client``` folder and upload as a mashup into Qlik Sense, this provides the added benefit of being able to access control the mashup.
As the REST API also is secured through cross origin policies as default this should be a added layer of security so users wont accidentially stumble across the management interface.

##Configuration
The file ```C:\Program Files\Qlik\Sense\ServiceDispatcher\Node\architeqt\config.js``` contains configurations for the Architeqt module.  
On a out-of-the-box installation of Qlik Sense you would not need to tweak these.  

You can however change the certificate path, Custom Properties used in QMC, Engine connection details and QRS connection details.

##Qlik Management Console
To identify applications as Blueprints and to associate application to a Blueprint Architeqt uses Custom Properties in QMC.  
The property names are configurable in config.js.  

Custom Property: **Blueprint**  
A Customer Property containing the value 'true'.
Set this Custom Property on applications to mark them as Blueprints

Custom Property: **UseBluePrint**  
A list of blueprint application GUIDs. Assigning one or more values to a app will associate that app with the corresponding Blueprint GUIDs.  
  
  
## Architeqt Client
A sample client is provided to start syncing of Blueprints through Architeqt. This sample client can be hosted as a Mashup through Qlik Sense Server.  
Architeqt also supplies a REST API is you wish to build your own client or adapt the sample client.

## Architeqt REST API
Exposed over port 3000 by default.

GET https://hostname:3000/blueprint/:id  
Returns all blueprints. If ID is specific, returns specified blueprint  

GET https://hostname:3000/blueprint/:id/children  
Returns all associated applications by specified blueprint ID  

GET https://hostname:3000/blueprint/:id/children  
Returns all associated applications by specified blueprint ID  
  
POST https://hostname:3000/sync/full  
Performs a full sync between Blueprints and associated applications.  
Depending on Blueprint size expect 1-5 seconds per Blueprint > App sync.  

POST https://hostname:3000/sync/blueprint/:id  
Performs a sync of specified blueprint ID to associated applications.
  
POST https://hostname:3000/sync/child/:id  
Specified application by ID will fetch/sync all associated blueprints.  

GET https://hostname:3000/child/full
Returns a list of all children/applications depending on blueprints.

POST https://hostname:3000/child/:childId/remove  
BODY array of blueprint IDs  
Removes the child from specified blueprints. This will remove all synced objects from child as well as remove the association to the blueprint in QMC.
  
  
## Worried about performance and RAM?  
Architeqt only loads the objects and NO data into RAM during sync to reduce the footprint.  
This means you are able to propogate a sync even during production hours.

##FAQ  

**What if I have a custom certificate for external access?**  
You still use the internal server name and the generated certs for the QRS and Engine config.  
For the REST API you would use your external cert and hostname.  

**I'm worried about security**  
You can add another layer of security on top of the REST if you wish to do so.  
However the REST is only capable of removing synced blueprint items so the worst thing a malicious hacker could do is to remove your blueprints from Apps. Track the hacker down through the logs, give him/her a spanking and then apply the blueprints again :)

**I hate the client**  
Good! You can build your own using the supplied REST API.  
If you do, feel free to contribute it back!  

**I found a bug**  
Open a issue here on Github with as much details as possible.  
If you are inclined feel free to fork the repo, fix the issue and submit a pull request.  
  
**I want to exlude some sheets from syncing in my blueprints**  
Include the word EXCLUDE (in uppercase) in the sheet title and the sheet will be excluded from sync.