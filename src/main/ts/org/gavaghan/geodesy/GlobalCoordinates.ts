/* 
 *  Geodesy by Mike Gavaghan
 * 
 *      http://www.gavaghan.org/blog/free-source-code/geodesy-library-vincentys-formula/
 * 
 *  Copyright 2007 Mike Gavaghan - mike@gavaghan.org
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

export class GlobalCoordinates {
    private mLatitude: number = 0;
    private mLongitude: number = 0;

    constructor(latitude: number, longitude: number) {
        this.mLatitude = latitude;
        this.mLongitude = longitude;
        this.canonicalize();
    }

    private canonicalize(): void {
        this.mLatitude = (this.mLatitude + 180) % 360;
        if (this.mLatitude < 0)
            this.mLatitude += 360;
        this.mLatitude -= 180;
        if (this.mLatitude > 90) {
            this.mLatitude = 180 - this.mLatitude;
            this.mLongitude += 180;
        } else if (this.mLatitude < -90) {
            this.mLatitude = -180 - this.mLatitude;
            this.mLongitude += 180;
        }
        this.mLongitude = ((this.mLongitude + 180) % 360);
        if (this.mLongitude <= 0)
            this.mLongitude += 360;
        this.mLongitude -= 180;
    }

    public getLatitude(): number {
        return this.mLatitude;
    }

    public setLatitude(latitude: number): void {
        this.mLatitude = latitude;
        this.canonicalize();
    }

    public getLongitude(): number {
        return this.mLongitude;
    }

    public setLongitude(longitude): void {
        this.mLongitude = longitude;
        this.canonicalize();
    }

    public compareTo(other: GlobalCoordinates): number {
        var retval;
        if (this.mLongitude < other.mLongitude)
            retval = -1;
        else if (this.mLongitude > other.mLongitude)
            retval = 1;
        else if (this.mLatitude < other.mLatitude)
            retval = -1;
        else if (this.mLatitude > other.mLatitude)
            retval = 1;
        else
            retval = 0;
        return retval;
    }

    public hashCode(): number {
        return (Math.round((this.mLongitude * this.mLatitude * 1000000 + 1021))) * 1000033;
    }

    public equals(obj: any): boolean {
        if (!(obj instanceof GlobalCoordinates))
            return false;
        var other: GlobalCoordinates = obj;
        return (this.mLongitude === other.mLongitude) && (this.mLatitude === other.mLatitude);
    }

    public toString(): string {
        var buffer = "";
        buffer += (Math.abs(this.mLatitude));
        buffer += (((this.mLatitude >= 0) ? 'N' : 'S')).charCodeAt(0);
        buffer += ((';')).charCodeAt(0);
        buffer += (Math.abs(this.mLongitude));
        buffer += (((this.mLongitude >= 0) ? 'E' : 'W')).charCodeAt(0);
        buffer += ((';')).charCodeAt(0);
        return buffer;
    }
}