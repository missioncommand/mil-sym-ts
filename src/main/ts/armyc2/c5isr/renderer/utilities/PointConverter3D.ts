import { type double } from "../../graphics2d/BasicTypes";

import { Point } from "../../graphics2d/Point"
import { Point2D } from "../../graphics2d/Point2D"
import { GeoPixelConversion3D } from "../../renderer/utilities/GeoPixelConversion3D"
import { IPointConversion } from "../../renderer/utilities/IPointConversion"
import { POINT2 } from "../../JavaLineArray/POINT2";


/**
 *
 *
 */
export class PointConverter3D implements IPointConversion {
    private _controlLat: double = 0;
    private _controlLong: double = 0;
    private _scale: double = 0;
    private _metersPerPixel: double = 0;
    public constructor(controlLong: double, controlLat: double, scale: double) {
        try {
            this._controlLat = controlLat;
            this._controlLong = controlLong;
            this._scale = scale;
            this._metersPerPixel = GeoPixelConversion3D.metersPerPixel(scale);
        } catch (e) {
            if (e instanceof Error) {
                throw e;
            } else {
                throw e;
            }
        }
    }
    public PixelsToGeo(pixel: Point): Point2D;

    public PixelsToGeo(pixel: Point2D): Point2D;
    public PixelsToGeo(...args: unknown[]): Point2D | Point2D {
        if (args[0] instanceof Point) {
            const [pixel] = args as [Point];


            let pt2dGeo: Point2D;
            try {
                let y: double = GeoPixelConversion3D.y2lat(pixel.getY(), this._scale, this._controlLat, this._metersPerPixel);
                let x: double = GeoPixelConversion3D.x2long(pixel.getX(), this._scale, this._controlLong, y, this._metersPerPixel);
                pt2dGeo = new Point2D(x, y);
            } catch (e) {
                if (e instanceof Error) {
                    throw e;
                } else {
                    throw e;
                }
            }
            return pt2dGeo;

        } else {
            const [pixel] = args as [Point2D];


            let pt2dGeo: Point2D;
            try {
                let y: double = GeoPixelConversion3D.y2lat(pixel.getY(), this._scale, this._controlLat, this._metersPerPixel);
                let x: double = GeoPixelConversion3D.x2long(pixel.getX(), this._scale, this._controlLong, y, this._metersPerPixel);
                pt2dGeo = new Point2D(x, y);
            } catch (e) {
                if (e instanceof Error) {
                    throw e;
                } else {
                    throw e;
                }
            }
            return pt2dGeo;

        }
    }



    public GeoToPixels(coord: Point2D): Point;

    public GeoToPixels(coord: Point2D): Point2D;
    public GeoToPixels(...args: unknown[]): Point | Point2D {

        if (args[0] instanceof Point2D) {
            const [coord] = args as [Point2D];


            let ptPixels: Point;
            try {
                let y: double = GeoPixelConversion3D.lat2y(coord.getY(), this._scale, this._controlLat, this._metersPerPixel);
                let x: double = GeoPixelConversion3D.long2x(coord.getX(), this._scale, this._controlLong, coord.getY(), this._metersPerPixel);
                ptPixels = new Point();
                ptPixels.setLocation(x, y);
            } catch (e) {
                if (e instanceof Error) {
                    throw e;
                } else {
                    throw e;
                }
            }
            return ptPixels;

        } else {

            const [coord] = args as [Point2D];


            let pt2DPixels: Point2D;
            try {
                let y: double = GeoPixelConversion3D.lat2y(coord.getY(), this._scale, this._controlLat, this._metersPerPixel);
                let x: double = GeoPixelConversion3D.long2x(coord.getX(), this._scale, this._controlLong, coord.getY(), this._metersPerPixel);
                pt2DPixels = new Point2D(x, y);
            } catch (e) {
                if (e instanceof Error) {
                    throw e;
                } else {
                    throw e;
                }
            }
            return pt2DPixels;



        }
    }

}
