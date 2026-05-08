COMPOSE_DEV_FILE = ./containers/docker-compose.dev.yml

COMPOSE = docker compose
UP = up --build
DOWN = down
LOGS = logs -f

.PHONY: dev_up down logs clean fclean

dev_up:
	$(COMPOSE) -f $(COMPOSE_DEV_FILE) $(UP)

down:
	$(COMPOSE) -f $(COMPOSE_DEV_FILE) $(DOWN)

logs:
	$(COMPOSE) -f $(COMPOSE_DEV_FILE) $(LOGS)

clean: down
	docker system prune -af

fclean: clean
	docker volume prune -af