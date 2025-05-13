// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
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

	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var mv = MatrixMult(trans, rotXY);
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

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

		// Normals/lighting attributes
		this.normalMatrixLoc  = gl.getUniformLocation(this.prog, "uNormalMatrix");
		this.lightDirLoc      = gl.getUniformLocation(this.prog, "uLightDirection");
		this.shininessLoc     = gl.getUniformLocation(this.prog, "uShininess");
	
		// Buffers
		this.vertBuffer 		= gl.createBuffer();
		this.texCoordBuffer 	= gl.createBuffer();
		this.normalBuffer     	= gl.createBuffer();
	
		// Texture
		this.texture 			= gl.createTexture();

		// [TO-DO] initializations
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		this.numTriangles = vertPos.length / 3;
	
		// Vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
	
		// Texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// Normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		// [TO-DO] Update the contents of the vertex buffer objects.
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		gl.useProgram(this.prog);
		gl.uniform1i(this.swapYZLoc, swap ? 1 : 0);
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.mvpLoc, false, matrixMVP);											// Apply transform
	
		// Vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);
	
		// Normals
		const normalLoc = gl.getAttribLocation(this.prog, "aNormal");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.enableVertexAttribArray(normalLoc);
		gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
	
		// Normal matrix
		gl.uniformMatrix3fv(this.normalMatrixLoc, false, matrixNormal);

		// Texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	
		// Bind texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// Draw call
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);

		// [TO-DO] Complete the WebGL initializations before drawing
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
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
		gl.uniform1i(this.useTextureLoc, 1);	

		// [TO-DO] Bind the texture

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		gl.useProgram(this.prog);
		gl.uniform1i(this.useTextureLoc, show ? 1 : 0);

		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		gl.useProgram(this.prog);
		gl.uniform3f(this.lightDirLoc, x, y, z);

		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininessLoc, shininess);

		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
	}
}


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var forces = Array(positions.length); // The total force per particle
	for (var i = 0; i < forces.length; i++) 
	{
		forces[i] = new Vec3(0, 0, 0);
	}

	// Init
	const count = positions.length;
	const floor = new Vec3(-1.0, -1.0, -1.0); 			// Lower bound - box like bounds
	const ceiling = new Vec3(1.0, 1.0, 1.0);			// Upper bound 

	// Compute forces from springs and damping
	for (let i = 0; i < springs.length; i++) 
	{
		const { p0, p1, rest } = springs[i];
		const x0 = positions[p0], x1 = positions[p1];
		const v0 = velocities[p0], v1 = velocities[p1];

		const deltaX = x1.sub(x0);
		const length = deltaX.len();
		if (length === 0) continue;

		const springDir = deltaX.div(length);

		// Spring force
		const springForce = springDir.mul(stiffness * (length - rest));
		forces[p0] = forces[p0].add(springForce);
		forces[p1] = forces[p1].sub(springForce);

		// Damping force
		const deltaV = v1.sub(v0);
		const dampingForce = springDir.mul(damping * deltaV.dot(springDir));
		forces[p0] = forces[p0].add(dampingForce);
		forces[p1] = forces[p1].sub(dampingForce);
	}

	// Update velocities and positions
	for (let i = 0; i < count; i++) 
	{
		const acceleration = forces[i].div(particleMass).add(gravity); 			// Gravity acceleration
		velocities[i] = velocities[i].add(acceleration.mul(dt)); 				// Update vel
		positions[i] = positions[i].add(velocities[i].mul(dt)); 				// Compute new pos
	}

	// Collision detection and response
	for (let i = 0; i < count; i++) 
	{
		const pos = positions[i];
		const vel = velocities[i];

		// Box bounds check using floor and ceiling
		["x", "y", "z"].forEach(axis => 
			{
				if (pos[axis] < floor[axis]) 
				{
					const h = floor[axis] - pos[axis];
					pos[axis] = floor[axis] + h * restitution;
					vel[axis] *= -restitution;
				}
				else if (pos[axis] > ceiling[axis]) 
				{
					const h = pos[axis] - ceiling[axis];
					pos[axis] = ceiling[axis] - h * restitution;
					vel[axis] *= -restitution;
				}
			}
		);
	}
}

// Vertex Shader
const meshVS = `
precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat3 uNormalMatrix;
uniform mat4 uModelViewProjection;
uniform bool uSwapYZ;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
    vec3 pos = aPosition;
	vec3 normal = aNormal;
    
    // If swapYZ is true, swap Y and Z components
    if (uSwapYZ) {
        pos = vec3(pos.x, pos.z, pos.y);
		normal = vec3(normal.x, normal.z, normal.y);
    }
		
    gl_Position = uModelViewProjection * vec4(pos, 1.0);
    vTexCoord = aTexCoord;
	vNormal = normalize(uNormalMatrix * normal);
}
`;

// Fragment Shader
const meshFS = `
precision mediump float;

uniform bool uUseTexture;
uniform sampler2D uTexture;
uniform vec3 uLightDirection;
uniform float uShininess;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDirection);
    vec3 V = vec3(0.0, 0.0, 1.0); 							// view direction for shininess - changing it gives weird results???
    vec3 R = reflect(L, N);

    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(R, V), 0.0), uShininess);

    vec3 baseColor = vec3(1.0, 1.0, 1.0);

    if (uUseTexture) {
        baseColor = texture2D(uTexture, vTexCoord).rgb;
    }

    vec3 finalColor = baseColor * diff + vec3(spec);
    gl_FragColor = vec4(finalColor, 1.0);
}
`;
