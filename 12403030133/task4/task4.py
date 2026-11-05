import math
import time

from common import connect_redis, print_json


SID = "12403030133"
S = 33
C = 3
N = 1000 + 100 * C + S
Q = 100
PREFIX = "exam:" + SID + ":"
SEQ_PREFIX = PREFIX + "seq:"
PIPE_PREFIX = PREFIX + "pipe:"


def batches(values, batch_size):
    for start in range(0, len(values), batch_size):
        yield values[start:start + batch_size]


def clear_prefix(client, key_prefix):
    keys = list(client.scan_iter(match=key_prefix + "*", count=500))
    for group in batches(keys, Q):
        pipe = client.pipeline(transaction=False)
        for key in group:
            pipe.delete(key)
        pipe.execute()


def value_for(index):
    return "value-" + SID + "-" + str(index)


def write_one_by_one(client, key_prefix):
    responses = []
    started = time.perf_counter()
    for index in range(1, N + 1):
        responses.append(client.set(key_prefix + str(index), value_for(index)))
    elapsed_ms = (time.perf_counter() - started) * 1000
    if not all(responses):
        raise RuntimeError("逐条写入存在失败响应")
    return elapsed_ms


def write_with_pipeline(client, key_prefix):
    responses = []
    batch_sizes = []
    started = time.perf_counter()
    for start in range(1, N + 1, Q):
        end = min(start + Q - 1, N)
        pipe = client.pipeline(transaction=False)
        for index in range(start, end + 1):
            pipe.set(key_prefix + str(index), value_for(index))
        batch_response = pipe.execute()
        responses.extend(batch_response)
        batch_sizes.append(end - start + 1)
    elapsed_ms = (time.perf_counter() - started) * 1000
    if len(responses) != N or not all(responses):
        raise RuntimeError("Pipeline写入存在失败响应")
    return elapsed_ms, batch_sizes


def verify_data(client, key_prefix):
    actual_keys = set(client.scan_iter(match=key_prefix + "*", count=500))
    expected_keys = {key_prefix + str(index) for index in range(1, N + 1)}
    checked_values = 0
    incorrect_values = []
    for index in range(1, N + 1):
        key = key_prefix + str(index)
        if client.get(key) == value_for(index):
            checked_values += 1
        elif len(incorrect_values) < 5:
            incorrect_values.append(key)
    return {
        "keyCount": len(actual_keys),
        "keySetComplete": actual_keys == expected_keys,
        "valuesChecked": checked_values,
        "incorrectValueKeys": incorrect_values,
        "passed": actual_keys == expected_keys and checked_values == N,
    }


client = connect_redis()
clear_prefix(client, SEQ_PREFIX)
clear_prefix(client, PIPE_PREFIX)

sequential_ms = write_one_by_one(client, SEQ_PREFIX)
pipeline_ms, batch_sizes = write_with_pipeline(client, PIPE_PREFIX)
sequential_check = verify_data(client, SEQ_PREFIX)
pipeline_check = verify_data(client, PIPE_PREFIX)

batch_count = math.ceil(N / Q)
last_batch_size = N - Q * (batch_count - 1)
batch_check = (
    len(batch_sizes) == batch_count
    and sum(batch_sizes) == N
    and all(size == Q for size in batch_sizes[:-1])
    and batch_sizes[-1] == last_batch_size
)
if abs(sequential_ms - pipeline_ms) <= max(sequential_ms, pipeline_ms) * 0.05:
    comparison = "两种方式实测差异不明显（差值不超过5%）。"
    explanation = "本机网络往返时间、Redis集群节点分布、Pipeline批次构造开销和运行时负载都会影响耗时。"
elif pipeline_ms < sequential_ms:
    comparison = "普通Pipeline实测更快。"
    explanation = "批量发送减少了客户端与Redis节点之间的往返次数。"
else:
    comparison = "逐条写入实测更快。"
    explanation = "本机往返延迟较低时，Pipeline批次构造和集群分发开销会影响总耗时。"

print_json({
    "N": N,
    "Q": Q,
    "commandCount": N,
    "pipelineBatchCount": len(batch_sizes),
    "expectedBatchCount": batch_count,
    "lastBatchCount": batch_sizes[-1],
    "expectedLastBatchCount": last_batch_size,
    "batchVerificationPassed": batch_check,
    "sequentialElapsedMs": round(sequential_ms, 3),
    "pipelineElapsedMs": round(pipeline_ms, 3),
    "sequentialVerification": sequential_check,
    "pipelineVerification": pipeline_check,
    "comparison": comparison,
    "explanation": explanation,
    "passed": batch_check and sequential_check["passed"] and pipeline_check["passed"],
})
client.close()
