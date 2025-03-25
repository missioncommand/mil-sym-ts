//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
//THIS IS AN EXAMPLE.  You can implement the web worker however you like.
//The ErrorLogger class will no longer log to the console as it doesn't' exist in a web worker.  ErrorLogger.LogException() will just throw the exception passed into it.
//You can optionally replace the ErrorLogger class (like in the commented sample below to behave differently)

/* expected input format for batch
var e.data = {};
        e.data.altMode = "absolute";//for 3D
		e.data.scale = scale4;//for 3D like 50000.0;  a number corresponding to how many meters one meter of our map represents. A value "50000" would mean 1:50K which means for every meter of our map it represents 50000 meters of real world distance.
		e.data.bbox = bbox4;//like "66.25,30.60,66.28,30.65";"lowerLeftX,lowerLeftY,upperRightX,upperRightY."
        e.data.format = format;//0 for KML, 2 for GeoJSON, 6 for GeoSVG
        e.data.pHeight = pixelHeight;//for 2D
		e.data.pWidth = pixelWidth;//for 2D
        e.data.fontInfo = {name:"Arial",weight:"bold",size:15} OPTIONAL
        e.data.batch = [{id:"ID",name:"name",description:"description",symbolID:"110325000014170000000000000000",points:controlPoints,symStd:symStd,modifiers:{ModifiersTG.T_UNIQUE_DESIGNATION_1:"T"},attributes:{MilStdAttributes.LineColor:"#00FF00"}}];
        
*/

/* return objects for batch
{
    //GeoJSON
    [{id:batch.id,symbolID:symbolID,geojson:"geojson string"]
    Error message in item.geojson looks like: 
    {"type":"error","error":"There was an error creating the MilStdSymbol 110325000014170000000000000000 - ID: ID - Basic ID: 25141700 requires a minimum of 3 points. 2 are present."}
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

var document = {};//*/

///////////////////////////////////////////////////////////////////////////////

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

parseMetaData = function(svg)
{
    var width = 0;
    var height = 0;
    var symbolID = "";
    var geoTL = 0;
    var geoBR = 0;
    var geoTR = 0;
    var geoBL = 0;
    var north = 0;
    var south = 0;
    var east = 0;
    var west = 0;
    var wasClipped = false;
    var strPoint = "";
    var arrPoint = null;
    var b64;
      
    var start = 0;
    var end = 0;
    if(svg != null && typeof svg == "string")
    {
        start = svg.indexOf("width=\"") + 7;
        end = svg.indexOf("px",start);
        width = parseInt(svg.substring(start,end));
        
        start = svg.indexOf("height=\"",end) + 8;
        end = svg.indexOf("px",start);
        height = parseInt(svg.substring(start,end));
        
        start = svg.indexOf("<symbolID>",end) + 10;
        end = svg.indexOf("</symbolID>",start);
        symbolID = svg.substring(start,end);
        
        start = svg.indexOf("<geoTL>",end) + 7;
        end = svg.indexOf("</geoTL>",start);
        strPoint = (svg.substring(start,end));
        arrPoint = strPoint.split(" ");
        geoTL = new C5Ren.Point2D(arrPoint[0],arrPoint[1]);

        start = svg.indexOf("<geoBR>",end) + 7;
        end = svg.indexOf("</geoBR>",start);
        strPoint = (svg.substring(start,end));
        arrPoint = strPoint.split(" ");
        geoBR = new C5Ren.Point2D(arrPoint[0],arrPoint[1]);

        start = svg.indexOf("<geoTR>",end) + 7;
        end = svg.indexOf("</geoTR>",start);
        strPoint = (svg.substring(start,end));
        arrPoint = strPoint.split(" ");
        geoTR = new C5Ren.Point2D(arrPoint[0],arrPoint[1]);

        start = svg.indexOf("<geoBL>",end) + 7;
        end = svg.indexOf("</geoBL>",start);
        strPoint = (svg.substring(start,end));
        arrPoint = strPoint.split(" ");
        geoBL = new C5Ren.Point2D(arrPoint[0],arrPoint[1]);

        start = svg.indexOf("<north>",end) + 7;
        end = svg.indexOf("</north>",start);
        north = parseFloat(svg.substring(start,end));

        start = svg.indexOf("<south>",end) + 7;
        end = svg.indexOf("</south>",start);
        south = parseFloat(svg.substring(start,end));

        start = svg.indexOf("<east>",end) + 6;
        end = svg.indexOf("</east>",start);
        east = parseFloat(svg.substring(start,end));

        start = svg.indexOf("<west>",end) + 6;
        end = svg.indexOf("</west>",start);
        west = parseFloat(svg.substring(start,end));
        
        start = svg.indexOf("<wasClipped>",end) + 12;
        end = svg.indexOf("</wasClipped>",start);
        if(svg.substring(start,end).length==4)
            wasClipped = true;
        else
            wasClipped = false;

        b64 = "data:image/svg+xml;base64," + btoa(svg);
    }
    return {svg:svg, symbolID,symbolID, height:height, width:width, geoTL:geoTL,geoBR:geoBR,geoTR:geoTR,geoBL:geoBL,north:north,south:south,east:east,west:west,wasClipped,wasClipped,b64:b64};
}
	

onmessage = function(e)
{
    var si = null;
    var batch = null;
    var msir = C5Ren.MilStdIconRenderer.getInstance();
    var RS = C5Ren.RendererSettings.getInstance();
	var output = null;
    var converter = null;
    var fontInfo = null;
    var oldFont = null;
    var format = ["kml","json","geojson"];
    
    if(e.data.fontInfo)
    {
        fontInfo = e.data.fontInfo;
        oldFont = RS.getMPLabelFont();
        RS.setMPLabelFont(fontInfo.name, fontInfo.style, fontInfo.size);
    }

    
	
    if(e.data && e.data.batch && e.data.batch.length > 0)
    {
        var result = null;
        var len = e.data.batch.length;
        var items = e.data.batch;
        var temp = null;
        var mod;
        var att;
        //output = new Array(len);
        output = [];
        try
        {
            for(var i = 0; i < len; i++)
            {
                item = items[i];

                if(item.modifiers instanceof Map)
                    mod = item.modifiers;
                else
                    mod = convertToMap(item.modifiers);
                if(item.attributes instanceof Map)
                    att = item.attributes;
                else
                    att = convertToMap(item.attributes);


                if(e.data.altMode)
                {
                    if(e.data.converter)
                        converter = e.data.converter;	
                    //data for symbol on 3d map so call RenderSymbol     
                    result = C5Ren.WebRenderer.RenderSymbol(item.id,item.name,item.description, item.symbolID, item.points, e.data.altMode,e.data.scale, e.data.bbox, mod, att, e.data.format);
                }
                else
                {
                    //data for symbol on 2D map so call RenderSymbol2D
                    result = C5Ren.WebRenderer.RenderSymbol2D(item.id,item.name,item.description, item.symbolID, item.points, e.data.pixelWidth,e.data.pixelHeight, e.data.bbox, mod, att, e.data.format);
                }
                if(result)
                {
                    if(e.data.format === C5Ren.WebRenderer.OUTPUT_FORMAT_GEOSVG)
                    {
                        //result.id = item.id;
                        //result.symbolID = item.symbolID;
                        //output[i] = result;
                        result = parseMetaData(result);
                        result.id = item.id;
                        output.push(result);
                    }
                    else//KML or GeoJSON return string
                    {
                        temp = {id:item.id, symbolID:item.symbolID}
                        temp[format[e.data.format]] = result; 
                        output.push(temp);
                    }
                }
            }
        }
        catch(err)
        {
            throw(err);
        }
        //[{id:batch.id,symbolID:symbolID,svg:dataURI,geoTL:geoCoordTL, geoBR:geoCoordBR, wasClipped:wasClipped}]
    }
    else if(e.data)
    {
        if(item.modifiers instanceof Map)
            mod = item.modifiers;
        else
            mod = convertToMap(item.modifiers);
        if(item.attributes instanceof Map)
            att = item.attributes;
        else
            att = convertToMap(item.attributes);
        
        if(e.data.altMode)
        {
            if(e.data.converter)
                converter = e.data.converter;	
            //data for symbol on 3d map so call RenderSymbol     
            output = C5Ren.WebRenderer.RenderSymbol(e.data.id,e.data.name,e.data.description, e.data.symbolID, e.data.points, e.data.altMode,e.data.scale, e.data.bbox, mod, att, e.data.format);
        }
        else
        {
            //data for symbol on 2D map so call RenderSymbol2D
            output = C5Ren.WebRenderer.RenderSymbol2D(e.data.id,e.data.name,e.data.description, e.data.symbolID, e.data.points, e.data.pixelWidth,e.data.pixelHeight, e.data.bbox, mod, att, e.data.format);
        }
    }

    if(fontInfo)
    {
        RS.setMPLabelFont(oldFont.getName(), oldFont.getType(), oldFont.getSize());//name, size, style, scale
    }
	
	if(e.data.batch)
    {
        postMessage({result:output,format:e.data.format});
    }
    else
    {
        if(output && output.substring)//kml or geojson
        {
            //return results
            var format = e.data.format;
            if(output.substring(0,15) === '{"type":"error"')
            {
                format = "ERROR";
            }
            postMessage({id:e.data.id,result:output,format:format});
                
        }
        else if(output)//SVG
        {
            postMessage({id:e.data.id,result:output,format:format});
        }
    }
	
}

