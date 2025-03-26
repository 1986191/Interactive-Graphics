// Simple matrix multiplication function based on column-major order arrays
function matrixMul(A, B) 
{
    if (A.length != 9 || B.length != 9) return null;  // Check and validate matrix dimensions (3x3)

    // Result matrix -> zero array
    var AB = Array(9).fill(0);

    for (var i = 0; i < 3; i++)
	 {  // Loop over rows of A
        for (var j = 0; j < 3; j++) 
		{  	// Loop over columns of B
            var sum = 0; 
            for (var k = 0; k < 3; k++) 
			{  	// Loop over rows of B at column j
                var indexA = i + k * 3; 
                var indexB = k + j * 3; 
                sum += A[indexA] * B[indexB]; 
            }
            AB[i + j * 3] = sum; // Update the result matrix
        }
    }

    return AB;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	// Radians to degrees and identity
	rotation *= Math.PI / 180;
	var identity = Array( 1, 0, 0, 0, 1, 0, 0, 0, 1 ); 	// To clone at each use to avoid issues

	// Position representation
	var transformPosition = [...identity];
	transformPosition[6] = positionX;
	transformPosition[7] = positionY;

	// Rotation representation w.r.t. z axis
	var transformRotation = [...identity];
	transformRotation[0] = Math.cos(rotation);
	transformRotation[1] = Math.sin(rotation);
	transformRotation[3] = Math.sin(rotation) * -1;
	transformRotation[4] = Math.cos(rotation);

	// Scale representation
	var transformScale = [...identity];
	transformScale[0] = scale;
	transformScale[4] = scale;

	// Return Scale * Rotation * Position w.r.t. world frame -> invert multiplication order for correct representation
	return matrixMul(matrixMul(transformPosition, transformRotation), transformScale);
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	// Simply multiply matrices, again w.r.t. to world frame, so inverted order
	return matrixMul(trans2, trans1);
}
