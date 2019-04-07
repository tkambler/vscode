# VSCode

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
