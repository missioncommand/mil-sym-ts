import { type double, type int } from "../../graphics2d/BasicTypes";

import { Font } from "../../graphics2d/Font"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { RendererSettings } from "../../renderer/utilities/RendererSettings"
import { ShapeUtilities } from "../../renderer/utilities/ShapeUtilities";
import { RectUtilities } from "./RectUtilities";

/**
 *
 *
 */
export class TextInfo {
	protected _text: string = "";
	protected _location: Point2D;
	protected _bounds: Rectangle2D;
	protected _descent: double = 0;
	protected _aboveBaseHeight: double = 0;
	
	public constructor(text: string, x: int, y: int, font: Font | string, context: OffscreenCanvasRenderingContext2D | null)
	{
		let ctx:OffscreenCanvasRenderingContext2D;
		let tm:TextMetrics;
		let top:number;
		let left:number;
		let width:number;
		let height:number;
		let bounds:Rectangle2D;



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
			ctx.font = font;
		else
			ctx.font = font.toString();

		this._text = text;
		tm = ctx.measureText(text);
		top = y - tm.fontBoundingBoxAscent;
		left = x;
		this._location = new Point2D(x, y);

		width = tm.width;
		width = tm.actualBoundingBoxRight + tm.actualBoundingBoxLeft;
		height = tm.fontBoundingBoxDescent + tm.fontBoundingBoxAscent;
		bounds = new Rectangle2D(top, left, width, height);

		RectUtilities.grow(bounds,1);

		this._bounds = bounds;
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

	public strokeText = function(context:OffscreenCanvasRenderingContext2D){
        context.strokeText(this.text,this.location.getX(),this.location.getY());
    };
    public fillText = function(context:OffscreenCanvasRenderingContext2D){
        context.fillText(this.text,this.location.getX(),this.location.getY());
    };
}
