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

export class Ellipsoid {
    private readonly mSemiMajorAxis;
    private readonly mSemiMinorAxis;
    private readonly mFlattening;
    private readonly mInverseFlattening;

    constructor(semiMajor: number, semiMinor: number, flattening: number, inverseFlattening: number) {
        this.mSemiMajorAxis = semiMajor;
        this.mSemiMinorAxis = semiMinor;
        this.mFlattening = flattening;
        this.mInverseFlattening = inverseFlattening
    }

    public getSemiMajorAxis(): number {
        return this.mSemiMajorAxis;
    }
    
    public getSemiMinorAxis(): number {
        return this.mSemiMinorAxis;
    }

    public getFlattening(): number {
        return this.mFlattening;
    }

    public getInverseFlattening(): number {
        return this.mInverseFlattening;
    }


    public static fromAAndInverseF(semiMajor: number, inverseFlattening: number): Ellipsoid {
        var f = 1.0 / inverseFlattening;
        var b = (1.0 - f) * semiMajor;
        return new Ellipsoid(semiMajor, b, f, inverseFlattening);
    }
    
    public static fromAAndF(semiMajor: number, flattening: number): Ellipsoid {
        var inverseF = 1.0 / flattening;
        var b = (1.0 - flattening) * semiMajor;
        return new Ellipsoid(semiMajor, b, flattening, inverseF);
    }

    public static readonly WGS84 = Ellipsoid.fromAAndInverseF(6378137.0, 298.257223563);
    public static readonly GRS80 = Ellipsoid.fromAAndInverseF(6378137.0, 298.257222101);
    public static readonly GRS67 = Ellipsoid.fromAAndInverseF(6378160.0, 298.25);
    public static readonly ANS = Ellipsoid.fromAAndInverseF(6378160.0, 298.25);
    public static readonly WGS72 = Ellipsoid.fromAAndInverseF(6378135.0, 298.26);
    public static readonly Clarke1858 = Ellipsoid.fromAAndInverseF(6378293.645, 294.26);
    public static readonly Clarke1880 = Ellipsoid.fromAAndInverseF(6378249.145, 293.465);
    public static readonly Sphere = Ellipsoid.fromAAndF(6371000, 0.0);
}