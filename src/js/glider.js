/**
 * Transify 1.0.0
 * The fucking awesome slider
 * Made with Web Animations API
 *
 * http://
 *
 * Copyright 2017, Timur Kulaev
 *
 * Licensed under MIT
 *
 * Released on: March 10, 2017
 */
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
                    if (typeof target[key][key_] === 'undefined' || target[key][key_] === null) {
                        target[key][key_] = source[key][key_];
                    }
                }
            }
        }

        return target;
    }

    /**
     * Returns an array of animations
     *
     * @param {HTMLElement} slide
     * @param {number} columns
     * @param {number} rows
     *
     * @returns {HTMLElement[]} array of animations
     */
    function slice(slide, columns, rows) {
        var
            elements = [],
            rect = slide.getBoundingClientRect(),
            elementWidth = rect.width / columns,
            elementHeight = rect.height / rows;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < columns; c++) {
                var element = document.createElement('div');

                element.classList.add('glider-item-element');
                element.style.backgroundImage = slide.style.backgroundImage;
                element.style.backgroundPositionX = -c * elementWidth + 'px';
                element.style.backgroundPositionY = -r * elementHeight + 'px';
                element.style.top = r * elementHeight;
                element.style.width = elementWidth + 'px';
                element.style.height = elementHeight + 'px';

                elements.push(element);
            }
        }

        return elements;
    }

    function applyTransition(element, count, row, column, duration) {
        var
            calculatedDuration = duration * 0.75,
            calculatedDelay = duration - calculatedDuration,
            index = row * column + row;

        console.log(index);

        return element.animate([
            {
                offset: 0,
                transform: 'rotate3d(0, 0, 0, 0)'
            },
            {
                offset: 1,
                transform: 'rotate3d(0, 1, 0, 180deg) perspective(300px)'
            }
        ], {
            delay: (column * row) * calculatedDelay / count,
            duration: calculatedDuration,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }

    /**
     *
     * @param {HTMLElement[]} parts
     * @param {object} transition
     * @returns {HTMLElement[]}
     */
    function prepare(parts, transition) {
        for (var i = 0; i < transition.length; i++) {
            var player = parts[i].animate([
                {
                    offset: 0,
                    transform: 'rotate3d(0, 0, 0, 0)'
                },
                {
                    offset: 1,
                    transform: transition[i].transform,
                }
            ], {
                delay: transition[i].delay,
                duration: transition[i].duration,
                easing: 'ease-out',
                fill: 'forwards'
            });
            //player.pause();
        }

        return parts;
    }

    function makeTransition(count, name, duration) {
        switch (name) {
            case 'flip.right.forward.staggered':
                return makeFlipRightForwardStaggeredTransition(count, duration);
        }
    }

    function makeFlipRightForwardStaggeredTransition(count, duration) {
        var
            transition = [],
            calculatedDuration = duration * 0.75,
            calculatedDelay = duration - calculatedDuration;

        for (var i = 0; i < count; i++) {
            transition.push({
                transform: 'rotate3d(0, 1, 0, 180deg) perspective(333px)',
                delay: i * calculatedDelay / count,
                duration: calculatedDuration
            });
        }

        return transition;
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
            autoPlay: false,
            columns: 18,
            duration: 800,
            initialSlide: 0,
            navigation: {
                next: null,
                prev: null
            },
            pagination: null,
            paginationClickable: true,
            perspective: true,
            rows: 6,
            transition: 'flip.right.forward.staggered'
        };

        var g = this;

        // Set default options and params
        g.options = extend(defaults, options);
        g.bullets = [];
        g.navigation = {};
        g.slides = [];

        // Set current slide
        g.currentSlide = g.options.initialSlide;

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

        g.slides[g.currentSlide].classList.add('glider-item-active');

        // Slice up the slides according to specified transition
        for (var i = 0; i < g.slides.length - 1; i++) {
            var
                slide = g.slides[i],
                elements = slice(slide, g.options.columns, g.options.rows),
                players = [];

            for (var r = 0; r < g.options.rows; r++) {
                for (var c = 0; c < g.options.columns; c++) {
                    players.push(applyTransition(elements[i], elements.length, r, c, g.options.duration));
                }
            }
            //
            /*if (typeof g.options.transition === 'string') {
                var transition = makeTransition(elements.length, g.options.transition, g.options.duration);

                elements = prepare(elements, transition);
            }*/

            // Append parts to the HTML
            elements.forEach(function(element) {
                slide.appendChild(element);
            });

            slide.style.backgroundImage = '';
        }

        // Pagination
        if (g.options.pagination && typeof g.options.pagination === 'string') {
            g.pagination = g.element.querySelector(g.options.pagination);

            if (g.pagination) {
                if (g.options.paginationClickable) {
                    g.pagination.classList.add('glider-bullets-clickable');
                }

                for (var i = 0; i < g.slides.length; i++) {
                    var bullet = document.createElement('button');

                    bullet.className = 'glider-bullet';

                    g.pagination.appendChild(bullet);
                    g.bullets.push(bullet);
                }

                g.bullets[g.currentSlide].classList.add('glider-bullet-active');
            }
        }

        // Navigation
        if (g.options.navigation.next && g.options.navigation.prev && typeof g.options.navigation.next === 'string' && typeof g.options.navigation.prev === 'string') {
            g.navigation.next = g.element.querySelector(g.options.navigation.next);
            g.navigation.prev = g.element.querySelector(g.options.navigation.prev);
        }

        // Event handlers
        if (g.navigation.next && g.navigation.prev) {
            g.navigation.next.addEventListener('click', function() {

            });
        }
    };

    window.Glider = Glider;
})();