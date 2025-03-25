export class PathIterator
{

    //private vars
    private arrActions:Array<Array<any>> = [];
    private size:number = 0;
    private index:number = 0;

    constructor(actions:Array<any>)
    {
        this.arrActions = actions;
        this.size = actions.length;
    }
    //constructor code
    
    
    //private functions
        
    //public vars/functions
    /**
     * Tests if the iteration is complete.
     * 
     */
    isDone(): boolean
    {
        if(this.index === this.size)
            return true;
        return false;
    };
    /**
     * Moves the iterator to the next segment of the path forwards
     * along the primary direction of traversal as long as there are
     * more points in that direction.
     */
    next()
    {
        this.index++;
    };
    /**
     * Returns the coordinates and type of the current path segment in
     * the iteration.
     * The return value is the path-segment type:
     * MOVE_TO, LINE_TO, QUAD_TO, CURVE_TO, or CLOSE.
     * A float array of length 6 must be passed in and can be used to
     * store the coordinates of the point(s).
     * Each point is stored as a pair of float x,y coordinates.
     * MOVE_TO and LINE_TO types returns one point,
     * QUAD_TO returns two points,
     * CURVE_TO returns 3 points.
     * ARC_TO
     * ARC
     * CLOSE will never get returned as it is replace with LINE_TO.
     * @return the path-segment where the first index is the segment type.
     * @see ActionTypes
     */
    currentSegment()
    {
        return this.arrActions[this.index];
    }
    
    
}