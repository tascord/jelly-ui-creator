// C, X

const Root = new Renderable();
let selected = Root;

document.querySelector('.button').onclick = () => {
    document.querySelector('.button').classList.toggle('closed');
    document.querySelector('nav').classList.toggle('closed');
}

const wu = document.getElementById('width-units');
const hu = document.getElementById('height-units');
const wm = document.getElementById('width-min');
const hm = document.getElementById('height-min');
const p = document.getElementById('parent');
const a = document.getElementById('alignment');
const c = document.getElementById('colour');
const t = document.getElementById('text');
const x = document.getElementById('x');
const y = document.getElementById('y');

const s = document.getElementById('selected');
const i = document.getElementById('items');

const p_ = document.getElementById('palette');

function select(node) {

    selected = node;
    update();

    if (selected === Root) {
        s.innerText = 'Root';
        wu.disabled = true;
        hu.disabled = true;
        wm.disabled = true;
        hm.disabled = true;
        x.disabled = true;
        y.disabled = true;
        p.disabled = true;
        a.disabled = true;
        c.disabled = true;
        t.disabled = true;
        return;
    } else {
        wu.disabled = false;
        hu.disabled = false;
        wm.disabled = false;
        hm.disabled = false;
        x.disabled = false;
        y.disabled = false;
        p.disabled = false;
        a.disabled = false;
        c.disabled = false;
        t.disabled = node.text === undefined;
    }

    s.innerText = node.name?.toString() ?? 'Unknown node';
    wu.value = node.scale.unit_width?.toString() ?? '0';
    hu.value = node.scale.unit_height?.toString() ?? '0';
    wm.value = node.scale.min_width?.toString() ?? '0';
    hm.value = node.scale.min_height?.toString() ?? '0';
    c.value = node.colour?.toString() ?? '';
    a.value = node.alignment?.toString() ?? '';
    x.value = node.x?.toString() ?? '';
    y.value = node.y?.toString() ?? '';

    if(t.text) t.innerText = node.text;

    const self = [...p.children].find(p => p.value === node.name);
    if (self && self.delete) self.delete();

    const parent = [...p.children].find(p => p.value === node.parent)
    if (parent) parent.selected = true;

    p.value = node.parent === Root ? 'root' : node.parent.name;

}

function update() {

    while (i.firstChild) {
        i.removeChild(i.firstChild);
    }

    while (p.firstChild) {
        p.removeChild(p.firstChild);
    }

    const item = document.createElement('li');
    item.innerText = 'Root';
    item.onclick = () => select(Root);
    i.appendChild(item);

    const option = document.createElement('option');
    option.value = 'root';
    option.innerText = 'Root';
    p.appendChild(option);

    propagate(Root, (child => {
        if (!child.name) return;

        const del = document.createElement('button');
        del.innerText = 'Delete';
        del.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            child.parent.children = child.parent.children.filter(child => child.name !== child.name);
            select(child.parent);
        }

        const item = document.createElement('li');
        item.innerText = child.name;
        item.onclick = () => select(child);
        item.appendChild(del);
        i.appendChild(item);

        const option = document.createElement('option');
        option.value = child.name;
        option.innerText = child.name;
        p.appendChild(option);

    }));

}

select(Root);

for (const part of Object.keys(Parts)) {
    const option = document.createElement('option');
    option.innerText = 'New ' + part;
    option.value = part;
    p_.appendChild(option);
}

document.getElementById('create').onclick = () => {

    const part_name = p_.value;
    const part = Parts[part_name];

    const name = prompt(`New ${part_name} name. (MUST BE UNIQUE)`);
    if (!name) return alert(`No name provided. Aborting.`);

    const node = new part({
        name,
        colour: 'navy.200.100',
        alignment: a.value
    });

    selected.add_child(node);
    select(node);

}

// Handlers

wu.onchange = (e) => selected.scale.unit_width = parseFloat(e.target.value);
hu.onchange = (e) => selected.scale.unit_height = parseFloat(e.target.value);
wm.onchange = (e) => selected.scale.min_width = parseFloat(e.target.value);
hm.onchange = (e) => selected.scale.min_height = parseFloat(e.target.value);

a.onchange = (e) => selected.alignment = e.target.value;
c.onchange = (e) => selected.colour = e.target.value;
t.onchange = (e) => selected.text = e.target.value;

x.onchange = (e) => selected.x = parseFloat(e.target.value);
y.onchange = (e) => selected.y = parseFloat(e.target.value);

// Parent
p.onchange = (e) => {

    if (e.target.value === 'root') {
        const old_parent = selected.parent;
        selected.parent = Root;
        old_parent.children = old_parent.children.filter(child => child !== selected);
    }

    propagate(Root, (child => {

        if (!child.name) return;
        if (child.name !== e.target.value) return;

        // Store old parent
        const old_parent = selected.parent;

        // Add to new parent
        selected.parent = child;

        // Remove from old parent
        old_parent.children = old_parent.children.filter(child => child.name !== selected.name);

    }));

}

