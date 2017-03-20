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
            #component ${ this.state.list.map((item) => pug`li Hello!` }
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