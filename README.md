# mil-sym-ts

## About

mil-sym-ts is an TypeScript port of the [Java-based MIL-STD rendering libraries](https://github.com/missioncommand/mil-sym-java) that have been used in US Army Mission Command software for years. In November 2013 Mission Command was given the approval to release and maintain these libraries as public open source. Eventually work on the MIL-STD-2525C SEC Renderer ended and the project was retired. 

This is a continuation of that effort and this library aims to support 2525D, 2525E and potentially more future versions.

[Simple Interactive Tester](https://missioncommand.github.io/js-samples/singlePointTester3.html)  
[Multipoint Web Worker Example](https://missioncommand.github.io/js-samples/MPWW.html)  
[SinglePoint Web Worker Example](https://missioncommand.github.io/js-samples/SVGWW.html)  

[Wiki](https://github.com/missioncommand/mil-sym-ts/wiki)  
[JavaDocs](https://missioncommand.github.io/javadoc/2525D/typescript/index.html)  

The old JavaScript 2525C renderer has been retired but the libraries and usage information are still available here:  
[2525C Renderer Overview](https://github.com/missioncommand/mil-sym-ts/wiki/2525C-Renderer-Overview)

Ports
-----------
[Java](https://github.com/missioncommand/mil-sym-java)  
[Android](https://github.com/missioncommand/mil-sym-android)  
[TypeScript](https://github.com/missioncommand/mil-sym-ts)  

MIL-STD-2525
-----------
The MIL-STD-2525 standard defines how to visualize military symbology.  This project provides support for the entire MIL-STD-2525D Change 1 and 2525E Change 1.  APP6D support has been added as well.  Note that this implementation included the latest change proposals so things may not line up if you're just looking at the base APP6D document.  

Features
-----------
* Support for MilStd 2525 Dch1 (11), Ech1(15), NATO APP6D(10) and partial support for APP6Ev2 (16)(icons only)  
* [Rendering icons](https://github.com/missioncommand/mil-sym-java/wiki/2525D--Renderer-Overview/_edit#22-singlepoint-icon-symbology) as a BufferedImage (Java), Bitmap (Android), and SVG.  
* [Rendering of multipoints](https://github.com/missioncommand/mil-sym-java/wiki/2525D--Renderer-Overview/_edit#33-multipoint-symbology) as [GeoJSON](https://github.com/missioncommand/mil-sym-java/wiki/Interpreting-GeoJSON-Output), [GeoSVG](https://github.com/missioncommand/mil-sym-java/wiki/Interpreting-GeoSVG-Output) or as a [MilStdSymbol Object](https://github.com/missioncommand/mil-sym-java/wiki/Making-Use-of-MilStdSymbol) with all the information needed to draw on your map.  
* [MSLookup](https://github.com/missioncommand/mil-sym-java/wiki/2525D--Renderer-Overview#5-mslookup) class to get information on any symbol such as point count, draw rule, applicable modifier, etc...  
* The ability to add [custom icons](https://github.com/missioncommand/mil-sym-java/wiki/Adding-Custom-Symbols) to an existing symbol set.

Notes
-----------

Starting with version 2.2.0, support for running in NodeJS was added.  
The node release will be the baseline version on [npmjs.com](https://www.npmjs.com/package/@armyc2.c5isr.renderer/mil-sym-ts?activeTab=versions)  
The web version of the release will be [mil-sym-ts-web](https://www.npmjs.com/package/@armyc2.c5isr.renderer/mil-sym-ts-web?activeTab=versions)  

The Node version depends on [node-canvas](https://www.npmjs.com/package/canvas).  
```
npm install canvas  
```

The Web version leverage the canvas in the browser.  

Compilation Options:  
```
//For Web Target
buildWeb.bat
//For Node Target
buildNode.bat
```

The following classes are exported by the module:  

Point  
Point2D  
Rectangle2D  
Font  
Color  
AffiliationColors  
DistanceUnit  
LogLevel  
ErrorLogger  
MilStdAttributes  
Modifiers  
DrawRules  
MODrawRules  
GENCLookup  
MSLookup  
MSInfo  
SVGInfo  
SVGSymbolInfo  
SymbolUtilities  
RendererSettings  
SymbolID  
MilStdSymbol  
MilStdIconRenderer  
WebRenderer  

![Pixel](https://static.scarf.sh/a.png?x-pxid=252ad914-d130-4c60-8f35-abf2c8308383)
