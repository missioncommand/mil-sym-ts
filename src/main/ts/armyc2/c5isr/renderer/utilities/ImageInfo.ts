import { type int, type double } from "../../graphics2d/BasicTypes";

import { BufferedImage } from "../../graphics2d/BufferedImage"
import { Point } from "../../graphics2d/Point"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger"
import { RectUtilities } from "../../renderer/utilities/RectUtilities"
import { SymbolDimensionInfo } from "../../renderer/utilities/SymbolDimensionInfo"


/**
 * Object that holds an image of the symbol and all the information
 * needed to place the symbol on the screen.
 *
 */
export class ImageInfo implements SymbolDimensionInfo {

	public static readonly FormatPNG: string = "png";
	public static readonly FormatJPG: string = "jpg";

	private _Image: ImageBitmap;
	private _X: int = 0;
	private _Y: int = 0;
	private _symbolCenterX: int = 0;
	private _symbolCenterY: int = 0;
	protected _symbolBounds: Rectangle2D;


	/**
	 *
	 */
	public constructor();

	/**
	 * ImageInfo holds and image and holds the position at which the image
	 * should be drawn.  Use for Multipoint and single point graphics.
	 * @param image {@link BufferedImage}
	 * @param x position of where the image should be drawn
	 * @param y position of where the image should be drawn
	 */
	public constructor(image: ImageBitmap, x: int, y: int);

	/**
	 * Creates a new ImageInfo object
	 * @param bi {@link BufferedImage}
	 * @param centerPoint can also be the anchor point of the symbol if it isn't the center of the image (action point)
	 * @param symbolBounds {@link Rectangle2D}
	 */
	public constructor(bi: ImageBitmap, centerPoint: Point2D, symbolBounds: Rectangle2D);

	/**
	 * ImageInfo holds and image and holds the position at which the image
	 * should be drawn.  Use this if the image is a single point graphic.
	 * @param image {@link BufferedImage}
	 * @param x position of where the image should be drawn
	 * @param y position of where the image should be drawn
	 * @param symbolCenterX center point of image may be different from the center
	 * point of the symbol within the image. (single point graphics)
	 * @param symbolCenterY center point of image may be different from the center
	 * point of the symbol within the image.  (single point graphics)
	 * @deprecated
	 */
	public constructor(image: ImageBitmap, x: int, y: int, symbolCenterX: int, symbolCenterY: int);

	/**
	 *
	 * ImageInfo holds and image and holds the position at which the image
	 * should be drawn.  Use this if the image is a single point graphic.
	 * @param image {@link BufferedImage}
	 * @param x position of where the image should be drawn
	 * @param y position of where the image should be drawn
	 * @param symbolCenterX center point of image may be different center
	 * point of the symbol within the image. (single point graphics)
	 * @param symbolCenterY center point of image may be different center
	 * point of the symbol within the image.  (single point graphics)
	 * @param symbolBounds minimum bounding rectangle for the core symbol. Does
	 * not include modifiers, display or otherwise.
	 */
	public constructor(image: ImageBitmap, x: int, y: int, symbolCenterX: int, symbolCenterY: int, symbolBounds: Rectangle2D);
	public constructor(...args: unknown[]) {
		switch (args.length) {
			case 0: {
				break;
			}

			case 3: 
			{
				if(typeof args[1] === 'number')
				{
					const [image, x, y] = args as [ImageBitmap, int, int];
					this._Image = image;
					this._X = x;
					this._Y = y;
					this._symbolCenterX = image.width / 2;
					this._symbolCenterY = image.height / 2;
				}
				else if(args[1] instanceof Point2D)
				{
					const [bi, centerPoint, symbolBounds] = args as [ImageBitmap, Point2D, Rectangle2D];

					this._Image = bi;
					this._symbolCenterX = centerPoint.getX() as int;
					this._symbolCenterY = centerPoint.getY() as int;
					this._symbolBounds = symbolBounds;
				}
				break;
			}

			case 5: {
				const [image, x, y, symbolCenterX, symbolCenterY] = args as [ImageBitmap, int, int, int, int];

				this._Image = image;
				this._X = x;
				this._Y = y;
				this._symbolCenterX = symbolCenterX;
				this._symbolCenterY = symbolCenterY;

				break;
			}

			case 6: {
				const [image, x, y, symbolCenterX, symbolCenterY, symbolBounds] = args as [ImageBitmap, int, int, int, int, Rectangle2D];

				this._Image = image;
				this._X = x;
				this._Y = y;
				this._symbolCenterX = symbolCenterX;
				this._symbolCenterY = symbolCenterY;
				this._symbolBounds = symbolBounds;

				break;
			}

			default: {
				throw Error(`Invalid number of arguments`);
			}
		}
	}


	/**
	 * The BufferedImage
	 * @return the actual image
	 */
	public getImage(): ImageBitmap {
		return this._Image;
	}

	/**
	 * X position of where the image should be drawn
	 * @return {@link Integer}
	 */
	public getX(): int {
		return this._X;
	}


	/**
	 * Y position of where the image should be drawn
	 * @return {@link Integer}
	 */
	public getY(): int {
		return this._Y;
	}

	/**
	 * position of where the image should be drawn
	 * @return {@link Point}
	 */
	public getPoint(): Point {
		return new Point(this._X, this._Y);
	}

	/**
	 * The x value the image should be centered on or the "anchor point".
	 * @return {@link Integer}
	 */
	public getSymbolCenterX(): int {
		return this._symbolCenterX;
	}

	/**
	 * The y value the image should be centered on or the "anchor point".
	 * @return {@link Integer}
	 */
	public getSymbolCenterY(): int {
		return this._symbolCenterY;
	}

	/**
	 * The point the image should be centered on or the "anchor point".
	 * @return {@link Point}
	 */
	public getSymbolCenterPoint(): Point2D {
		return new Point2D(this._symbolCenterX, this._symbolCenterY);
	}

	/**
	 * minimum bounding rectangle for the core symbol. Does
	 * not include modifiers, display or otherwise.
	 * @return {@link Rectangle2D}
	 */
	public getSymbolBounds(): Rectangle2D {
		return this._symbolBounds;
	}

	/**
	 * Dimension of the entire image.
	 * @return {@link Rectangle2D}
	 */

	public getImageBounds(): Rectangle2D {
		return new Rectangle2D(0, 0, this._Image.width, this._Image.height);
	}

	/**
	 * Takes an image and a center point and generates a new, bigger image
	 * that has the symbol centered in it
	 * @param image {@link BufferedImage}
	 * @param point {@link Point2D}
	 * @return {@link BufferedImage}
	 */
	public static CenterImageOnPoint(image: ImageBitmap, point: Point2D): ImageBitmap {
		let bi:ImageBitmap;
		let osc: OffscreenCanvas;
		let x: int = 0;
		let y: int = 0;
		let height: int = 0;
		let width: int = 0;
		height = image.height;
		width = image.width;

		try {
			if (point.getY() > height - point.getY()) {
				height = (point.getY() * 2.0) as int;
				y = 0;
			}
			else {
				height = ((height - point.getY()) * 2) as int;
				y = ((height / 2) - point.getY()) as int;
			}

			if (point.getX() > width - point.getX()) {
				width = (point.getX() * 2.0) as int;
				x = 0;
			}
			else {
				width = ((width - point.getX()) * 2) as int;
				x = ((width / 2) - point.getX()) as int;
			}


			osc = new OffscreenCanvas(width, height);
			let ctx:OffscreenCanvasRenderingContext2D = osc.getContext("2d");
			ctx.drawImage(image,x,y);
			bi = osc.transferToImageBitmap();
		} catch (exc) {
			if (exc instanceof Error) {
				ErrorLogger.LogException("ImageInfo", "CenterImageOnPoint", exc);
			} else {
				throw exc;
			}
		}
		return bi;
	}


	/**
	 * Adds padding as needed to make the image a nice square.
	 * @return {@link ImageInfo}
	 */
	public getSquareImageInfo(): ImageInfo {
		let ii: ImageInfo;
		let iwidth: int = 0;
		let iheight: int = 0;
		let x: int = 0;
		let y: int = 0;
		let width: int = this._Image.width;
		let height: int = this._Image.height;

		if (width > height) {
			iwidth = width;
			iheight = width;
			x = 0;
			y = (iheight - height) / 2;
		}
		else {
			if (width < height) {
				iwidth = height;
				iheight = height;
				x = (iwidth - width) / 2;
				y = 0;
			}
			else {
				iwidth = width;
				iheight = height;
				x = 0;
				y = 0;
			}
		}


		//Draw glyphs to bitmap
		let bmp: OffscreenCanvas = new OffscreenCanvas(iwidth, iheight);

		let g2d: OffscreenCanvasRenderingContext2D = bmp.getContext("2d");

		g2d.drawImage(this._Image, x, y);


		//create new ImageInfo
		let center: Point2D = new Point2D(this._symbolCenterX, this._symbolCenterY);
		center.setLocation(this._symbolCenterX + x, this._symbolCenterY + y);
		let symbolBounds: Rectangle2D = RectUtilities.copyRect(this._symbolBounds);
		RectUtilities.shift(this._symbolBounds, x, y);

		ii = new ImageInfo(bmp.transferToImageBitmap(), center, symbolBounds);


		return ii;
	}

}
