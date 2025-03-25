/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import { type int, type double } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point2D } from "../graphics2d/Point2D"

import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"




/**
 *
 *
 */
export interface Shape {
      contains(x: int, y: int): boolean;
      contains(x: int, y: int, width: int, height: int): boolean;
      contains(pt: Point2D): boolean;
      getBounds2D(): Rectangle2D;
      getBounds(): Rectangle;
      intersects(x: double, y: double, w: double, h: double): boolean;
      intersects(rect: Rectangle2D): boolean;
      getPathIterator(at: AffineTransform | null): PathIterator;
}
