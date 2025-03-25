//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
//THIS IS AN EXAMPLE.  You can implement the web worker however you like.
//The ErrorLogger class will no longer log to the console as it doesn't' exist in a web worker.  ErrorLogger.LogException() will just throw the exception passed into it.
//You can optionally replace the ErrorLogger class (like in the commented sample below to behave differently)

/* expected input format for non-batch
var batch = [];//batch objects look like {id:"ID",symbolID:"SFGPU----------",modifiers:{Modifiers.T_UNIQUE_DESIGNATION_1:"T",MilStdAttributes.PixelSize:"50"}};
var e.data = {base64:true, batch:batch};
		e.data.batch[].id = "ID";
		e.data.batch[].symbolID = "SFGPU----------";//A 15 character symbolID corresponding to one of the graphics in the MIL-STD-2525C
		e.data.batch[].modifiers = Map<string,string>  {ModifiersUnits.T_UNIQUE_DESIGNATION_1:"T"};
        e.data.batch[].attributes = Map<string,string>  {MilStdAttributes.PixelSize:50};
        e.data.format = "svg", "base64", "both"
                if(format === "svg"), return object will have a .svg property with the svg string
                if(format === "base64"), return object will have a .base64 property with the svg string like:
                    "data:image/svg+xml;base64,[SVG string after run through btoa()]
                if(format === "both"), return object will have both properties.
*/

/* return object for non-batch
{
    id:e.data.id,//same as what was passed in
    symbolID:e.data.SymbolID,//resultant kml,json or error message
    svg:svg string
    anchorPoint:
    symbolBounds:
    imageBounds:
    base64:svg string like: "data:image/svg+xml;base64,[SVG string after run through btoa()]". 
}
*/

/* expected input format for batch
var e.data = {};
        e.data.batch = {fontInfo:fontInfo,batch:[{id:"ID",symbolID:"SFGPU----------",modifiers:{ModifiersUnits.T_UNIQUE_DESIGNATION_1:"T"},attributes:{MilStdAttributes.PixelSize:50}}]}
*/

/* return object for batch
{
    [{id:batch.id,symbolID:batch.symbolID,svg:si.getSVG(),anchorPoint:si.getSymbolCenterPoint(),symbolBounds:si.getSymbolBounds(),bounds:si.getImageBounds()}]
}
*/



//importScripts('dist/C5RenDebug.js');
importScripts('../dist/C5Ren.js');

let path = "/dist/";
//let path = self.location;

C5Ren.initialize(path);//self.location
/*
    //ErrorLogger can't output to console in a webworker so change behavior here if you like//////////////////////
	C5Ren.ErrorLogger = {};
	C5Ren.ErrorLogger.LogMessage = function(sourceClass, sourceMethod, message){throw {message:(sourceClass + "-" + sourceMethod + ": " + message)}};
	C5Ren.ErrorLogger.LogWarning = function(sourceClass, sourceMethod, message, level){throw {message:(sourceClass + "-" + sourceMethod + ": " + message)}};
	C5Ren.ErrorLogger.LogException = function(sourceClass, sourceMethod, err, level)
	{
		var strMessage = (sourceClass + "." + sourceMethod + "(): " + err.message);
		var myStack = "";
		if(err.stack !== undefined)
		{
			myStack = err.stack;
		}
		
		if(!(myStack))
		{
			if(err.filename && err.lineno)
			{
				myStack = err.filename + " @ line# " + err.lineno;
			}
		}
		strMessage += "\n" + myStack;
		err.message += "\n" + myStack;
		throw strMessage;
		//throw {message:strMessage,error:err, stack:myStack};
	};
	
	
	var window = {};
	var console = {};
	console.log = console.log || function(){};
	console.info = console.info || function(){};
	console.warn = console.warn || function(){};
	console.error = console.error || function(){};
	window.console = console;
	
	var document = {};
//*/
    ///////////////////////////////////////////////////////////////////////////
	
convertToMap = function(obj)
{
    var map = new Map();
    if(obj != null)
    {
        for (const [key, value] of Object.entries(obj)) 
        {
            //console.log(`${key}: ${value}`);
            map.set(key, value);
        }
    }
      return map;
}

onmessage = function(e)
{
    var si = null;
    var batch = null;
    var msir = C5Ren.MilStdIconRenderer.getInstance();
	
    if(e.data !== null)
    {
        try
        {
			if(e.data.fontInfo)//set the font to be used with this batch of symbols, if not set will use last value
			{
				fontInfo = e.data.fontInfo;
				RS.setLabelFont(fontInfo.name, fontInfo.style, fontInfo.size);
			}
	
            var returnVal = null;
            if(e.data.batch && e.data.batch.length > 0)
            {
                var batch = e.data.batch;
                var returnBatch = [];
                var len = e.data.batch.length;
                var item = null;
                
                for(var i = 0; i < len; i++)
                {
                    item = batch[i];
                    var mod;
                    var att;
                    
                    if(item.modifiers instanceof Map)
                        mod = item.modifiers;
                    else
                        mod = convertToMap(item.modifiers);
                    if(item.attributes instanceof Map)
                        att = item.attributes;
                    else
                        att = convertToMap(item.attributes);

                    if(msir.CanRender(item.symbolID, item.attributes))
                    {
                        si = msir.RenderSVG(item.symbolID,mod,att);
                        if(si == null)
                            throw(new Error("Failed to Render: " + item.symbolID));
                        returnVal = {id:item.id,symbolID:item.symbolID,anchorPoint:si.getSymbolCenterPoint(),symbolBounds:si.getSymbolBounds(),bounds:si.getImageBounds()};
                        if(e.data.format === "base64")
                            returnVal.base64 = si.getSVGDataURI();
                        else if(e.data.format === "both")
                        {
                            returnVal.base64 = si.getSVGDataURI();
                            returnVal.svg = si.getSVG();
                        }
                        else
                            returnVal.svg = si.getSVG();
                        
                        returnBatch.push(returnVal);
                    }
                    else
                    {
                        returnVal = {id:item.id,symbolID:item.symbolID,anchorPoint:null,symbolBounds:null,bounds:null,svg:null,base64:null};
                        returnVal.error = "Can't render code: " + item.symbolID + ", ID: " + item.id;

                        var msi = C5Ren.MSLookup.getInstance().getMSLInfo(item.symbolID);
                        if(msi == null)
                            returnVal.error += "/n code not found in the Lookup."
                        else
                        {
                            if(msi.getDrawRule()==0)
                                returnVal.error += "/n code is not a drawable symbol and likely just representative of a symbol category."
                        }
                        returnBatch.push(returnVal);
                    }
                }
                if(si !== null)
                {
                    postMessage(returnBatch);
                }
                else
                {
                    postMessage({error:"no results"});
                }
            }
            else if(e.data.id && e.data.symbolID)
            {
                var mod = convertToMap(e.data.modifiers);
                var att = convertToMap(e.data.attributes);
                si = msir.RenderSVG(e.data.symbolID,mod,att);
            
                if(si !== null)
                {
                    //return results
                    returnVal = {id:e.data.id,symbolID:e.data.symbolID,svg:si.getSVG(),anchorPoint:si.getSymbolCenterPoint(),symbolBounds:si.getSymbolBounds(),bounds:si.getImageBounds()};
                    
                    if(e.data.format === "base64")
                        returnVal.base64 = si.getSVGDataURI();
                    else if(e.data.format === "both")
                    {
                        returnVal.base64 = si.getSVGDataURI();
                        returnVal.svg = si.getSVG();
                    }
                    else
                        returnVal.svg = si.getSVG();
                    
                    postMessage(returnVal);
                }
                else
                {
                    postMessage({error:"no results"});
                }
            }
            else
            {
                JSON.stringify(e.data);
                postMessage({error:"no batch object or symbol information" + JSON.stringify(e.data)});
            }
            
            
        }
        catch(err)
        {
            C5Ren.ErrorLogger.LogException("SPWorker","onmessage",err);
        }
    }
	
	
	
}

