---
id: installation
title: Installation
---

1. Checkout the repository
2. Navigate to the `react` folder and run:

    ```shell-session
    npm install
    npm run build
    cp dist/* ../express/static/dist/
    ```

3. Navigate to the `express` folder
4. Edit the Dockerfile to setup your environment [variables](environmental-variables.md)
5. Run:

    ```shell-session
    docker build --tag=basset .
    docker run --network="basset-network" --name="basset" basset
    docker exec -t basset node ./commands/migrate.js
    ```

6. Navigate to the `diff` folder:
7. Edit the Docker to setup your environment [variables](environmental-variables.md)
8. Run:

    ```shell-session
    docker build --tag=basset-diff
    docker run --network="basset-network" --name="basset-diff" basset-diff workers.rabbitmq
    ```

> In order to run locally you must have RabbitMQ installed
