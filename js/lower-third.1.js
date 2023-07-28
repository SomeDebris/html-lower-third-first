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
        const title = graphic.querySelector('h1');
        const subtitle = graphic.querySelector('p');

        title.textContent = data[activeStep].title;
        subtitle.textContent = data[activeStep].subtitle;
    }

    function applyStyle() {
        const container = document.querySelector('.lt-style-one');
        const graphic = continer.querySelector('.graphic');
        const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
        const title = graphic.querySelector('h1');
        const subtitle = graphic.querySelector('.subtitle');

        pathLeft.style.stroke = style.primaryColor;
        pathRight.style.stroke = style.primaryColor;
        title.style.color = style.textColor;
        subtitle.style.color = style.textColor;
        subtitle.style.backgroundColor = style.primaryColor;

        switch(style.position) {
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
            if(!Object.keys(parsed).length)
                throw new Error('Empty objects are invalid');
            if(!parsed.style) {
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

        if(state === 0) {
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

    function play() { }
    function next() { }
    function stop() { }
    function remove() { }

    function handleError(e) {console.error(e)}
    function handleWarning(w) {console.log(w)}

    return { }

})();
