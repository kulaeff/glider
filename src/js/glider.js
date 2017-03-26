(function() {
    'use strict';

    /**
     * Extend object helper function
     * @function
     *
     * @param {object} target
     * @param {object} source
     *
     * @returns {object} target extended with source
     */
    function extend(target, source) {
        for (var key in source) {
            if (typeof target[key] === 'undefined' || target[key] === null) {
                target[key] = source[key];
            } else if (typeof target[key] === 'object') {
                for (var key_ in source[key]) {
                    if (typeof target[key][key_] === 'undefined') {
                        target[key][key_] = source[key][key_];
                    }
                }
            }
        }

        return target;
    }

    /**
     * Constructor
     * @constructor
     *
     * @param {string} selector
     * @param {object} options
     */
    var Glider = function(selector, options) {
        var defaults = {
            animation: '',
            pagination: null,
            paginationClickable: true
        };

        var g = this;

        // Extend default options
        g.options = extend(defaults, options);

        // Prepare DOM elements
        g.element = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;

        if (g.element.length === 0) return;
        if (g.element.length > 1) {
            var gliders = [];

            g.element.forEach(function() {
                var glider = this;

                gliders.push(new Glider(this, params));
            });

            return gliders;
        }

        // Save instance in HTML element and in data
        g.element = g.element[0];
        g.element.glider = g;
        g.element.dataset.glider = g;

        // Slides
        g.slides = g.element.querySelectorAll('.glider-item');

        // Pagination
        if (g.options.pagination && typeof g.options.pagination === 'string') {
            g.pagination = g.element.querySelector(g.options.pagination);

            if (g.pagination) {
                if (g.options.paginationClickable) {
                    g.pagination.classList.add('glider-bullets-clickable');
                }

                for (var i = 0; i < g.slides.length; i++) {
                    var span = document.createElement('span');

                    span.className = 'glider-bullet';

                    g.pagination.appendChild(span);
                }
            }
        }

    };

    window.Glider = Glider;
})();