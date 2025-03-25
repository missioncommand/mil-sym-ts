import { Point } from "../../graphics2d/Point"
import { Point2D } from "../../graphics2d/Point2D"
import { IPointConversion } from "../../renderer/utilities/IPointConversion"

/**
 * Makes no change to the passed points.  Useful for when the points
 * are already in pixels.
 *
 */
export class PointConversionDummy implements IPointConversion {
	public constructor() {
	}

	public PixelsToGeo(pixel: Point): Point;

	public PixelsToGeo(pixel: Point2D): Point2D;
	public PixelsToGeo(...args: unknown[]): Point | Point2D {
		const [pixel] = args as [Point | Point2D];

		let coords: Point | Point2D;
		if (pixel instanceof Point)
			coords = new Point()
		else
			coords = new Point2D();
		coords.x = pixel.getX();
		coords.y = pixel.getY();

		return coords;
	}


	public GeoToPixels(coord: Point): Point;

	public GeoToPixels(coord: Point2D): Point2D;
	public GeoToPixels(...args: unknown[]): Point | Point2D {
		const [coord] = args as [Point2D];
		let pixel: Point | Point2D;
		if (coord instanceof Point)
			pixel = new Point(coord.getX(), coord.getY())
		else
			pixel = new Point2D(coord.getX(), coord.getY())

		return pixel;
	}
}
