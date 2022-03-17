const C = document.querySelector('canvas'), X = C.getContext('2d');
let MX = 0, MY = 0;
let REM = 0;

const resize = () => {
    const { width, height } = C.getBoundingClientRect();

    C.width = width;
    C.height = height;

    REM = (width + height) / 2 / 100;

}

const propagate = (node, task) => {
    node.children.forEach(child => {
        task(child);
        propagate(child, task);
    });
}

window.onresize = resize;
document.body.onmousemove = (e) => {
    MX = e.clientX;
    MY = e.clientY

    propagate(Root, (child => {
        if (!child.name) return;
        const { x, y } = alignment(child.alignment, child.x, child.y, child.scale, child.calc_parent());
        if (MX >= x && MX <= x + child.scale.get_width() && MY >= y && MY <= y + child.scale.get_height()) {
            Context.emit(child.name + '.hover', { x, y });
        }
    }))

}

document.body.onclick = (e) => {
    propagate(Root, (child => {
        if (!child.name) return;
        const { x, y } = alignment(child.alignment, child.x, child.y, child.scale, child.calc_parent());
        if (MX >= x && MX <= x + child.scale.get_width() && MY >= y && MY <= y + child.scale.get_height()) {
            Context.emit(child.name + '.click', { x, y });
        }
    }))
}

let loaded = false;
const image = document.querySelector('img');
image.onload = () => {
    loaded = true;
    image.style.display = 'none';
}

resize();
setInterval(() => {

    X.clearRect(0, 0, C.width, C.height);
    if (loaded) X.drawImage(image, 0, 0, C.width, C.height);

    Root.render_path();

}, 150);

const Colours = {
    navy: {
        '50': '#f2f7f8',
        '100': '#d9eff9',
        '200': '#aee0f1',
        '300': '#7ac3df',
        '400': '#43a0c6',
        '500': '#3281ae',
        '600': '#2a6795',
        '700': '#244e76',
        '800': '#1a3555',
        '900': '#112139',
    },
    blue: {
        '50': '#f7f9fa',
        '100': '#e8effa',
        '200': '#cfd9f5',
        '300': '#a8b6e7',
        '400': '#838ed6',
        '500': '#6a6bc7',
        '600': '#5750b1',
        '700': '#433c8d',
        '800': '#2e2964',
        '900': '#1b1a3e',
    },
    indigo: {
        '50': '#f9fafa',
        '100': '#f0eff8',
        '200': '#e0d6f2',
        '300': '#c2b0e1',
        '400': '#a986cb',
        '500': '#8f63b8',
        '600': '#76479e',
        '700': '#59357b',
        '800': '#3e2554',
        '900': '#241832',
    },
    mauve: {
        '50': '#fbfbfa',
        '100': '#f8eff1',
        '200': '#f1d2e4',
        '300': '#dfa8c6',
        '400': '#d57ba4',
        '500': '#c15886',
        '600': '#a63d67',
        '700': '#802e4c',
        '800': '#5a2033',
        '900': '#36151d',
    },
    beaver: {
        '50': '#fbfbf9',
        '100': '#f8efe9',
        '200': '#f1d5d1',
        '300': '#e0aca8',
        '400': '#d2807c',
        '500': '#bc5d59',
        '600': '#a0423f',
        '700': '#7b3230',
        '800': '#552321',
        '900': '#351614',
    },
    ochre: {
        '50': '#fbfaf6',
        '100': '#f9efd1',
        '200': '#f1d9a4',
        '300': '#deb370',
        '400': '#c78844',
        '500': '#ac6727',
        '600': '#8f4d1a',
        '700': '#6e3a16',
        '800': '#4c2811',
        '900': '#31190c',
    },
    lemon: {
        '50': '#faf9f4',
        '100': '#f7efc9',
        '200': '#eddd95',
        '300': '#d3b961',
        '400': '#b09038',
        '500': '#90711e',
        '600': '#755714',
        '700': '#5a4211',
        '800': '#3d2d0f',
        '900': '#291c0b',
    },
    olive: {
        '50': '#f9f9f4',
        '100': '#f4efd3',
        '200': '#e7dea5',
        '300': '#c8bc70',
        '400': '#9c9444',
        '500': '#7b7526',
        '600': '#635c19',
        '700': '#4d4516',
        '800': '#353012',
        '900': '#231e0d',
    },
    viridian: {
        '50': '#f4f7f5',
        '100': '#e3efee',
        '200': '#c1e2d9',
        '300': '#8dc4b2',
        '400': '#4ea287',
        '500': '#388460',
        '600': '#2f6c48',
        '700': '#285239',
        '800': '#1d382b',
        '900': '#13231f',
    },
    teal: {
        '50': '#f2f7f6',
        '100': '#daeff5',
        '200': '#afe2ea',
        '300': '#79c5cf',
        '400': '#3ea3ad',
        '500': '#2d868d',
        '600': '#276d72',
        '700': '#225359',
        '800': '#193941',
        '900': '#10232d',
    },

}

function scaled({ rem_width, rem_height, min_width, min_height }) {
    return {

        rem_width,
        rem_height,

        min_width,
        min_height,

        get_width: () => Math.max(rem_width * REM, min_width),
        get_height: () => Math.max(rem_height * REM, min_height),

    }
}

// Alignment relative to parent
function alignment(type, x, y, scale, parent = { x: C.width / 2, y: C.height / 2, width: C.width, height: C.height }) {
    switch (type) {

        case 'top-center':
            return { x: x + parent.x - (scale.get_width() / 2), y: y + parent.y - (parent.height / 2) }
        case 'top-left':
            return { x: x + parent.x - (parent.width / 2), y: y + parent.y - (parent.height / 2) }
        case 'top-right':
            return { x: x + parent.x + (parent.width / 2) - (scale.get_width()), y: y + parent.y - (parent.height / 2) }

        case 'center-center':
            return { x: x + parent.x - (scale.get_width() / 2), y: y + parent.y - (scale.get_height() / 2) }
        case 'center-left':
            return { x: x + parent.x - (parent.width / 2), y: y + parent.y - (scale.get_height() / 2) }
        case 'center-right':
            return { x: x + parent.x + (parent.width / 2) - (scale.get_width()), y: y + parent.y - (scale.get_height() / 2) }

        case 'bottom-center':
            return { x: x + parent.x - (scale.get_width() / 2), y: y + parent.y + (parent.height / 2) - (scale.get_height()) }
        case 'bottom-left':
            return { x: x + parent.x - (parent.width / 2), y: y + parent.y + (parent.height / 2) - (scale.get_height()) }
        case 'bottom-right':
            return { x: x + parent.x + (parent.width / 2) - (scale.get_width()), y: y + parent.y + (parent.height / 2) - (scale.get_height()) }

    }
}

function export_data() {
    const data = JSON.stringify({
        root: {
            children: Root.children.map(c => ({

                name: c.name,
                type: c.type,

                x: c.x,
                y: c.y,

                width: [c.scale.rem_width, c.scale.min_width],
                height: [c.scale.rem_height, c.scale.min_height],

                colour: c.colour,
                alignment: c.alignment,

            }))
        }
    }, null, 4);

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', 'screen-export.json');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    c.href = window.URL.createObjectURL(t);
    c.click();
}

function import_data(data) {
    const { root } = JSON.parse(data);

    const parse = (children, parent) => children.map(c => {

        let type;

        if (c.type === 'pane') type = Pane;
        else throw new Error('Unknown type: ' + c.type);

        const [rem_width, min_width] = c.width;
        const [rem_height, min_height] = c.height;

        const scale = scaled({ rem_width, rem_height, min_width, min_height });

        const element = new type(
            c.name,
            c.colour,
            c.x, c.y,
            scale,
            c.alignment,
            parent
        );

        element.children = parse(c.children ?? [], element);
        return element;

    })

    Root.children = parse(root.children, Root);

}

const Context = {
    handlers: {},

    on(type, handler) {
        this.handlers[type] = (this.handlers[type] ?? []).concat(handler);
    },

    emit(type, data) {
        const global = type.split('.')[0];
        // console.log(`[>>] ${global === type ? 'Normal' : 'Global'} : ${type} || ${data}`);
        if (global !== type) (this.handlers[global] ?? []).forEach(h => h(data));
        (this.handlers[type] ?? []).forEach(h => h(data));
    }
}

class Renderable {
    constructor(parent) {
        this.parent = parent;
        this.children = [];
    }

    render_path() {
        if (this !== Root) this.draw();
        this.children.forEach(child => child.render_path());
    }

    add_child(pane) {
        pane.parent = this;
        this.children.push(pane);
        return pane;
    }

    draw() { console.warn('Raw Renderable Call!') };
    drawHud() { this.draw() };
}

class Pane extends Renderable {
    constructor(name, colour, x, y, scale, alignment, parent) {
        super('pane', name, parent);
        this.type = 'pane';

        this.x = x;
        this.y = y;

        this.name = name;
        this.colour = colour;
        this.scale = scale;
        this.alignment = alignment;

        Context.on(this.name + '.colour', (colour) => this.colour = colour);
        Context.on(this.name + '.scale', (scale) => this.scale = scale);
        Context.on(this.name + '.alignment', (alignment) => this.alignment = alignment);
        Context.on(this.name + '.x', (x) => this.x = x);
        Context.on(this.name + '.y', (y) => this.y = y);

    }

    calc_parent() {

        if (!this.parent || this.parent === Root) return undefined;
        const { x, y } = alignment(this.parent.alignment, this.parent.x, this.parent.y, this.parent.scale, this.parent.calc_parent());

        return {
            x: x + this.parent.scale.get_width() / 2,
            y: y + this.parent.scale.get_height() / 2,
            width: this.parent.scale.get_width(),
            height: this.parent.scale.get_height(),
        }
    }

    draw() {
        const [colour, shade, transparency] = this.colour.split('.');

        let position = alignment(this.alignment, this.x, this.y, this.scale, this.calc_parent());
        let x = position.x, y = position.y;

        X.fillStyle = Colours[colour][shade];
        if (transparency) X.globalAlpha = transparency / 100;

        X.fillRect(x, y, this.scale.get_width(), this.scale.get_height());

        // Clean up
        X.globalAlpha = 1;

    }
}

class Button extends Pane {
    constructor(name, text, colour, x, y, scale, alignment, parent) {

        super(name, colour, x, y, scale, alignment, parent);

        this.text = text;
        this.type = 'button';

        Context.on(this.name + '.text', (text) => this.text = text);

    }

    draw() {
        const [colour, shade, transparency] = this.colour.split('.');

        let position = alignment(this.alignment, this.x, this.y, this.scale, this.calc_parent());
        let x = position.x, y = position.y;

        X.fillStyle = Colours[colour][shade];
        if (transparency) X.globalAlpha = transparency / 100;

        X.fillRect(x, y, this.scale.get_width(), this.scale.get_height());
        X.globalAlpha = 1;

        X.fillStyle = '#ffffff';
        X.font = '30px Arial';
        X.textAlign = 'center';
        X.textBaseline = 'middle';

        X.fillText(this.text, x + this.scale.get_width() / 2, y + this.scale.get_height() / 2);

    }

}