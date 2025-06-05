[Simple Interactive Tester](https://missioncommand.github.io/js-samples/singlePointTester3.html)  
[Multipoint Web Worker Example](https://missioncommand.github.io/js-samples/MPWW.html)  
[SinglePoint Web Worker Example](https://missioncommand.github.io/js-samples/SVGWW.html)  

[Wiki](https://github.com/missioncommand/mil-sym-ts/wiki)  
[JavaDocs](https://missioncommand.github.io/javadoc/2525D/typescript/index.html)  

The old 2525C renderer has been retired but the libraries and usage information are still available here:  
[2525C Renderer Overview](https://github.com/missioncommand/mil-sym-ts/wiki/2525C-Renderer-Overview)

Notes:

Starting with version 2.2.0, support for running in NodeJS was added.  
The node release will be the baseline version on [npmjs.com](https://www.npmjs.com/package/@armyc2.c5isr.renderer/mil-sym-ts?activeTab=versions)  
The web version of the release will have the 'WEB' tag with the same version number.  

The Node version depends on [node-canvas](https://www.npmjs.com/package/canvas).  
```
npm install canvas  
```

The Web version leverage the canvas in the browser.  

Compilation Step:  
```
npm run clean
npm run build
//Node Build
npm run bundleWPN
//Web Build
npm run bundleWPW
//generate DTS file
npm run bundleDTS
npm run pack
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
