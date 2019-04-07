.DEFAULT_GOAL := build
CODE_SERVER := ./code-server
IMAGE_NAME := tkambler/code-server

build: $(CODE_SERVER)
	@echo "Building Docker image"
	cd code-server && docker build -t codercom/code-server:latest . && cd ../
	docker build -t $(IMAGE_NAME) .

$(CODE_SERVER):
	git clone https://github.com/codercom/code-server.git
