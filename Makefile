SHELL := /bin/bash
OPTIM := /Applications/ImageOptim.app/Contents/MacOS/ImageOptim 
IMG   := ./images
IMGS  := $(wildcard $(IMG)/*.png $(IMG)/*.jpg) 
ICON  := icon.png
SICON := $(IMG)/$(ICON)
FONT  := American-Typewriter-Bold
.POSIX:
.PHONY: buildall init
all: help

help: ## Show this help
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

push: ## Push plugin to github / upstream
	git push origin master

clean: ## Reset plugin to pristine state (including git stash)
	rm -rf dist node_modules package-lock.json
	git stash

buildclean: ## Reset plugin to pristine state (Also Images!)
	clean install build optim

# https://imageoptim.com/command-line.html
optim: ## reduce image sizes
	$(OPTIM) $(IMGS)

icon: ## create dev icon
	convert $(SICON) -gravity Center -font $(FONT)  -pointsize 80 -fill red -annotate 0 'DEV' $(ICON)

build: ## Build package
	npm run build

install: ## Install plugin dependencies
	npm install

init: ## Prepare plugin - install deps, build icons
	icon install