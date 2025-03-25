import { Point2D } from "../../graphics2d/Point2D";

/**
 * Interface for Point Conversion objects.  Recommend using the functions
 * that take and return Point2D objects.
 *
 */
export interface IPointConversion {

      //        public void UpdateExtents(int pixelWidth, int pixelHeight,
      //                            double geoTop, double geoLeft,
      //                            double geoBottom, double geoRight);

      //    public Point2D PixelsToGeo(Point pixel);

      //    public Point GeoToPixels(Point2D coord);

      PixelsToGeo(pixel: Point2D): Point2D;

      GeoToPixels(coord: Point2D): Point2D;

      //    public int getPixelWidth();
      //
      //    public int getPixelHeight();
      //    public double getUpperLat();
      //
      //    public double getLowerLat();
      //
      //    public double getLeftLon();
      //
      //    public double getRightLon();


}