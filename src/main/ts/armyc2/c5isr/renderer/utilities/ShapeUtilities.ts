import { type int } from "../../graphics2d/BasicTypes";
import { AffineTransform } from "../../graphics2d/AffineTransform"
import { Point } from "../../graphics2d/Point"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"

import { Path } from "../shapes/path";

/**
 *
 *
 */
export class ShapeUtilities {

	public static grow(rect: Rectangle2D, size: int): void 
	{
		rect.setRect(rect.getX() - size, rect.getY() - size, rect.getWidth() + (size * 2), rect.getHeight() + (size * 2));
	}

	public static offset(rect: Rectangle2D, offsetX: number, offsetY: number): void;

	public static offset(point: Point2D, offsetX: number, offsetY: number): void;
	public static offset(point: Point, offsetX: number, offsetY: number): void;

	public static offset(path: Path2D, offsetX: number, offsetY: number): void;
	public static offset(...args: unknown[]): void {

		if(args.length === 3)
		{
			if(args[0] instanceof Rectangle2D)
			{
				const [rect, offsetX, offsetY] = args as [Rectangle2D, number, number];
				rect.setRect(rect.getX() + offsetX, rect.getY() + offsetY, rect.getWidth(), rect.getHeight());
			}
			else if(args[0] instanceof Point2D)
			{
				const [point, offsetX, offsetY] = args as [Point2D, number, number];
				point.setLocation(point.getX() + offsetX, point.getY() + offsetY);
			}
			else if(args[0] instanceof Point)
			{
				const [point, offsetX, offsetY] = args as [Point, number, number];
				point.setLocation(point.getX() + offsetX, point.getY() + offsetY);
			}
			else if(args[0] instanceof Path)
			{
				console.log("ShapeUtilities.offset - Can't offset Path");
			}
			else if(args[0] instanceof Path2D)
			{
				console.log("ShapeUtilities.offset - Can't offset Path2D");
			}
		}
	}
}
