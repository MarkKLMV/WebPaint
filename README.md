#Web.Paint multi-user project

##Used Libraries and Frameworks
### Client
1. Fabric.js v.1.7.15
1. jQuery v.1.10.2
1. Bootstrap v.3.3.7
1. jQuery Gritter v.1.7.4
1. Font Awesome
1. QUnit-MVC v.1.6.2
### Server
1. MVC 5
1. SignalR v.2.2.2

##Features
#Tools
1. Free drawing
1. Simple line
1. Circle
1. Arrow (svg)
1. Rectangle
1. Textbox
1. Eraser

* Some of them can have thickness edited.
* Any object can change its color (via colorpicker).
* Any object excepting Free drawing/Eraser ones can be: 
	* resized(circle tool has less resize controls), 
	* moved, 
	* rotated (only line and arrow)
* After object is added to canvas, it saves interactivity (resizability, movability, rotatability) until the first focus lose.
* When you choose Free drawing/Eraser tool, canvas is switched on Free Drawing mode until you select sth else.
* There're unlimited canvas folders for users. You can click 'Add' on dropdown and new canvas folder will be created.
	Once you switch canvas folder, your changes will be saved.
	Canvas is syncronized only between clients, working on the same folder.
	System notifies all clients about canvases' savings.

##Server description
MVC acrhitecture is used.
SignalR is used to provide multiple users communication. SignalR hubs are used to syncronize client actions with canvas.

##Client description
Module-based architecture is used.
Client receives notifications when some other client is connected/disconnected.
The canvas syncronization logic is configured the way each client has its own canvas with his objects and currently added objects by other clients.
Client can edit only his objects.
Any canvas change is syncronized only after it has been performed in order to reduce the server high load. 
Only specific local changes (objects) are syncronized. There's no whole canvas transmitting among the clients, because its size can be too big.
Canvas changes are transmitted via pretty JSON format among the clients.
The canvas state is saved during the client session in browser storage. After page refresh it can be restored.

```javascript
var Module = Module || {
	/*Module structure*/
}
```

##Web.Paint Main Unit functions
Method|Description
---|---
Core functions|-
setupSlider|Performs line size slider initialization. Includes event binding.
setupColorPicker|Performs color picker initialization. Includes event binding.
setupCanvas|Performs drawing canvas initialization. Includes event binding.
setupTools|Performs Paint tools initialization. Binds *click* event to each one.
Hub triggers|-
triggerUpdateCanvas|Triggers the whole canvas update and redraw for the rest clients
triggerAddObjectToCanvas|Triggers object addition to canvas for the rest clients
triggerUpdateObjectOnCanvas|Triggers object update on canvas for the rest clients
triggerAddNewCanvas|Triggers canvas folder add and notifies the rest clients about it
triggerNotifyClientsAboutDirectoryUpdate|Triggers the notification about canvas directory update by the current client for the rest clients
triggerNotifyClientsAboutSavedCanvas|Triggers canvas saving to the current directory and notifies the rest clients about it
Hub client functions|-
updateCanvas|Updates canvas on current client
addObjectToCanvas|Adds object to canvas on current client
updateObjectOnCanvas|Updates object on canvas on current client. The old object is found by identifier and removed and the new one is inserted to the end of canvas objects array.
updateDirectory|Updates the current canvas directory name
addNewCanvas|Appends new canvas directory option to dropdown
Utils|-
uuidv4|Generates the GUID idenfier for canvas object

##Web.Paint Hub Unit functions
Method|Description
---|---
Core functions|-
handleExit|Stops the listening and performs the rest clients notification about the current client is disconnected.
isCanvasDumpExist|Checks whether the client has saved canvas JSON dump in browser storage or not.
saveOrUpdateCanvasDump|Saves the JSON canvas dump to browser storage.
*window.onunload* handler|Performs the current canvas storing before client leaves the page. The canvas dump is alive through the session.

##Web.Paint Notice functions
Method|Description
---|---
showLightInfo|Shows the popup message with light info background
showWarning|Shows the popup message with yellow warning background
showError|Shows the popup message with red error background
showSuccess|Shows the popup message with green success background

##Web.Paint Client Tests
* QUnit-MVC library is used for Javascript testing.

Method|Description
---|---
addObjectToCanvas|Performs testing objects so they're correctly added to canvas
resizeCanvas|Performs testing Canvas size update so canvas rect has the correct size depending on screen resolution

## Site
#Url
* [Web.Paint](http://kairgrw-001-site1.ftempurl.com)
* [Web.Paint Test](http://kairgrw-001-site1.ftempurl.com/Test)