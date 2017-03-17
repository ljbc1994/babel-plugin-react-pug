# babel-plugin-react-pug

> Chuck out JSX and use Pug!

**WARNING This project is still in active development**

## Example

### In

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
#profile(className="profile__container")
    h1(className="profile__name") ${this.state.name}
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