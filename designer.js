// C, X

const Root = new Renderable();

const base = new Pane(
    'base',
    'navy.900.75',
    0,
    0,
    scaled({ rem_width: 90, rem_height: 50, min_width: 20, min_height: 20, }),
    'center-center',
);

const button = new Button(
    'submit',
    'Hello world!',
    'navy.300.100',
    0, 0,
    scaled({ rem_width: 20, rem_height: 10, min_width: 20, min_height: 10, }),
    'center-center',
)

Context.on('submit.click', () => {
    Context.emit('submit.text', 'Goodbye, world!');
})

Context.on('submit.hover', () => {
    Context.emit('submit.colour', 'ochre.300.100');
})

Root.add_child(base);
base.add_child(button);

