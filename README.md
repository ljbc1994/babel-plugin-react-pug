# babel-plugin-react-pug

> Chuck out JSX and use Pug!

[![Build Status](https://travis-ci.org/ljbc1994/babel-plugin-react-pug.svg?branch=master)](https://travis-ci.org/ljbc1994/babel-plugin-react-pug)
[![Coverage Status](https://coveralls.io/repos/github/ljbc1994/babel-plugin-react-pug/badge.svg?branch=master)](https://coveralls.io/github/ljbc1994/babel-plugin-react-pug?branch=master)
[![dependencies Status](https://david-dm.org/ljbc1994/babel-plugin-react-pug/status.svg)](https://david-dm.org/ljbc1994/babel-plugin-react-pug)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![NPM Downloads](https://img.shields.io/npm/dm/babel-plugin-react-pug.svg?style=flat)](https://www.npmjs.com/package/babel-plugin-react-pug)

A tiny, performant babel plugin that lets you use Pug over JSX, giving you a productive and readable alternative for defining React Component templates. In essence, the plugin transforms Pug templates into React function calls. Supports React Native!

> This is not the official Pug plugin for converting Pug into JSX. Please see [babel-plugin-transform-react-pug](https://github.com/pugjs/babel-plugin-transform-react-pug)!

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

`babel-plugin-react-pug` supports Pug features that make the most sense when using Pug as a template language for React. 

### Attributes

#### Class

Using the pug class syntax will automatically rename the attribute to `className` - so you won't have to worry about this!

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            .profile__card
        `
    }
}
```

#### Other Attributes / Events

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            #profile__01.profile__card(title="Profile Title")
        `
    }
}
```

...or with interpolations:

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            #profile__01.profile__card(onClick=${ this.update })
        `
    }
}
```

### Conditionals

```js
class ProfileList extends React.Component {
    ...
    render() {
        return this.state.profiles.length
            ? pug`ul#profile__list Your list of profiles.`
            : pug`p.profile__error An error has occurred.`
    }
}
```

### Loops

```js
class ProfileList extends React.Component {
    ...
    render() {
        return pug`
            ul#profile__list ${ this.state.profiles.map((item) => pug`li ${item.name}`) }
        `
    }
}
```

### Components

To include components you don't need to use interpolation, just ensure that the component name is capitalised. For example:

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            ProfileCard(cardImage=${ this.state.imgSrc })
        `
    }
}
```

### Include

You can include pug templates into your components, for example say you have `tpls/profile-footer.pug`:

```html
.profile__footer
    .profile__footer__img
        img(src="http://placehold.it/200x200")
```

...now you can include the file in the component:

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            .profile__container
                h1.profile__title ${ this.state.title }
                .profile__body
                    h2.profile__subtitle ${ this.state.subtitle }
                include ./tpls/profile-footer.pug
        `
    }
}
```

### Extends

You can harness the awesome power of Pug's `extends` to have component template inheritance!

For example, you could specify a base component template (`tpls/base-profile.pug`):

```html
.profile__container
    .profile__header
    block content
.profile__footer
    h3 This is the footer!
    block footer
    p This is the sub footer text!
```

...now reference this in the component:  

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            extends ./tpls/base-profile.pug
            block content
                h2.profile__title ${ this.state.title }
            block footer
                ul.profile__links ${ this.state.links.map((link) => pug`li.link ${ link }`) } 
        `
    }
}
```

#### Block append / prepend

You can also use `append`  and `prepend` blocks in your React components.

For example, if you have the following base component template (`tpls/base-profile.pug`):

```html
.profile__container
    block content
        h1.profile__title Profile
.profile__footer
    h3 This is the footer!
    block footer
    p This is the sub footer text!
```

...now reference this in the component, with the added keyword `append` to the block:

```js
class Profile extends React.Component {
    ...
    render() {
        return pug`
            extends ./tpls/base-profile.pug
            block append content
                h2.profile__name ${ this.state.name }
            block footer
                ul.profile__links ${ this.state.links.map((link) => pug`li.link ${ link }`) } 
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

### Via Node API

```sh
require('babel-core').transform('code', {
    plugins: ['react-pug']
});
```

### React Native

Just install `babel-plugin-react-pug` in your React Native project, add `react-pug` to your `.babelrc` and bam!

```js
{
    "presets": ["react-native"], 
    "plugins": ["react-pug"]
}
```

## Issues and Potential Features

If you have any issues or bugs concerning `babel-plugin-react-pug`, please do not hesitate to raise an issue!

Furthermore, if there are any features in Pug that you feel would be awesome to have - please raise an issue and I'll get back to you! 

## Contributions

Any sort of contribution is welcome, just follow these steps:

1. Fork the repo
2. Create a feature branch `git checkout -b new-feature`
3. Ensure the code meets the `standard` code style - just run `npm run static-test`
4. Write a `fixture` test
5. Commit and push your changes
6. Submit a pull request!

## Licence

MIT