/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { Shape } from "../graphics2d/Shape"



//import android.graphics.drawable.shapes.Shape;
/**
 *
 *
 */
export interface Stroke {
      createStrokedShape(s: Shape): Shape;
}
