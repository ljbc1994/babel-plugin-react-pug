# babel-plugin-react-pug

> Chuck out JSX and use Pug!

**WARNING: This project is still in active development**

## Example

### In

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            #profile.profile__container
            h1.profile__name ${this.state.name}
        `
    }
}
```

### Out

```js
class Profile extends React.Component {
    ...
    render() {
        return React.createElement('div', { id: 'profile', className: 'profile__container' },
            React.createElement('h1', { className: 'profile__name' }, this.state.name));
    }
}
```

## Installation

```sh
$ yarn add babel-plugin-react-pug --dev
```

## Features

### Attributes

#### Class

Using the pug class syntax will automatically rename the attribute to `className` - so you won't have to worry about this!

```js
class Component extends React.Component {
    ...
    render() {
        return pug`
            .component__element
        `
    }
}
```

#### Other Attributes / Events

```js
class Component extends React.Component {
    ...
    render() {
        return pug`
            #component-id.component__class(componentAttr="componentVal")
        `
    }
}
```

...or with interpolations:

```js
class Component extends React.Component {
    ...
    render() {
        return pug`
            #component-id.component__class(onClick=${ this.state.updateComponent })
        `
    }
}
```

### Loops

```js
class Component extends React.Component {
    ...
    render() {
        return pug`
            #component ${ this.state.list.map((item) => pug`li Hello!`) }
        `
    }
}
```

### Components

To include components you don't need to use interpolation, just ensure that the component name is capitalised. For example:

```js
class Component extends React.Component {
    ...
    render() {
        return pug`
            OtherComponent(attrKey="attrValue")
        `
    }
}
```

### Include

You can include pug templates into your components, for example say you have `tpls/component-footer.pug`:

```html
.component__footer
    h4.component__footer__title This is the footer!
```

...Now you can include the file in the component:

```js
class Component extends React.Component {
    ...
    render() {
        return pug`
            .component__container
                h2.component__title ${ this.state.title }
                .component__body
                    h1.component__subtitle ${ this.state.subtitle }
                include ./tpls/component-footer.pug
        `
    }
}
```

### Extend

You can harness the awesome power of Pug's `extends` to have component template inheritance!

For example, you could specify a base component template (`tpls/base-component.pug`):

```html
.component__container
    block content
.component__footer
    h3 This is the footer!
    block footer
    p This is the sub footer text!
```

...Now reference this in the component:  

```js
class Component extends React.Component {
    ...
    render() {
        return pug`
            extends ./tpls/base-component.pug
            block content
                h2.component__title ${ this.state.title }
            block footer
                .footer__links ${ this.state.links.map((link) => pug`.link ${ link }`) } 
        `
    }
}
```

## Usage

### Via .babelrc

```js
{
    "plugins": ["react-pug"]
}
```

### Via CLI

```sh
$ babel --plugins react-pug index.js
```

## Licence

MIT