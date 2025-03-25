import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"

export interface SymbolDimensionInfo {
  /**
   * The x value the image should be centered on or the "anchor point".
   * @return {@link Integer}
   */
  getSymbolCenterX(): number;

  /**
   * The y value the image should be centered on or the "anchor point".
   * @return {@link Integer}
   */
  getSymbolCenterY(): number;

  /**
   * The point the image should be centered on or the "anchor point".
   * @return {@link Point2D}
   */
  getSymbolCenterPoint(): Point2D;

  /**
   * minimum bounding rectangle for the core symbol. Does
   * not include modifiers, display or otherwise.
   * @return {@link Rectangle2D}
   */
  getSymbolBounds(): Rectangle2D;

  /**
   * Dimension of the entire image.
   * @return {@link Rectangle2D}
   */

  getImageBounds(): Rectangle2D;
}
