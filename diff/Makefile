help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

check-repo-url: ## Checks required environment variable: DOCKER_REPO_URL
ifndef DOCKER_REPO_URL
	$(error DOCKER_REPO_URL is undefined)
endif
check-ecr-name: ## Checks required environment variable: DOCKER_ECR_NAME
ifndef DOCKER_ECR_NAME
	$(error DOCKER_ECR_NAME is undefined)
endif

build: ## build docker image
build: check-ecr-name
	docker build -t ${DOCKER_ECR_NAME}:latest .

tag:## tag docker image
tag: check-repo-url check-ecr-name
	docker tag ${DOCKER_ECR_NAME}:latest ${DOCKER_REPO_URL}:latest

push: ## pushes docker image to repo
push: check-repo-url
	docker push ${DOCKER_REPO_URL}:latest