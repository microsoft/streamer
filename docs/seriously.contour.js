/* global define, require */
(function (root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['seriously'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		factory(require('seriously'));
	} else {
		if (!root.Seriously) {
			root.Seriously = { plugin: function (name, opt) { this[name] = opt; } };
		}
		factory(root.Seriously);
	}
}(window, function (Seriously) {
	'use strict';

	Seriously.plugin('contour', {
		initialize: function (initialize) {
			initialize();

			this.uniforms.pixelWidth = 1 / this.width;
			this.uniforms.pixelHeight = 1 / this.height;
		},
		shader: function (inputs, shaderSource) {
			shaderSource.fragment = [
				'precision mediump float;',

				'varying vec2 vTexCoord;',

				'uniform sampler2D source;',
				'uniform vec4 color;',
				'uniform float pixelWidth;',
				'uniform float pixelHeight;',

				'void main(void) {',
				// this effect assumes the image has been through a chrome-key kind of effect
				// and looks for the boundary of transparent pixels
                // fetch the neightborhood and paint white if it is not full white or transparent
				'   int transparents = 0;',
				'   const int n = 16;',
				'	float fi = 0.0, fj = 0.0;',
				'	for (int i = 0; i < n; i++) {',
				'		fj = 0.0;',
                '		for (int j = 0; j < n; j++) {',
                '           vec4 pix = texture2D(source, vTexCoord + vec2((fi - 1.0) * pixelWidth, (fj - 1.0) * pixelHeight)).rgba;',
                '           if (pix.a == 0.) transparents += 1;',
				'			fj += 1.0;',
				'		};',
				'		fi += 1.0;',
                '	};',
                
				// skip if no transparent pixesl
				'   const int error = 2;',				
                '   if (transparents < error * error || transparents > n * n - error) {',
                '       gl_FragColor = texture2D(source, vTexCoord).rgba;',
                '   } else {',
                '       gl_FragColor = color;',
                '   }',
				'}'
			].join('\n');

			return shaderSource;
		},
		resize: function () {
			this.uniforms.pixelWidth = 1 / this.width;
			this.uniforms.pixelHeight = 1 / this.height;
		},
		inputs: {
			source: {
				type: 'image',
				uniform: 'source'
			},
			color: {
				type: 'color',
				uniform: 'color',
				defaultValue: [1, 1, 1, 1]
			}			
		},
		description: 'Transparency contour',
		title: 'Transparency contour'
	});
}));