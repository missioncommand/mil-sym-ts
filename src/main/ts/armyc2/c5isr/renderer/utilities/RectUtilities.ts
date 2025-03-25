import { type int, type double } from "../../graphics2d/BasicTypes";

import { Rectangle } from "../../graphics2d/Rectangle"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { Rectangle as Rect } from "../shapes/rectangle";

export class RectUtilities {

	public static makeRectangleFromRect(x1: int, y1: int, x2: int, y2: int): Rectangle {
		return new Rectangle(x1, y1, x2 - x1, y2 - y1);
	}

	public static makeRectangle2DFromRect(x1: double, y1: double, x2: double, y2: double): Rectangle2D {
		return new Rectangle2D(x1, y1, x2 - x1, y2 - y1);
	}



	/**
	 * Copies a Rectangle
	 * @param rect {@link Rectangle2D}
	 * @return {@link Rectangle2D}
	 */
	public static copyRect(rect: Rectangle2D): Rectangle2D {
		return new Rectangle2D(rect.getX() as int, rect.getY() as int, (rect.getWidth() + 0.5) as int, (rect.getHeight() + 0.5) as int);
	}

	/**
	 * copies and rounds the points.  x,y round down &amp; width,height round up
	 * @param rect {@link Rectangle2D}
	 * @return {@link Rectangle2D}
	 */
	public static roundRect(rect: Rectangle2D): Rectangle2D {
		let offsetX: double = rect.getX() - (rect.getX()) as int;
		let offsetY: double = rect.getY() - (rect.getY()) as int;

		return new Rectangle2D(rect.getX() as int, rect.getY() as int, (Math.round(rect.getWidth() + offsetX + 0.5)) as int, Math.round(rect.getHeight() + offsetY + 0.5) as int);
	}

	public static grow(rect: Rectangle2D, size: int): void {
		rect.setRect(rect.getX() - size, rect.getY() - size, rect.getWidth() + (size * 2), rect.getHeight() + (size * 2));
		//return new Rectangle2D(rect.left - size, rect.top - size, rect.right + size, rect.bottom + size);
	}


	public static shift(rect: Rectangle2D, x: int, y: int): void {
		rect.setRect(rect.getX() + x, rect.getY() + y, rect.getWidth(), rect.getHeight());
	}


	public static shiftBR(rect: Rectangle2D, x: int, y: int): void {
		rect.setRect(rect.getX(), rect.getY(), rect.getWidth() + x, rect.getHeight() + y);
	}

	public static toRectangle(b: Rectangle2D): Rectangle;

	public static toRectangle(x: double, y: double, w: double, h: double): Rectangle;
	public static toRectangle(...args: unknown[]): Rectangle | null {
		switch (args.length) {
			case 1: {
				const [b] = args as [Rectangle2D];


				if (b == null) {
					return null;
				}/*from w ww . j a  va 2s . c o  m*/
				if (b instanceof Rectangle) {
					return b as Rectangle;
				} else {
					return new Rectangle(b.getX() as int, b.getY() as int,
						b.getWidth() as int, b.getHeight() as int);
				}
				
			}

			case 4: {
				const [x, y, w, h] = args as [double, double, double, double];

				return new Rectangle(x as int, y as int,w as int, h as int);
			}

			default: {
				throw Error(`Invalid number of arguments`);
			}
		}
	}

	public static toRectangle2D(b: Rectangle): Rectangle2D;
	public static toRectangle2D(x: double, y: double, w: double, h: double): Rectangle2D;
	public static toRectangle2D(...args: unknown[]): Rectangle2D | null {
		switch (args.length) {
			case 1: {
				const [b] = args as [Rectangle];


				if (b == null) {
					return null;
				}/*from w ww . j a  va 2s . c o  m*/
				else 
				{
					return new Rectangle2D(b.getX(), b.getY(),b.getWidth(), b.getHeight());
				}
				
			}

			case 4: {
				const [x, y, w, h] = args as [double, double, double, double];

				return new Rectangle2D(x as int, y as int,w as int, h as int);
			}

			default: {
				throw Error(`Invalid number of arguments`);
			}
		}
	}

}