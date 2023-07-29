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
    const animationQueue = [];
    const animationThreshold = 3;

    (function() {
        window['update'] = (raw) => update(raw);
        window['play'] = play;
        window['next'] = next;
        window['stop'] = stop;
        window['remove'] = remove;
    })();

    function executePlayOutCommand() {
        // Run the first promise
        animationQueue[0]().then(() => {
            // MAGNUS: this removes an item from the queue?
            animationQueue.splice(0, 1);

            if (animationQueue.length) executePlayOutCommand();
        }).catch(e => handleError(e));
    }

    function addPlayOutCommand(prom) {
        if (animationQueue.length < animationThreshold)
            animationQueue.push(prom);
        // warn user about threshold
        if (animationQueue.length === animationThreshold)
            handleWarning('animationThreshold met');
        // if there is only one command, run it!
        if (animationQueue.length === 1) executePlayOutCommand();
    }

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
        return new Promise((resolve, reject) => {
            const graphic =                document.querySelector('.lt-style-one .graphic');
            const [pathLeft, pathRight] =   graphic.querySelectorAll('svg path');
            const title =                   graphic.querySelector('h1');
            const subtitleControl =         graphic.querySelector('.subtitle');
            const subtitle =        subtitleControl.querySelector('p');

            const graphicWidth = getComputedStyle(graphic, 'width')[0];
            const pathWidth    = graphicWidth * 2;

            // TODO Understand this
            // ANIMATION!!
            const animationTimeline = new gsap.timeline({
                duration: 0.5,
                ease: 'power1.out',
                onComplete: resolve
            });

            animationTimeline.set([pathLeft, pathRight], {
                    strokeDashoffset: pathWidth,
                    strokeDasharray: pathWidth
                }).set(title, {y: '15vh'})
                .set(subtitleControl, {y: '10vh'})
                .set(subtitle, {y: '20vh'})
                .set(graphic, {opacity: 1})
                .to([pathLeft, pathRight], {
                    strokeDashoffset: 0,
                    duration: 1
                }).to(title, {y: 0}, '-=1')
                .to(subtitleControl, {y: 0}, '-=.9')
                .to(subtitle, {y: 0}, '-=1');
        });
    }

    function animateOut() { 
        return new Promise((resolve, reject) => {
            const graphic = document.querySelector('.lt-style-one .graphic');
            const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
            const title = graphic.querySelector('h1');
            const subtitleControl = graphic.querySelector('.subtitle');
            const subtitle = subtitleControl.querySelector('p');
            const titleWidth = getComputedStyle(graphic, 'width');
            const pathLength = titleWidth * 2;
            
            const animationTimeline = new gsap.timeline({
                duration: 0.5, 
                ease: 'power1.in',
                onComplete: resolve
            });

            animationTimeline.to(title, {y: '15vh'})
                .to(subtitleControl, {y: '10vh'}, '-=.75')
                .to(subtitle, {y: '20vh'}, '-=.55')
                .to([pathLeft, pathRight], {
                    strokeDashoffset: pathLength,
                    ease: 'power1.inOut',
                    duration: 1
                }, '-=1')
                .to(graphic, {opacity: 0}, '-=.25');
        });
    }

    function play() {
        // state 1 = graphic is LOADED, remember that line from the update
        // function?
        if (state === 1) {
            animateIn();
            state = 2;
        }
    }

    function next() {
        if (state === 1) {
            play();
        } else if (state === 2) {
            if (data.length > currentStep + 1) {
                // This means that there is another title to show!
                currentStep++;
                const animation = () => animateOut().then(() => {
                    activeStep++;
                    applyData();
                    return;
                }).then(animateIn);
                addPlayOutCommand(animation);
            } else {
                handleError('Graphic is out of titles to display');
            }
        } else {
            handleError('Graphic cannot be advanced while in state ' + state);
        }
    }

    function stop() {
        // state 2 = graphic is PLAYED.
        // setting state back to 1 also!
        if (state === 2) {
            animateOut();
            state = 1;
        }
    }

    function reset() {
        if (currentStep === 0) {
            handleError('The Graphic is already on the first item');
            return;
        }
        let animation;
        if (state === 1) {
            currentStep = 0;
            animation = () => new Promise((resolve, reject) => {
                activeStep = 0;
                applyData();
                resolve();
            }).then(next);
        } else {
            handleError('cannot reset a graphic that has not been loaded.');
            return;
        }
        addPlayOutCommand(animation);
    }

    async function remove() {
        if (state === 2) 
            await animateOut();
    }

    function handleError(e) {console.error(e)}
    function handleWarning(w) {console.log(w)}

    return { }

})();
