// Draw rounded rect
function rounded_rect(x, y, width, height, radius) {
    X.beginPath();
    X.moveTo(x, y + radius);
    X.lineTo(x, y + height - radius);
    X.quadraticCurveTo(x, y + height, x + radius, y + height);
    X.lineTo(x + width - radius, y + height);
    X.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    X.lineTo(x + width, y + radius);
    X.quadraticCurveTo(x + width, y, x + width - radius, y);
    X.lineTo(x + radius, y);
    X.quadraticCurveTo(x, y, x, y + radius);
    X.fill();
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
    constructor({ name, colour, x, y, radius, scale, alignment, parent }) {
        super(parent);
        this.type = 'pane';

        this.x = x ?? 0;
        this.y = y ?? 0;

        this.name = name;
        this.colour = colour ?? 'navy.300.100';
        this.scale = scale ?? scaled({ unit_width: 1, unit_height: 1, min_width: 1, min_height: 1 });
        this.alignment = alignment ?? 'center-center';
        this.radius = radius ?? 5;

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

        rounded_rect(x, y, this.scale.get_width(), this.scale.get_height(), this.radius);

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

        rounded_rect(x, y, this.scale.get_width(), this.scale.get_height(), this.radius);
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