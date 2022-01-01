//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function getRender(canvas, image) {
  var h = canvas.clientHeight;
  var w = canvas.clientWidth;
  const gl = canvas.getContext("webgl2");

  const vertexShader = `
  attribute vec4 a_position;
  uniform vec2 u_resolution;
  varying vec2 v_texcoord;
  void main() {
    gl_Position = vec4(((a_position.xy / u_resolution) * 2.0 - 1.0) * vec2(1, -1), 0, 1);

    // assuming a unit quad for position we
    // can just use that for texcoords. Flip Y though so we get the top at 0
    v_texcoord = gl_Position.xy * vec2(0.5, -0.5) + 0.5;
  }
  `;

  const fragmentShader = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D u_image;
  uniform sampler2D u_palette;

  void main() {
      float index = texture2D(u_image, v_texcoord).a * 256.0;
      gl_FragColor = texture2D(u_palette, vec2(index / 64.0, 0.5));
  }
  `;

  const program = initShaderProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);
  const imageLoc = gl.getUniformLocation(program, "u_image");
  const paletteLoc = gl.getUniformLocation(program, "u_palette");
  // tell it to use texture units 0 and 1 for the image and palette
  gl.uniform1i(imageLoc, 0);
  gl.uniform1i(paletteLoc, 1);

  // Setup a unit quad
  var positions = new Float32Array([
    0, 0,
    256, 0,
    0, 240,
    256, 0,
    0, 240,
    256, 240,
  ]);
  const vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, w, h);

  // Setup a palette.
  var palette = new Uint8Array([
    0x52, 0x52, 0x52, 0x0, 0x0, 0xb4, 0x0, 0x0, 0xa0, 0x3d, 0x0, 0xb1, 0x69, 0x0, 0x74, 0x5b, 0x0, 0x0, 0x5f, 0x0, 0x0, 0x40, 0x18, 0x0, 0x10, 0x2f, 0x0, 0x8, 0x4a, 0x8, 0x0, 0x67, 0x0, 0x0, 0x42, 0x12, 0x0, 0x28, 0x6d, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xe7, 0xd5, 0xc4, 0x0, 0x40, 0xff, 0x22, 0xe, 0xdc, 0x6b, 0x47, 0xff, 0x9f, 0x0, 0xd7, 0xd7, 0xa, 0x68, 0xbc, 0x19, 0x0, 0xb1, 0x54, 0x0, 0x5b, 0x6a, 0x0, 0x3, 0x8c, 0x0, 0x0, 0xab, 0x0, 0x0, 0x88, 0x2c, 0x0, 0x72, 0xa4, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xf8, 0xf8, 0xf8, 0x3c, 0xab, 0xff, 0x81, 0x79, 0xff, 0xc5, 0x5b, 0xff, 0xf2, 0x48, 0xff, 0xff, 0x49, 0xdf, 0xff, 0x6d, 0x47, 0xf7, 0xb4, 0x0, 0xff, 0xe0, 0x0, 0x75, 0xe3, 0x0, 0x2b, 0xf4, 0x3, 0x2e, 0xb8, 0x78, 0x18, 0xe2, 0xe5, 0x78, 0x78, 0x78, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff, 0xff, 0xff, 0xbe, 0xf2, 0xff, 0xb8, 0xb8, 0xf8, 0xd8, 0xb8, 0xf8, 0xff, 0xb6, 0xff, 0xff, 0xc3, 0xff, 0xff, 0xd1, 0xc7, 0xff, 0xda, 0x9a, 0xf8, 0xed, 0x88, 0xdd, 0xff, 0x83, 0xb8, 0xf8, 0xb8, 0xac, 0xf8, 0xf5, 0xb0, 0xff, 0xff, 0xf8, 0xd8, 0xf8, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
  ]);
  // make palette texture and upload palette
  gl.activeTexture(gl.TEXTURE1);
  var paletteTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, paletteTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, palette);

  // make image textures and upload image
  gl.activeTexture(gl.TEXTURE0);
  var imageTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, imageTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, w, h, 0, gl.ALPHA, gl.UNSIGNED_BYTE, image);

  return function () {
    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, w, h, 0, gl.ALPHA,
      gl.UNSIGNED_BYTE, image);

    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
  }
}