# [One Dark Pro](https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme)

Atom's iconic One Dark theme, and one of the most downloaded [themes](https://marketplace.visualstudio.com/search?target=VSCode&category=Themes&sortBy=Downloads) for VS Code!

[GitHub repository](https://github.com/Binaryify/OneDark-Pro)


![screenshot](https://i.imgur.com/4xrtS6m.png)


# CHANGELOG

[CHANGELOG.MD](https://github.com/Binaryify/OneDark-Pro/blob/master/CHANGELOG.md)

# Sponsors
[![codestream](https://alt-images.codestream.com/codestream_logo_onedarkpro.png)](https://codestream.com/?utm_source=vscmarket&utm_medium=banner&utm_campaign=onedarkpro)  

Discuss, review, and share code with your team in VS Code. Links discussions about code to your code. Integrates w/ Slack, Jira, Trello, and Live Share.  [Try it free](https://codestream.com/?utm_source=vscmarket&utm_medium=banner&utm_campaign=onedarkpro).

# Docs & Contribute

This document
([https://binaryify.github.io/OneDark-Pro/](https://binaryify.github.io/OneDark-Pro/))
includes instructions on how to install and edit the theme.

To help with documentation, first fork and clone this repository.

`cd` to the `OneDark-Pro` folder

Run `npm install`

Then run
`npm run docs` to serve the documentation
locally at `localhost:3000`.

# ScreenShot

![Screenshot](https://ws3.sinaimg.cn/large/006tNbRwgy1fvwkr6i199j31kw16otat.jpg)

![Screenshot](https://ws2.sinaimg.cn/large/006tNbRwgy1fvwkrv2rorj31kw16odhw.jpg)

![ScreenShot](https://raw.githubusercontent.com/Binaryify/OneDark-Pro/master/static/screenshot1.png)

![ScreenShot](https://raw.githubusercontent.com/Binaryify/OneDark-Pro/master/static/php.png)

![ScreenShot](https://raw.githubusercontent.com/Binaryify/OneDark-Pro/master/static/screenshot2.png)

![ScreenShot](https://raw.githubusercontent.com/Binaryify/OneDark-Pro/master/static/js.png)

![ScreenShot](https://raw.githubusercontent.com/Binaryify/OneDark-Pro/master/static/cpp.png)

## Tweaks &  theming

If you want to play around with new colors, use the setting
`workbench.colorCustomizations` to customize the currently selected theme. For
example, you can add this snippet in your "settings.json" file:

```json
"workbench.colorCustomizations":{
    "tab.activeBackground": "#282c34",
    "activityBar.background": "#282c34",
    "sideBar.background": "#282c34"
}
```

or use the setting `editor.tokenColorCustomizations`

```json
"editor.tokenColorCustomizations":{
    "[One Dark Pro]": {
      "textMateRules": [
        {
          "scope":["source.python"],
          "settings": {
            "foreground": "#e06c75"
          }
        }
      ]
    }
}
```
[more info](https://binaryify.github.io/OneDark-Pro)

Please check the official documentation,
[Theme Color Reference](https://code.visualstudio.com/docs/getstarted/theme-color-reference) and 
[Theme Color](https://code.visualstudio.com/docs/getstarted/themes), for more helpful information.


![setting.json](https://ws4.sinaimg.cn/large/006tNbRwgy1fvwjoqnbtgj31kw101whv.jpg)

![custom](https://ws3.sinaimg.cn/large/006tNbRwgy1fvwjpwnq7bj30qu14w3zr.jpg)

[More info](https://code.visualstudio.com/updates/v1_15#_user-definable-syntax-highlighting-colors)

## Contributors
This project exists thanks to all the people who contribute. 
[![Contributors](https://opencollective.com/OneDark-Pro/contributors.svg?width=890)](https://github.com/Binaryify/OneDark-Pro/graphs/contributors)


## Backers

 [[Become a backer](https://opencollective.com/onedark-pro#backer)]

<a href="https://opencollective.com/onedark-pro#backers" target="_blank"><img src="https://opencollective.com/onedark-pro/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/onedark-pro#sponsor)]