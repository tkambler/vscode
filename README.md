# VSCode

This Docker image extends upon the base image provided by [coder.com](https://coder.com/). It includes a number of applications, utilities, and VSCode extensions that I find myself frequently using. Fork and alter as needed.

It comes with the following applications / libraries pre-installed on Ubuntu 18.04.1 LTS:

- [Node 10.15.3](https://nodejs.org/en/)
- [npm@latest](https://www.npmjs.com)
- [webdiff](https://github.com/danvk/webdiff)
- [gitcheck](https://github.com/badele/gitcheck)
- [GraphicsMagick](http://www.graphicsmagick.org/)
- [git](https://git-scm.com)
- [htop](https://hisham.hm/htop/)
- [Python 2.7.15](https://www.python.org)
- [PHP 7.1](https://www.php.net)
- [Composer 1.8.4](https://getcomposer.org)
- [Docker](https://www.docker.com)
- [MySQL Client](https://www.mysql.com)

Comes pre-configured with the following extensions:

  - Docker
  - GitLens
  - Log Viewer
  - .editorconfig
  - Prettier
  - npm
  - PHP debugger
  - GraphQL for VSCode
  - YAML
  - VSCode Icons / Material Theme

## Building the Image

Clone and run:

    make

### Pre-configuring VSCode with Your Preferred Settings / Extensions

    - Build the image and start a new container instance.
    - Make the necessary changes using VSCode's interface.
    - Copy the contents of the container's `/home/coder/.local` folder to `./files/vscode-local`.
    - Stop the container and re-build the image.

## Starting a Container

    docker run -p "127.0.0.1:8443:8443" --rm tkambler/code-server:latest

### Mounting a Folder into the Workspace

    docker run -p "127.0.0.1:8443:8443" --rm -v $(pwd):/home/coder/project tkambler/code-server:latest
