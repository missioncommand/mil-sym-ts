import { type double, type int } from "../../graphics2d/BasicTypes";

import { Font } from "../../graphics2d/Font"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { RendererSettings } from "../../renderer/utilities/RendererSettings"
import { ShapeUtilities } from "../../renderer/utilities/ShapeUtilities";
import { RectUtilities } from "./RectUtilities";

import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';

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

	private isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
	private isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
	private OSCDefined = typeof OffscreenCanvasRenderingContext2D !== 'undefined';//web workers fail isBrowser test
	private OSCanvasDefined = typeof OffscreenCanvas !== 'undefined';//web workers fail isBrowser test
	
	public constructor(text: string, x: int, y: int, font: Font | string, context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null)
	{
		let ctx:any;//OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
		let tm:TextMetrics | any;//node-canvas doesn't fully implement TextMetics so must set to any
		let top:number;
		let left:number;
		let width:number;
		let height:number;
		let bounds:Rectangle2D;

		if(context == null)
		{
			let osc:OffscreenCanvas | Canvas
			if(this.OSCDefined)
				osc = new OffscreenCanvas(10,10);
			else
				osc = createCanvas(10,10);
			
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

		if(tm.fontBoundingBoxAscent != null)
			top = y - tm.fontBoundingBoxAscent;
		else
		{
			top = y - tm.emHeightAscent;
		}

		left = x;
		this._location = new Point2D(x, y);

		width = tm.width;
		width = tm.actualBoundingBoxRight + tm.actualBoundingBoxLeft;

		if(this.OSCDefined)
		{
			height = tm.fontBoundingBoxDescent + tm.fontBoundingBoxAscent;
			this._descent = tm.fontBoundingBoxDescent;
			this._aboveBaseHeight = tm.fontBoundingBoxAscent;
		}
		else
		{
			height = tm.emHeightDescent + tm.emHeightAscent;
			this._descent = tm.emHeightDescent;
			this._aboveBaseHeight = tm.emHeightAscent;
		}
		bounds = new Rectangle2D(top, left, width, height);

		RectUtilities.grow(bounds,1);

		this._bounds = bounds;
		/*console.log(this._text);
		console.log(this._bounds);
		console.log(tm);//*/
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
