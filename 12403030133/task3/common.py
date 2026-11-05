import json
import os
import sys

from redis.cluster import RedisCluster

sys.stdout.reconfigure(encoding="utf-8")


def connect_redis():
    options = {
        "host": os.getenv("REDIS_HOST", "127.0.0.1"),
        "port": int(os.getenv("REDIS_PORT", "30133")),
        "decode_responses": True,
    }
    username = os.getenv("REDIS_USERNAME")
    password = os.getenv("REDIS_PASSWORD")
    if username:
        options["username"] = username
    if password:
        options["password"] = password
    client = RedisCluster(**options)
    client.ping()
    return client


def print_json(value):
    print(json.dumps(value, ensure_ascii=False, indent=2), flush=True)
