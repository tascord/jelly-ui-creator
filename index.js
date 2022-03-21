const C = document.querySelector('canvas'), X = C.getContext('2d');
let MX = 0, MY = 0;
let UNITS = 0;

const resize = () => {
    const { width, height } = C.getBoundingClientRect();

    C.width = width;
    C.height = height;

    UNITS = (width + height) / 2 / 100;

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
        } else {
            Context.emit(child.name + '.unhover', { x, y });
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
if (image) {
    image.onload = () => {
        loaded = true;
        image.style.display = 'none';
    }
}

resize();
setInterval(() => {

    X.clearRect(0, 0, C.width, C.height);
    if (loaded) X.drawImage(image, 0, 0, C.width, C.height);

    Root.render_path();

}, 150);

function scaled({ unit_width, unit_height, min_width, min_height }) {
    return {

        unit_width,
        unit_height,

        min_width,
        min_height,

        get_width: function () { return Math.max(this.unit_width * UNITS, this.min_width) },
        get_height: function () { return Math.max(this.unit_height * UNITS, this.min_height) },

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

                width: [c.scale.unit_width, c.scale.min_width],
                height: [c.scale.unit_height, c.scale.min_height],

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
}

function import_data(data) {
    const { root } = JSON.parse(data);

    const parse = (children, parent) => children.map(c => {

        console.log(`PARSE`, children, parent);

        let type;

        if (c.type === 'pane') type = Pane;
        else throw new Error('Unknown type: ' + c.type);

        const [unit_width, min_width] = c.width;
        const [unit_height, min_height] = c.height;

        const scale = scaled({ unit_width, unit_height, min_width, min_height });

        const element = new type({
            name: c.name,
            colour: c.colour,
            x: c.x, y: c.y,
            scale: scale,
            alignment: c.alignment,
            parent: parent
        });

        element.children = parse(c.children ?? [], element);
        return element;

    })

    Root.children = parse(root.children, Root);
    select(Root);

}

document.getElementById('import').onclick = () => {
    import_data(prompt('Paste JSON data here'));
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

/** --------------------------------- **/

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
    constructor({ name, colour, x, y, scale, alignment, parent }) {
        super(parent);
        this.type = 'pane';

        this.x = x ?? 0;
        this.y = y ?? 0;

        this.name = name;
        this.colour = colour ?? 'navy.300.100';
        this.scale = scale ?? scaled({ unit_width: 1, unit_height: 1, min_width: 1, min_height: 1 });
        this.alignment = alignment ?? 'center-center';

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
    constructor({ name, text, colour, x, y, scale, alignment, parent }) {

        super({ name, colour, x, y, scale, alignment, parent });

        this.text = text ?? 'Button';
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

const Parts = {
    "Pane": Pane,
    "Button": Button
}