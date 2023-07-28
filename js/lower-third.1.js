'use strict';

// lower-third.1.js

const _graphic = (function() {

// Variables and function defined here will not
// be available in the global scope
    let state = 0;
    let activeStep = 0;
    let currentStep = 0;
    let data = [];
    let style;

    (function() {
        window['update'] = (raw) => update(raw);
        window['play'] = play;
        window['next'] = next;
        window['stop'] = stop;
        window['remove'] = remove;
    })();

    function applyData() {
        const graphic = document.querySelector('.lt-style-one .graphic');
        const title =    graphic.querySelector('h1');
        const subtitle = graphic.querySelector('p');

        title.textContent =     data[activeStep].title;
        subtitle.textContent =  data[activeStep].subtitle;
    }

    function applyStyle() {
        const container =    document.querySelector('.lt-style-one');
        const graphic =     container.querySelector('.graphic');
        const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
        const title =         graphic.querySelector('h1');
        const subtitle =      graphic.querySelector('.subtitle');

        pathLeft.style.stroke =          style.primaryColor;
        pathRight.style.stroke =         style.primaryColor;
        title.style.color =              style.textColor;
        subtitle.style.color =           style.textColor;
        subtitle.style.backgroundColor = style.primaryColor;

        switch (style.position) {
            case 'left':
                container.style.marginRight = 'auto';
                break;
            case 'center':
                container.style.margin = '4vh auto';
                break;
            default:
                container.style.marginLeft = 'auto';
                break;
        }
    }

    function update(raw) { 
        let parsed;

        try {
            parsed = JSON.parse(raw);
            if (!Object.keys(parsed).length)
                throw new Error('Empty objects are invalid');
            if (!parsed.style) {
                if(!parsed.data)
                    throw new Error('Invalid data object');
            }
        } catch(e) {
            handleError(e);
            return;
        }
        Array.isArray(parsed.data)
            ? data = data.concat(parsed.data)
            : data.push(parsed.data);
        style = parsed.style;

        if (state === 0) {
            try {
                applyData();
                applyStyle();
                state = 1;
            } catch (error) {
                handleError(error);
                return;
            }
        }
    }

    /// NOT MINE
    // Gets the CSS values used by the browser
    // @param {DOM Node} elem - The element whos styles you want
    // @param {string | string[]} styles - The CSS properties needed
    // @returns {any[]} An array of strings and/or numbers
    function getComputedStyle(elem, styles) {
        // Get the element's computed styles
        const computedStyles = window.getComputedStyle(elem);
        // Create an array to hold the requested results
        const values = [];
        if (Array.isArray(styles)) {
            // Loop over each style requested and all the value to the result
            styles.forEach(s => 
                values.push(computedStyles.getPropertyValue(s)));
        } else {
            values.push(computedStyles.getPropertyValue(styles));
        }
        return values.map(v => {
            // Clean up pixel values
            if(v.includes('px')) v = Number(v.substring(0, v.length - 2));
            return v;
        });
    }
    
    function animateIn() {
        const graphic =                document.querySelector('.lt-style-one .graphic');
        const [pathLeft, pathRight] =   graphic.querySelectorAll('svg path');
        const title =                   graphic.querySelector('h1');
        const subtitleControl =         graphic.querySelector('.subtitle');
        const subtitle =        subtitleControl.querySelector('p');

        const graphicWidth = getComputedStyle(graphic, 'width')[0];
        const pathWidth
    }

    function animateOut() {}

    function play() {
        // state 1 = graphic is LOADED, remember that line from the update
        // function?
        if (state === 1) {
            animateIn();
            state = 2;
        }
    }

    function next() { }
    function stop() { }
    function remove() { }

    function handleError(e) {console.error(e)}
    function handleWarning(w) {console.log(w)}

    return { }

})();
