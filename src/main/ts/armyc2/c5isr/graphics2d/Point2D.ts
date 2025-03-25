/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { type double } from "./BasicTypes";

import { POINT2 } from "../JavaLineArray/POINT2"

/**
 * The <code>Point2D</code> class defines a point representing a location in
 * 
 * <p>
 * This class is only the abstract superclass for all objects that store a 2D
 * coordinate. The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author Jim Graham
 * @since 1.2
 */
export class Point2D {
    /**
     * The X coordinate of this <code>Point2D</code>.
     *
     * @since 1.2
     */
    public x: double = 0;
    /**
     * The Y coordinate of this <code>Point2D</code>.
     *
     * @since 1.2
     */
    public y: double = 0;

    /**
     * Constructs and initializes a <code>Point2D</code> with coordinates
     * (0,&nbsp;0).
     *
     * @since 1.2
     */
    public constructor();
    /**
     * add the constructor
     * @param pt 
     */
    public constructor(pt: POINT2);

    /**
     * Constructs and initializes a <code>Point2D</code> with the specified
     * coordinates.
     *
     * @param x
     * the X coordinate of the newly constructed
     * <code>Point2D</code>
     * @param y
     * the Y coordinate of the newly constructed
     * <code>Point2D</code>
     * @since 1.2
     */
    public constructor(x: double, y: double);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {

                break;
            }

            case 1: {
                const [pt] = args as [POINT2];

                this.x = pt.x;
                this.y = pt.y;

                break;
            }

            case 2: {
                const [x, y] = args as [double, double];

                this.x = x;
                this.y = y;

                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getX(): double {
        return this.x;
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getY(): double {
        return this.y;
    }

    /**
     * Returns a <code>String</code> that represents the value of this
     * <code>Point2D</code>.
     *
     * @return a string representation of this <code>Point2D</code>.
     * @since 1.2
     */
    public toString(): string {
        return "Point2D[" + this.x + ", " + this.y + "]";
    }

    public clone(): Point2D
    {
        return new Point2D(this.getX(),this.getY());
    }

    /*
     * JDK 1.6 serialVersionUID
     */
    private static readonly serialVersionUID: number = 0;//long = 6150783262733311327n;

    /**
     * Sets the location of this <code>Point2D</code> to the same coordinates as
     * the specified <code>Point2D</code> object.
     *
     * @param p
     * the specified <code>Point2D</code> to which to set this
     * <code>Point2D</code>
     * @since 1.2
     */
    public setLocation(p: Point2D): void;

    /**
     * Sets the location of this <code>Point2D</code> to the specified
     * <code>double</code> coordinates.
     *
     * @param x
     * the new X coordinate of this {Point2D}
     * @param y
     * the new Y coordinate of this {Point2D}
     * @since 1.2
     */
    public setLocation(x: double, y: double): void;
    public setLocation(...args: unknown[]): void {
        switch (args.length) {
            case 1: {
                const [p] = args as [Point2D];


                this.setLocation(p.getX(), p.getY());


                break;
            }

            case 2: {
                const [x, y] = args as [double, double];
                this.x = x;
                this.y = y;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Returns the square of the distance between two points.
     *
     * @param x1
     * the X coordinate of the first specified point
     * @param y1
     * the Y coordinate of the first specified point
     * @param x2
     * the X coordinate of the second specified point
     * @param y2
     * the Y coordinate of the second specified point
     * @return the square of the distance between the two sets of specified
     * coordinates.
     * @since 1.2
     */
    public static distanceSq(x1: double, y1: double, x2: double, y2: double): double {
        x1 -= x2;
        y1 -= y2;
        return (x1 * x1 + y1 * y1);
    }

    /**
     * Returns the distance between two points.
     *
     * @param x1
     * the X coordinate of the first specified point
     * @param y1
     * the Y coordinate of the first specified point
     * @param x2
     * the X coordinate of the second specified point
     * @param y2
     * the Y coordinate of the second specified point
     * @return the distance between the two sets of specified coordinates.
     * @since 1.2
     */
    public static distance(x1: double, y1: double, x2: double, y2: double): double {
        x1 -= x2;
        y1 -= y2;
        return Math.sqrt(x1 * x1 + y1 * y1);
    }

    /**
     * Returns the distance from this <code>Point2D</code> to
     * a specified point.
     *
     * @param px the X coordinate of the specified point to be measured
     *           against this <code>Point2D</code>
     * @param py the Y coordinate of the specified point to be measured
     *           against this <code>Point2D</code>
     * @return the distance between this <code>Point2D</code>
     * and a specified point.
     * @since 1.2
     */
    public distance(px: double,  py: double) {
        px -= this.getX();
        py -= this.getY();
        return Math.sqrt(px * px + py * py);
    }

    /**
     * Determines whether or not two points are equal. Two instances of
     * <code>Point2D</code> are equal if the values of their <code>x</code> and
     * <code>y</code> member fields, representing their position in the
     * coordinate space, are the same.
     *
     * @param obj
     * an object to be compared with this <code>Point2D</code>
     * @return <code>true</code> if the object to be compared is an instance of
     * <code>Point2D</code> and has the same values; <code>false</code>
     * otherwise.
     * @since 1.2
     */
    public equals(obj: Point2D): boolean {
        if (obj instanceof Point2D) {
            let p2d: Point2D = obj as Point2D;
            return (this.getX() === p2d.getX()) && (this.getY() === p2d.getY());
        }
        return false;
    }
}
