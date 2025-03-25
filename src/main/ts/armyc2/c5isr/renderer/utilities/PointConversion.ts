import { type int, type double } from "../../graphics2d/BasicTypes";

import { Point } from "../../graphics2d/Point"
import { Point2D } from "../../graphics2d/Point2D"
import { IPointConversion } from "../../renderer/utilities/IPointConversion"

/**
 *
 *
 */
export class PointConversion implements IPointConversion {
    protected _pixelWidth: int = 0;
    protected _PixelHeight: int = 0;
    protected _geoTop: double = 0;
    protected _geoLeft: double = 0;
    protected _geoBottom: double = 0;
    protected _geoRight: double = 0;
    protected _normalize: boolean = true;
    //pixels to geo
    //double _geoMultiplierX = 0;
    //double _geoMultiplierY = 0;
    //geo to pixels
    protected _pixelMultiplierX: double = 0;
    protected _pixelMultiplierY: double = 0;
    public set_normalize(value: boolean): void {
        this._normalize = value;
    }

    public constructor(pixelWidth: int, pixelHeight: int,
        geoTop: double, geoLeft: double,
        geoBottom: double, geoRight: double) {/*
            _pixelWidth = pixelWidth;
            _PixelHeight = pixelHeight;
            _geoTop = geoTop;
            _geoLeft = geoLeft;
            _geoBottom = geoBottom;
            _geoRight = geoRight;*/

        this.UpdateExtents(pixelWidth, pixelHeight, geoTop, geoLeft, geoBottom, geoRight);
    }

    public UpdateExtents(pixelWidth: int, pixelHeight: int,
        geoTop: double, geoLeft: double,
        geoBottom: double, geoRight: double): void {
        this._pixelWidth = pixelWidth;
        this._PixelHeight = pixelHeight;
        this._geoTop = geoTop;
        this._geoLeft = geoLeft;
        this._geoBottom = geoBottom;
        this._geoRight = geoRight;

        //_geoMultiplierX = ((double)_pixelWidth) / (_geoRight - _geoLeft) ;
        //_geoMultiplierY = ((double)_PixelHeight) / (_geoTop - _geoBottom) ;

        this._pixelMultiplierX = (this._geoRight - this._geoLeft) / (this._pixelWidth as double);
        this._pixelMultiplierY = (this._geoTop - this._geoBottom) / (this._PixelHeight as double);

        //diagnostic 12-18-12
        if (this._geoRight - this._geoLeft < -180) {
            this._pixelMultiplierX = (this._geoRight - this._geoLeft + 360) / (this._pixelWidth as double);
        }
        if (this._geoRight - this._geoLeft > 180) {
            this._pixelMultiplierX = (360 - (this._geoRight - this._geoLeft)) / (this._pixelWidth as double);
        }
        //end section
        if (this._geoTop < this._geoBottom) {

            this._pixelMultiplierY = -Math.abs(this._pixelMultiplierY);
        }

        else {

            this._pixelMultiplierY = Math.abs(this._pixelMultiplierY);
        }


        //            if(_geoRight < _geoLeft)
        //                _pixelMultiplierX = -Math.abs(_pixelMultiplierX);
        //            else
        //                _pixelMultiplierX = Math.abs(_pixelMultiplierX);
        //end section
    }

    public PixelsToGeo(pixel: Point): Point;

    public PixelsToGeo(pixel: Point2D): Point2D;
    public PixelsToGeo(...args: unknown[]): Point | Point2D {
        const [pixel] = args as [Point | Point2D];

        let coords: Point | Point2D
        if (pixel instanceof Point)
            coords = new Point()
        else
            coords = new Point2D();

        coords.x = pixel.getX() * this._pixelMultiplierX + this._geoLeft; //xMultiplier;
        coords.y = this._geoTop - (pixel.getY() * this._pixelMultiplierY);

        //diagnostic 12-18-12
        if (coords.x < -180) {

            coords.x += 360;
        }

        if (coords.x > 180) {

            coords.x -= 360;
        }

        //end section

        return coords;
    }


    public GeoToPixels(coord: Point): Point;

    public GeoToPixels(coord: Point2D): Point2D;
    public GeoToPixels(...args: unknown[]): Point | Point2D {
        const [coord] = args as [Point | Point2D];

        let pixel: Point | Point2D;
        if (coord instanceof Point)
            pixel = new Point();
        else
            pixel = new Point2D();
        //double xMultiplier = _pixelMultiplierX;//(_geoRight - _geoLeft) / ((double)_pixelWidth) ;
        //double yMultiplier = _pixelMultiplierY;//(_geoTop - _geoBottom) / ((double)_PixelHeight) ;
        let temp: double = 0;
        //temp = ((coord.getX()  - _geoLeft) / _pixelMultiplierX);//xMultiplier);
        let calcValue: double = coord.getX() - this._geoLeft;
        if (this._normalize) {
            if (calcValue < -180) {

                calcValue += 360;
            }

            else if (calcValue > 180) {

                calcValue -= 360;
            }
        }
        temp = (calcValue / this._pixelMultiplierX);

        pixel.x = temp;

        temp = ((this._geoTop - coord.getY()) / this._pixelMultiplierY);//yMultiplier);
        pixel.y = temp;

        return pixel;
    }


    public getPixelWidth(): int {
        return this._pixelWidth;
    }

    public getPixelHeight(): int {
        return this._PixelHeight;
    }

    public getUpperLat(): double {
        return this._geoTop;
    }

    public getLowerLat(): double {
        return this._geoBottom;
    }

    public getLeftLon(): double {
        return this._geoLeft;
    }

    public getRightLon(): double {
        return this._geoRight;
    }

}
