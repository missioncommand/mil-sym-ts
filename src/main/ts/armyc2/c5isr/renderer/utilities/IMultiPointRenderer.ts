/**
 * @deprecated
 */
interface IMultiPointRenderer {

      /**
       * Renders all multi-point symbols, creating KML that can be used to draw
       * it on a Google map.  Multipoint symbols cannot be draw the same 
       * at different scales. For instance, graphics with arrow heads will need to 
       * redraw arrowheads when you zoom in on it.  Similarly, graphics like a 
       * Forward Line of Troops drawn with half circles can improve performance if 
       * clipped when the parts of the graphic that aren't on the screen.  To help 
       * readjust graphics and increase performance, this function requires the 
       * scale and bounding box to help calculate the new locations.
       * @param id A unique identifier used to identify the symbol by Google map. 
       * The id will be the folder name that contains the graphic.
       * @param name a string used to display to the user as the name of the 
       * graphic being created.
       * @param description a brief description about the graphic being made and 
       * what it represents.
       * @param symbolCode A 15 character symbolID corresponding to one of the
       * graphics in the MIL-STD-2525C
       * @param controlPoints The vertices of the graphics that make up the
       * graphic.  Passed in the format of a string, using decimal degrees 
       * separating lat and lon by a comma, separating coordinates by a space.  
       * The following format shall be used "x1,y1[,z1] [xn,yn[,zn]]..."
       * @param altitudeMode Indicates whether the symbol should interpret 
       * altitudes as above sea level or above ground level. Options are 
       * "clampToGround", "relativeToGround" (from surface of earth), "absolute" 
       * (sea level), "relativeToSeaFloor" (from the bottom of major bodies of 
       * water).
       * @param scale A number corresponding to how many meters one meter of our 
       * map represents. A value "50000" would mean 1:50K which means for every 
       * meter of our map it represents 50000 meters of real world distance.
       * @param bbox The viewable area of the map.  Passed in the format of a
       * string "lowerLeftX,lowerLeftY,upperRightX,upperRightY." Not required
       * but can speed up rendering in some cases.
       * example: "-50.4,23.6,-42.2,24.2"
       * @param modifiers A JSON string representing all the possible symbol 
       * modifiers represented in the MIL-STD-2525C.  Format of the string will be
       * {"modifiers": {"attributeName":"value"[,"attributeNamen":"valuen"]...}}
       * The quotes are literal in the above notation.  Example: 
       * {"modifiers": {"quantity":"4","speed":"300","azimuth":[100,200]}}
       * @param format An enumeration: 0 for KML, 1 for JSON.
       * @param symStd An enumeration: 0 for 2525Bch2, 1 for 2525C.
       * @return A JSON string representation of the graphic.
       */
      RenderSymbol(id: string, name: string, description: string,
            symbolCode: string, controlPoints: string, altitudeMode: string,
            scale: number, bbox: string, modifiers: string, format: number, symStd: number): string;


      /**
       * Renders all multi-point symbols, creating KML or JSON for the user to
       * parse and render as they like.
       * This function requires the bounding box to help calculate the new
       * locations.
       * @param id A unique identifier used to identify the symbol by Google map.
       * The id will be the folder name that contains the graphic.
       * @param name a string used to display to the user as the name of the 
       * graphic being created.
       * @param description a brief description about the graphic being made and 
       * what it represents.
       * @param symbolCode A 15 character symbolID corresponding to one of the
       * graphics in the MIL-STD-2525C
       * @param controlPoints The vertices of the graphics that make up the
       * graphic.  Passed in the format of a string, using decimal degrees
       * separating lat and lon by a comma, separating coordinates by a space.
       * The following format shall be used "x1,y1 [xn,yn]..."
       * @param pixelWidth pixel dimensions of the viewable map area
       * @param pixelHeight pixel dimensions of the viewable map area
       * @param bbox The viewable area of the map.  Passed in the format of a
       * string "lowerLeftX,lowerLeftY,upperRightX,upperRightY."
       * example: "-50.4,23.6,-42.2,24.2"
       * @param modifiers A JSON string representing all the possible symbol
       * modifiers represented in the MIL-STD-2525C.  Format of the string will be
       * {"modifiers": {"attributeName":"value"[,"attributeNamen":"valuen"]...}}
       * The quotes are literal in the above notation.  Example:
       * {"modifiers": {"quantity":"4","speed":"300","azimuth":[100,200]}}
       * @param format An enumeration: 0 for KML, 1 for JSON.
       * @param symStd An enumeration: 0 for 2525Bch2, 1 for 2525C.
       * @return A JSON (1) or KML (0) string representation of the graphic.
       */
      RenderSymbol2D(id: string, name: string, description: string, symbolCode: string, controlPoints: string,
            pixelWidth: number, pixelHeight: number, bbox: string, modifiers: string, format: number, symStd: number): string;

}
