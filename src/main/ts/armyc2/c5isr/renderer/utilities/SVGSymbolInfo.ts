import { type int } from "../../graphics2d/BasicTypes";
import { Point } from "../../graphics2d/Point"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { SymbolDimensionInfo } from "../../renderer/utilities/SymbolDimensionInfo"


export class SVGSymbolInfo implements SymbolDimensionInfo {

    private _svg: string;
    private _svgDataURI: string;

    private _anchorX: int = 0;
    private _anchorY: int = 0;
    private _symbolBounds: Rectangle2D;
    private _bounds: Rectangle2D;

    public constructor(svg: string, anchorPoint: Point2D, symbolBounds: Rectangle2D, svgBounds: Rectangle2D) {
        this._svg = svg;
        this._anchorX = anchorPoint.getX() as int;
        this._anchorY = anchorPoint.getY() as int;
        this._symbolBounds = symbolBounds;
        this._bounds = svgBounds;
    }

    // https://web.dev/articles/base64-encoding
    // From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
    private bytesToBase64(bytes) 
    {
        const binString = String.fromCodePoint(...bytes);
        return btoa(binString);
    }

    private escapeChars(text:string):string
    {
        /*
        Character	XML encoding	XML entity
        \&	        \&amp;	        \&\#38
        \'	        \&apos;	        \&\#30
        \"	        \&quot;	        \&\#34
        \<	        \&lt;	        \&\#60
        \>	        \&gt;	        \&\#62  //*/

        let temp = text;

        /*temp = temp.replace(/\n/g,"");
        temp = temp.replace(/</g,"%3C");
        temp = temp.replace(/>/g,"%3E");//*/

        temp = temp.replace(/\n/g,"");
        temp = temp.replace(/%/g,"%25");
        temp = temp.replace(/#/g,"%23");//# to %23 for FF
        temp = temp.replace(/"/g,"%22"); //" to %22 for EDGE
        temp = temp.replace(/</g,"%3C");
        temp = temp.replace(/=/g,"%3D")
        temp = temp.replace(/>/g,"%3E");
        temp = temp.replace(/\//g,"%2F");
        temp = temp.replace(/\\/g,"%5C");
        temp = temp.replace(/\[/g,"%5B");
        temp = temp.replace(/\]/g,"%5D");
        temp = temp.replace(/\^/g,"%5E");
        temp = temp.replace(/\`/g,"%60");
        temp = temp.replace(/\~/g,"%7E");
        //temp = temp.replace(/\!/g,"%33");
        temp = temp.replace(/\?/g,"%3F");
        temp = temp.replace(/:/g,"%3A");
        temp = temp.replace(/;/g,"%3B");
        temp = temp.replace(/\@/g,"%40");
        //temp = temp.replace(/\&/g,"%26");//&amp;
        //temp = temp.replace(/\&/g,"&amp;");//&amp;//done in SVGTextInfo.toSVGElement AND Shape2SVG.ConvertForGroup
        temp = temp.replace(/\{/g,"%7B");
        temp = temp.replace(/\|/g,"%7C");
        temp = temp.replace(/\}/g,"%7D");//*/

        return temp;
    }

    public getSVGDataURI(): string {
        if (this._svgDataURI == null) 
        {
            //works with special characters but not in base64.  Which should be fine.
            //let temp:string = "data:image/svg+xml," + this.escapeChars(this._svg);

            // https://web.dev/articles/base64-encoding
            // From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
            //works with base64
            let temp:string = "data:image/svg+xml;base64," + btoa(String.fromCodePoint(...new TextEncoder().encode(this._svg)))

            this._svgDataURI = temp;
        }
        return this._svgDataURI;
    }

    public getSVG(): string { return this._svg; }

    /**
     * The x value the image should be centered on or the "anchor point".
     * @return 
     */
    public getSymbolCenterX(): int {
        return this._anchorX;
    }

    /**
     * The y value the image should be centered on or the "anchor point".
     * @return 
     */
    public getSymbolCenterY(): int {
        return this._anchorY;
    }

    /**
     * The point the image should be centered on or the "anchor point".
     * @return 
     */
    public getSymbolCenterPoint(): Point2D {
        return new Point2D(this._anchorX, this._anchorY);
    }

    /**
     * minimum bounding rectangle for the core symbol. Does
     * not include modifiers, display or otherwise.
     * @return 
     */
    public getSymbolBounds(): Rectangle2D {
        return this._symbolBounds;
    }

    /**
     * Dimension of the entire image.
     * @return 
     */

    public getImageBounds(): Rectangle2D {
        return new Rectangle2D(this._bounds.getX(), this._bounds.getY(), this._bounds.getWidth(), this._bounds.getHeight());
    }
}
