import { type double, type int } from "../../graphics2d/BasicTypes";

import { Font } from "../../graphics2d/Font"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { RendererSettings } from "./RendererSettings"
import { ShapeUtilities } from "./ShapeUtilities";
import { RectUtilities } from "./RectUtilities";

/**
 *
 *
 */
export class SVGTextInfo {
	protected _text: string;
	protected _font: string;
	protected _fontName: string;
	protected _fontSize: number = 0;
	protected _fontStyle: string;
	protected _location: Point2D;
	protected _bounds: Rectangle2D;
	protected _descent: double = 0;
	protected _aboveBaseHeight: double = 0;
	private justification: string = "start";
	private angle: number = 0;
	private alignmentBaseline: string = "alphabetic"
	public constructor(text: string, position: Point2D, font: Font, justification: string, angle: number);
	public constructor(text: string, x: int, y: int, font: Font, context: OffscreenCanvasRenderingContext2D | null);
	public constructor(text: string, x: int, y: int, font: string, context: OffscreenCanvasRenderingContext2D | null);
	public constructor(text: string, x: int, y: int, fontName: string, fontSize:number, fontStyle:string, context: OffscreenCanvasRenderingContext2D | null);
	public constructor(...args: unknown[])
	{
		let ctx:OffscreenCanvasRenderingContext2D;
		let tm:TextMetrics;
		let top:number;
		let left:number;
		let width:number;
		let height:number;
		switch (args.length) 
        {
			case 5: 
			{
				if (args[1] instanceof Point2D) {
					const [text, position, font, justification, angle] = args as [string, Point2D, Font, string, number];
					let osc: OffscreenCanvas = new OffscreenCanvas(10, 10);
					ctx = osc.getContext("2d");
					ctx.font = font.toString();
					this._font = font.toString();
					this._fontName = font.getName();
					this._fontSize = font.getSize();
					this._fontStyle = font.getTypeString();
					this._text = text;
					tm = ctx.measureText(text);
					top = position.y - (tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent) / 2;
					left = position.x;
					this._location = new Point2D(position.x, position.y);
					this.justification = justification
					this.angle = angle
					this.alignmentBaseline = "middle"
				} else {
					const [text, x, y, font,context] = args as [string, number,number, any, OffscreenCanvasRenderingContext2D | null];

					if(context == null)
					{
						let osc:OffscreenCanvas = new OffscreenCanvas(10,10);
						ctx = osc.getContext("2d");				
					}
					else
					{
						ctx = context;
					}
					if(typeof font === 'string')
					{
						ctx.font = font;
						//Parse font string
						let temp:string[] = font.split(' ');
						this._fontStyle = temp[0];
						this._fontSize = parseInt(temp[1].replace("px",""));
						for(let i = 2; i < temp.length; i++)
						{
							if(i===2)
								this._fontName = temp[i];
							else
								this._fontName += " " + temp[i];
						}
					}
					else if(font instanceof Font)
					{
						ctx.font = font.toString();
						this._fontName = font.getName();
						this._fontSize = font.getSize();
						this._fontStyle = font.getTypeString();
					}
					
					this._text = text;
					tm = ctx.measureText(text);
					top = y - tm.fontBoundingBoxAscent;
					left = x;
					this._location = new Point2D(x, y);
				}
				break;
			}
			case 7: 
			{
                const [text, x, y, fontName, fontSize, fontStyle, context] = args as [string, number, number, string, number, string, OffscreenCanvasRenderingContext2D | null];
                if (arguments.length === 7)
				{
					
					if(context == null)
					{
						let osc:OffscreenCanvas = new OffscreenCanvas(10,10);
						ctx = osc.getContext("2d");
						this._font = fontStyle + " " + fontSize + "px " + fontName;
						ctx.font = this._font
					}
					else
					{
						ctx = context;
					}
					this._fontStyle = fontStyle;
					this._fontSize = fontSize;
					this._fontName = fontName;
					tm = ctx.measureText(text);
					top = y - tm.fontBoundingBoxAscent;
					left = x;
					this._location = new Point2D(x, y);
				}
				break;
			}
		}

		width = tm.width;
		width = tm.actualBoundingBoxRight + tm.actualBoundingBoxLeft;
		height = tm.fontBoundingBoxDescent + tm.fontBoundingBoxAscent;

		if (this.justification == "middle")
			left -= width / 2;					
		else if (this.justification == "end")
			left -= width;

		this._bounds = new Rectangle2D(left, top, width, height);

		RectUtilities.grow(this._bounds,1);

		if (this.angle != 0)
			this._bounds = SVGTextInfo.getRotatedRectangleBounds(this._bounds, this.getLocation(), this.angle, this.justification);

		this._descent = tm.fontBoundingBoxDescent;//this._bounds.getHeight() + this._bounds.getY();
		this._aboveBaseHeight = tm.fontBoundingBoxAscent;//this._bounds.getY() * -1;
	}

	public setLocation(x: int, y: int): void {

		this._bounds.setRect(x, y - this._aboveBaseHeight, this._bounds.getWidth(), this._bounds.getHeight());
		RectUtilities.grow(this._bounds,1);
		this._location.setLocation(x, y);
	}

	public getLocation(): Point2D {
		return this._location;
	}

	public shift(x: int, y: int): void {
		ShapeUtilities.offset(this._bounds, x, y);
		ShapeUtilities.offset(this._location, x, y);
	}

	public getText(): string {
		return this._text;
	}

	/**
	 * includes the descent
	 * @returns 
	 */
	public getTextBounds(): Rectangle2D {
		return this._bounds;
	}


	public getTextOutlineBounds(): Rectangle2D {
		let RS: RendererSettings = RendererSettings.getInstance();
		let outlineOffset: int = RS.getTextOutlineWidth();
		let bounds: Rectangle2D = this._bounds.clone() as Rectangle2D;

		if (outlineOffset > 0) {
			if (RS.getTextBackgroundMethod() === RendererSettings.TextBackgroundMethod_OUTLINE) {

				ShapeUtilities.grow(bounds, outlineOffset / 2);
			}

			else {

				ShapeUtilities.grow(bounds, outlineOffset);
			}

		}

		return bounds;
	}

	public getDescent(): double {
		return this._descent;
	}

	/**
	 * 
	 * @param textColor hex color string
	 * @param outlineColor hex color string or null if no outline
	 * @param outlineWidth number value for outline width
	 * @param justification "start", "middle", or "end"
	 * @param svgFormat 0 - untouched, 1 - replace speacial characters with escape codes, 2 use encodeURIComponent (expensive)
	 * @returns 
	 */
	public toSVGElement(textColor:string, outlineColor:string | null, outlineWidth:number=0, justification: string=this.justification, svgFormat:number=0):string
    {
		let fill:string = textColor;
		let stroke:string | null = outlineColor;
		let strokeWidth:number = outlineWidth;
        var format = 0;
        if(svgFormat)
        {
            format = svgFormat;
        }

		let x:number = this._location.getX();
		let y:number = this._location.getY();

		var se: string;
		if (this.angle == 0)
        	se = '<text x="' + x + '" y="' + y + '"';
		else 
			se += '<text transform="translate(' + x + ',' + y + ') rotate(' + this.angle + ')"'
        se += ' font-family="' + this._fontName + '"';
        se += ' font-size="' + this._fontSize + 'px"';
        se += ' font-weight="' + this._fontStyle + '"';
		se += ' alignment-baseline="' + this.alignmentBaseline +'"';
        se += ' stroke-miterlimit="3"';  
        se += ' text-anchor="' + justification + '"';
        
        /*if(this._angle)
        {
            se += ' transform="rotate(' + this._angle + ' ' + this._location.getX() + ' ' + this._location.getY() + ')"';
        }//*/

        var seStroke = null, 
            seFill = null;        
            
        var text = this._text;
        //catch special characters that break SVGs as base64 dataURIs
        if(format === 1)
        {
            //got codes from: http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php
            //and https://unicodelookup.com (use HTML code)
            text = text.replace(/\&/g,"&amp;");
            text = text.replace(/\</g,"&lt;");
            text = text.replace(/\</g,"&gt;");
            //text = text.replace(/\u2022/g,"&#x2022;");//echelon and ellipses dot
            //text = text.replace(/\u25CF/g,"&#x2022;");//echelon and ellipses dot (black circle)
            text = text.replace(/\u2022|\u25CF/g,"&#x2022;");//echelon and ellipses dot (black circle)
            text = text.replace(/\u00D8/g,"&#216;");//Ø
            text = text.replace(/\u00B0/g,"&#176;");//°
            text = text.replace(/\u00B1/g,"&#x00B1;");//"RD" reinforce/reduced ±
        }
        else if(format === 2)
        {
            text = encodeURIComponent(text);
            /*text = text.replace(/\&/g,"%24");
            text = text.replace(/\</g,"%3C");
            text = text.replace(/\</g,"%3E");
            text = text.replace(/\u2022|\u25CF/g,"%95");//echelon and ellipses dot (black circle)
            text = text.replace(/\u00B1/g,"%C2%B1");//"RD" reinforce/reduced +- symbol//*/
        }
        
        if(stroke != null && strokeWidth > 0)
        {
            if(format === 2)
                seStroke = se + ' stroke="' + stroke.replace(/#/g,"%23") + '"';
            else
                seStroke = se + ' stroke="' + stroke + '"';
            /*else
                seStroke = se + ' stroke="' + stroke.replace(/#/g,"&#35;") + '"';*/
                
            if(strokeWidth)
                seStroke += ' stroke-width="' + (strokeWidth + 2) + '"';
            seStroke += ' fill="none"';
            seStroke += '>';
            seStroke += text;
            seStroke += '</text>';
        }
            
        if(fill != null)
        {
            if(format === 2)
                seFill = se + ' fill="' + fill.replace(/#/g,"%23") + '"';
            else
                seFill = se + ' fill="' + fill + '"';
            /*else
                seFill = se + ' fill="' + fill.replace(/#/g,"%23") + '"';*/
            seFill += '>';
            seFill += text;
            seFill += '</text>';
        }
        
        if(stroke && fill)
            se = seStroke + seFill;
        else if(fill)
            se = seFill;
        else
            se = "";
        return se;
    }

	/**
	 * @param {Rectangle2D} rectangle
	 * @returns {Rectangle2D}
	 */
	static getRotatedRectangleBounds(rectangle: Rectangle2D, pivotPt: Point2D, angle: number, justification: string="middle"): Rectangle2D {
		const textWidth = rectangle.getWidth()

		if (justification == "start")
			rectangle.x -= textWidth / 2;
		else if (justification == "end")
			rectangle.x += textWidth / 2;

		let ptTL = new Point2D(rectangle.getMinX(), rectangle.getMinY())
		let ptTR = new Point2D(rectangle.getMaxX(), rectangle.getMinY())
		let ptBL = new Point2D(rectangle.getMinX(), rectangle.getMaxY())
		let ptBR = new Point2D(rectangle.getMaxX(), rectangle.getMaxY())

		SVGTextInfo.rotatePoint(ptTL, pivotPt, angle)
		SVGTextInfo.rotatePoint(ptTR, pivotPt, angle)
		SVGTextInfo.rotatePoint(ptBL, pivotPt, angle)
		SVGTextInfo.rotatePoint(ptBR, pivotPt, angle)

		rectangle = new Rectangle2D(ptTL.x, ptTL.y, 0, 0)
		rectangle.add(ptTR.x, ptTR.y)
		rectangle.add(ptBL.x, ptBL.y)
		rectangle.add(ptBR.x, ptBR.y)

		if (justification == "start") {
			const s = Math.sin(angle * 2 * Math.PI / 360);
			const c = Math.cos(angle * 2 * Math.PI / 360);
			rectangle.x += textWidth / 2 * c;
			rectangle.y += textWidth / 2 * s;
		} else if (justification == "end") {
			const s = Math.sin(angle * 2 * Math.PI / 360);
			const c = Math.cos(angle * 2 * Math.PI / 360);
			rectangle.x -= textWidth / 2 * c;
			rectangle.y -= textWidth / 2 * s;
		}

		return rectangle;
	}

	/**
	 * @param {Point2D} pt Point to rotate
	 * @param {Point2D} pivotPt Point to rotate around
	 * @param {number} angle angle in degrees
	 */
	static rotatePoint(pt: Point2D, pivotPt: Point2D, angle: number): void {
		const s = Math.sin(- angle * 2 * Math.PI / 360);
		const c = Math.cos(- angle * 2 * Math.PI / 360);

		pt.x -= pivotPt.x;
		pt.y -= pivotPt.y;

		let xnew = pt.x * c - pt.y * s;
		let ynew = pt.x * s + pt.y * c;

		pt.x = xnew + pivotPt.x;
		pt.y = ynew + pivotPt.y;
	}
}
