[Simple Interactive Tester](https://missioncommand.github.io/js-samples/singlePointTester3.html)  
[Multipoint Web Worker Example](https://missioncommand.github.io/js-samples/MPWW.html)  
[SinglePoint Web Worker Example](https://missioncommand.github.io/js-samples/SVGWW.html)  

[Wiki](https://github.com/missioncommand/mil-sym-ts/wiki)

Old 2525C libraries available here:  
[mil-sym-js.release.v0.3.37](https://missioncommand.github.io/oldReleases/mil-sym-js.release.v0.3.37.zip)  
[mil-sym-js.release.v0.3.39](https://missioncommand.github.io/oldReleases/mil-sym-js.release_candidate.v0.3.39.zip)  

Usage:

Renderer must be initialized first.

C5Ren.initialize(location):Promise

If no value passed, it assumes assets are in the same location.
If library and its json asset files are at the location "127.0.0.1:8080/renderer/C5Ren.js"

Call like: C5Ren.initialize("/renderer/");

When the promise resolves, files are loaded and initialized and the renderer is ready to go.

The following classes are exported by the module:

Point
Point2D
Rectangle2D
Font
Color
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
