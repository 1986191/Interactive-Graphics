// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// rotationX and rotationY are already in correct format, no need to convert to degrees or radians

	// Rotation around X axis
	var rotX = [
		1, 0, 							0, 						0,
		0, Math.cos(rotationX), 		Math.sin(rotationX),	0,
		0, Math.sin(rotationX) * -1, 	Math.cos(rotationX), 	0,
		0, 0, 							0, 						1
	];

	// Rotation around Y axis
	var rotY = [
		Math.cos(rotationY), 	0, Math.sin(rotationY) * -1, 	0,
		0, 						1, 0, 							0,
		Math.sin(rotationY), 	0, Math.cos(rotationY), 		0,
		0, 						0, 0, 							1
	];

	// Total rotation
	var rotXY = MatrixMult(rotX, rotY);

	// Transform position matrix
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// Calculate the resultin projected transform matrix, don't invert order
	var mvp = MatrixMult( projectionMatrix, MatrixMult(trans, rotXY) );
	return mvp;
}

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() 
	{
		this.prog = InitShaderProgram(meshVS, meshFS);
	
		// Get attribute/uniform locations
		this.vertPosLoc 		= gl.getAttribLocation(this.prog, "aPosition");
		this.texCoordLoc 		= gl.getAttribLocation(this.prog, "aTexCoord");
		this.mvpLoc 			= gl.getUniformLocation(this.prog, "uModelViewProjection");
		this.swapYZLoc 			= gl.getUniformLocation(this.prog, "uSwapYZ");
		this.useTextureLoc 		= gl.getUniformLocation(this.prog, "uUseTexture");
	
		// Buffers
		this.vertBuffer 		= gl.createBuffer();
		this.texCoordBuffer 	= gl.createBuffer();
	
		// Texture
		this.texture 			= gl.createTexture();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords) 
	{
		this.numTriangles = vertPos.length / 3;
	
		// Vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
	
		// Texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) 
	{
		gl.useProgram(this.prog);
		gl.uniform1i(this.swapYZLoc, swap ? 1 : 0);
	}	
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) 
	{
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.mvpLoc, false, trans);											// Apply transform
	
		// Vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		// Texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	
		// Bind texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	
		// Draw call
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}
	
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) 
	{
		gl.useProgram(this.prog);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

		// Set tiling - teapot was mapping the UV outside the 0-1 range -> checked in blender3d
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		// Set mipmap
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		// Add the texture
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); 				// You can set the texture image data using the following command.
		gl.generateMipmap(gl.TEXTURE_2D);

		// Enable the texture
		gl.uniform1i(this.useTextureLoc, 1);													// Enable texture visualization inside shader
	}
	
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) 
	{
		gl.useProgram(this.prog);
		gl.uniform1i(this.useTextureLoc, show ? 1 : 0); 										// Enable/disable inside the shader
	}
	
}
// Vertex Shader
const meshVS = `
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewProjection;
uniform bool uSwapYZ;

varying vec2 vTexCoord;

void main() {
    vec3 pos = aPosition;
    
    // If swapYZ is true, swap Y and Z components
    if (uSwapYZ) {
        pos = vec3(pos.x, pos.z, pos.y);
    }

    gl_Position = uModelViewProjection * vec4(pos, 1.0);
    vTexCoord = aTexCoord;
}
`;

// Fragment Shader
const meshFS = `
precision mediump float;

uniform bool uUseTexture;
uniform sampler2D uTexture;

varying vec2 vTexCoord;

void main() {
    if (uUseTexture) {
        gl_FragColor = texture2D(uTexture, vTexCoord);
    } else {
        gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
    }
}
`;
